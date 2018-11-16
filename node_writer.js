class Writer {
  constructor() {
    this.current_parent_node = ''
    this.current_node = []
    this.runner = {}
    this.product = ''
  }

  static node(name) {
    return {
      name,
      attributes: {},
      children: {}
    }
  }

  static return_nested(iterable, runner) {
    return iterable.reduce((obj, property) => obj[property], runner)
  }

  static set_nested(obj, keys, value) {
    if (keys.length === 1) {
      obj[keys[0]] = value
    } else {
      const key = keys.shift()

      obj[key] = Writer.set_nested(typeof obj[key] === 'undefined' ? {} : obj[key], keys, value)
    }

    return obj
  }

  create_node(name) {
    this.current_parent_node = `node${Object.keys(this.runner).length}`
    this.current_node = [this.current_parent_node]
    this.runner[this.current_parent_node] = Writer.node(name)

    return this
  }

  set_attr(key, value) {
    Writer.set_nested(this.runner, [...this.current_node, 'attributes', key], value)

    return this
  }

  create_child(name) {
    this.current_node = [...this.current_node, 'children', `node${Object.keys(Writer.return_nested([...this.current_node, 'children'], this.runner)).length}`]
    Writer.set_nested(this.runner, this.current_node, Writer.node(name))

    return this
  }

  create_sibling(name) {

  }

  preview() {
    console.log(JSON.stringify(this.runner, null, 2))
    return this
  }
}

const nw = new Writer()

nw
  .create_node('?xml')
  .set_attr('asdf', 'fuckyou')
  .set_attr('yeah', 'fuck you too')
  .create_child('hello')
  .create_child('child of child')
  .preview()
  // .set_attr('Id', 'rId1')
  // .set_attr('Id', 'rId2')
  // .create_child('ChildHere')
  // .commit()
