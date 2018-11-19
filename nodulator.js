class Writer {
  constructor(type) {
    this.type = type
    this.current_parent_node = ''
    this.path = ''
    this.unique = 0
    this.runner = {}
    this.product = ''
  }

  static node(id, name) {
    return {
      name,
      attributes: {},
      children: {},
      inner: '',
      unique: id
    }
  }

  static return_nested(path, runner) {
    return path.split('.').reduce((obj, property) => obj[property], runner)
  }

  static set_nested(obj, keys, id, value, flag) {
    keys = keys.split('.')
    if (keys.length === 1) {
      if (flag === 'a' || flag === 'i') {
        obj[keys[0]] = value
      } else if (flag === 'c') {
        obj[keys[0]] = Writer.node(id, value)
      } else {
        throw new Error(`Invalid flag "${flag}"\n`)
      }
    } else {
      const key = keys.shift()

      obj[key] = Writer.set_nested(typeof obj[key] === 'undefined' ? {} : obj[key], keys.join('.'), id, value, flag)
    }

    return obj
  }

  static find_path(id, object, path = [], found = false) {
  	const searcher = obj => {
  		for (let prop in obj) {
  			path.push(prop)

  			if (obj[prop] === id && prop === 'unique') {
  				found = true
  				break
  			} else if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
  				searcher(obj[prop])
  				if (found) break
  			}

  			path.pop()
  		}
  	}

  	searcher(object)

  	return found ? path.slice(0, path.length - 1).join('.') : undefined
  }

  static looper(obj, elements = '', indentation = 0) {
  	for (let prop in obj) {
  		const
  			name = obj[prop].name,
  			attributes = Object.entries(obj[prop].attributes),
  			attrValues = attributes.length >= 1 ? attributes.map(attr => ` ${attr[0]}="${attr[1]}"`).join('') : '',
  			children = Object.entries(obj[prop].children).length,
  			inner = obj[prop].inner,
  			ind = Array.from(Array(indentation), x => '  ').join(''),
  			open = `${ind}<${name}${attrValues}>`,
  			insides = `${inner ? `${children ? '\n' : ''}${children ? ind + ind : ''}${inner}` : ''}${children ? `\n${Writer.looper(obj[prop].children, undefined, indentation + 1)}` : ''}${children ? ind : ''}`,
  			close = `</${name}>\n`


  			elements += `${open}${insides}${close}`
  	}

  	return elements
  }

  parent(name) {
    this.current_parent_node = `node${Object.keys(this.runner).length}`
    this.path = this.current_parent_node
    this.runner[this.current_parent_node] = Writer.node(this.unique, name)
    this.unique ++

    return this
  }

  attr(key, value) {
    Writer.set_nested(this.runner, `${this.path}.attributes.${key}`, null, value, 'a')

    return this
  }

  inner(text) {
    Writer.set_nested(this.runner, `${this.path}.inner`, null, text, 'i')

    return this
  }

  child(name) {
    const node_copy = this.path
    this.path = `${node_copy}.children.node${Object.keys(Writer.return_nested(`${node_copy}.children`, this.runner)).length}`

    Writer.set_nested(this.runner, this.path, this.unique, name, 'c')
    this.unique ++

    return this
  }

  sibling(name, id) {
    if (id) {
      const path = Writer.find_path(id, this.runner)

      if (path) {
        const updated_path = path.split('.').slice(0, path.split('.').length - 1).join('.')

        if (updated_path.split('.').length === 1) {
          const msg = `".sibling()" cannot be called at the parent level - use ".parent()" instead\n`
          throw new Error(msg)
        } else {
          this.path = `${updated_path}.node${Object.keys(Writer.return_nested(updated_path, this.runner)).length}`

          Writer.set_nested(this.runner, this.path, this.unique, name, 'c')
          this.unique ++
        }
      } else {
        const msg = `Unique id "${id}" could not be found in the current schema. Try running ".preview()"\n`
        throw new Error(msg)
      }
    } else {
      const updated_path = this.path.split('.').slice(0, this.path.split('.').length - 1).join('.')
      this.path = `${updated_path}.node${Object.keys(Writer.return_nested(updated_path, this.runner)).length}`

      Writer.set_nested(this.runner, this.path, this.unique, name, 'c')
      this.unique ++
    }

    return this
  }

  preview() {
    console.log('\nPREVIEW:\n' + JSON.stringify({
      parent: this.current_parent_node,
      current_path: this.path,
      current_schema: this.runner,
      product: this.product
    }, null, 2) + '\n')
    return this
  }

  commit() {
    if (this.product) {
      const msg = `You can only commit once per instance of Node Writer\n`
      throw new Error(msg)
    } else {
      const beginning = this.type === 'xml'
        ? `<?xml version="1.0" encoding="UTF-8"?>\n`
        : this.type === 'html'
          ? `<!DOCTYPE html>\n`
          : ''
      this.product = `${beginning}${Writer.looper(this.runner)}`
      return this
    }

    console.log('\nPRODUCT:\n' + this.product)
    return this
  }

  write(path) {
    if (this.product) {
      const fs = require('fs')

      fs.writeFile(path, this.product, error => error && console.error(error))
    } else {
      const msg = `Be sure to commit before trying to write (use ".commit()")\n`
      throw new Error(msg)
    }
  }
}
