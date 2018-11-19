class Taggen {
  constructor(type) {
    this.type = type && typeof type === 'string' && type.toLowerCase()
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
        obj[keys[0]] = Taggen.node(id, value)
      } else {
        throw new Error(`Invalid flag "${flag}"\n`)
      }
    } else {
      const key = keys.shift()

      obj[key] = Taggen.set_nested(typeof obj[key] === 'undefined' ? {} : obj[key], keys.join('.'), id, value, flag)
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
  			insides = `${inner ? `${children ? '\n' : ''}${children ? ind + ind : ''}${inner}` : ''}${children ? `\n${Taggen.looper(obj[prop].children, undefined, indentation + 1)}` : ''}${children ? ind : ''}`,
  			close = `</${name}>\n`


  			elements += `${open}${insides}${close}`
  	}

  	return elements
  }

  parent(name) {
    if (!name || typeof name !== 'string') {
      const msg = `The .parent() function takes a name <string> value\n`
      throw new Error(msg)
    }

    this.current_parent_node = `node${Object.keys(this.runner).length}`
    this.path = this.current_parent_node
    this.runner[this.current_parent_node] = Taggen.node(this.unique, name)
    this.unique ++

    return this
  }

  attr(obj) {
    if (Object.prototype.toString.call(obj) !== '[object Object]') {
      const msg = `The .attr() function takes an obj <object> value\n`
      throw new Error(msg)
    }

    if (Object.keys(Taggen.return_nested(this.path, this.runner).attributes).length) {
      const msg = `You cannot call .attr() on "${Taggen.return_nested(this.path, this.runner).name}" more than once\n`
      throw new Error(msg)
    }

    Taggen.set_nested(this.runner, `${this.path}.attributes`, null, obj, 'a')

    return this
  }

  inner(text) {
    if (!text || typeof text !== 'string') {
      const msg = `The .inner() function takes a text <string> value\n`
      throw new Error(msg)
    }

    Taggen.set_nested(this.runner, `${this.path}.inner`, null, text, 'i')

    return this
  }

  child(name) {
    if (!name || typeof name !== 'string') {
      const msg = `The .child() function takes a name <string> value\n`
      throw new Error(msg)
    }

    const node_copy = this.path
    this.path = `${node_copy}.children.node${Object.keys(Taggen.return_nested(`${node_copy}.children`, this.runner)).length}`

    Taggen.set_nested(this.runner, this.path, this.unique, name, 'c')
    this.unique ++

    return this
  }

  sibling(name, id) {
    if (typeof name !== 'string') {
      const msg = `The .sibling() function takes an name <string> value\n`
      throw new Error(msg)
    }

    if (id) {
      if (typeof id !== 'number') {
        const msg = `The .sibling() function takes an id <number> value\n`
        throw new Error(msg)
      }

      const path = Taggen.find_path(id, this.runner)

      if (path) {
        const updated_path = path.split('.').slice(0, path.split('.').length - 1).join('.')

        if (updated_path.split('.').length === 1) {
          const msg = `".sibling()" cannot be called at the parent level - use ".parent()" instead\n`
          throw new Error(msg)
        } else {
          this.path = `${updated_path}.node${Object.keys(Taggen.return_nested(updated_path, this.runner)).length}`

          Taggen.set_nested(this.runner, this.path, this.unique, name, 'c')
          this.unique ++
        }
      } else {
        const msg = `Unique id "${id}" could not be found in the current schema. Try running ".preview()"\n`
        throw new Error(msg)
      }
    } else {
      const updated_path = this.path.split('.').slice(0, this.path.split('.').length - 1).join('.')
      this.path = `${updated_path}.node${Object.keys(Taggen.return_nested(updated_path, this.runner)).length}`

      Taggen.set_nested(this.runner, this.path, this.unique, name, 'c')
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
      const msg = `You can only commit once per instance of Taggen\n`
      throw new Error(msg)
    } else {
      const beginning = this.type === 'xml'
        ? `<?xml version="1.0" encoding="UTF-8"?>\n`
        : this.type === 'html'
          ? `<!DOCTYPE html>\n`
          : ''
      this.product = `${beginning}${Taggen.looper(this.runner)}`
      return this
    }

    console.log('\nPRODUCT:\n' + this.product)
    return this
  }

  write(path) {
    if (this.product) {
      const fs = require('fs')
      const stream = fs.createWriteStream(path)

      stream.write(this.product)
      stream.end()
    } else {
      const msg = `Be sure to commit before trying to write (use ".commit()")\n`
      throw new Error(msg)
    }
  }

  html(path, options = {}) {
    this.current_parent_node = ''
    this.path = ''
    this.unique = 0
    this.runner = {}
    this.product = ''

    if (typeof path !== 'string' || !path.match(/.html/gi)) {
      const msg = `Please pass in a valid path - should contain a file designated as an .html ext file\n`
    }

    if (Object.prototype.toString.call(options) !== '[object Object]') {
      const msg = `Please make sure you pass in a valid object to the .html() method\n`
      throw new Error(msg)
    }

    console.warn(`Warning: Calling the .html() method will overwrite any structure that may have been created before\n`)

    const fs = require('fs')
    const opn = require('opn')
    const tg = new Taggen('html')

    tg.parent('html').child('head')

    options.title && tg.child('title').inner(options.title.toString())
    options.style && tg.sibling('link').attr({
      rel: 'stylesheet',
      type: 'text/css',
      href: options.style.toString()
    })
    options.script && tg.sibling('script').attr({
      type: 'text/javascript',
      src: options.script.toString()
    })

    tg
      .sibling('body', 1)
      .child('div')
      .attr({
        class: 'container'
      })
      .child('h1')
      .attr({
        id: 'title'
      })
      .inner(options.title ? options.title.toString() : 'New HTML Template')
      .sibling('p', Object.keys(options).length + 4)
      .inner('Thank you for using Taggen! If you find an issue with this \
              template generator, please be sure to submit an issue at \
              <a href="https://github.com/huntinghawk1415/taggen/issues" \
              target="_blank" rel="noopener noreferrer">\
              https://github.com/huntinghawk1415/taggen/issues</a>.')
      .commit()
      .write(path)

    const server = require('http').createServer()

    server
      .on('request', (request, response) => {
        const source = fs.createReadStream(path)
        source.pipe(response)
      })
      .listen(8000)

    opn('http://localhost:8000')
    console.log('Use ^C to close this generated server.')
  }
}

module.exports = Taggen
