class Writer {
  constructor() {
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
      if (flag === 'c') {
        obj[keys[0]] = Writer.node(id, value)
      } else if (flag === 'a') {
        obj[keys[0]] = value
      } else {
        throw new Error(`Invalid flag "${flag}"`)
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

  			if (obj[prop] === id) {
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
    // const node_copy = this.path
    // this.path = `${node_copy}`
    return this
  }

  preview() {
    console.log('\nPREVIEW:\n' + JSON.stringify({
      parent: this.current_parent_node,
      current_path: this.path,
      current_schema: this.runner
    }, null, 4) + '\n')
    return this
  }
}

const nw = new Writer()

nw
  .parent('MOM')
  .child('BOB')
  .parent('DAD')
  .child('TIM')
  .child('CINDY')
  .sibling('HI')
  .preview()
