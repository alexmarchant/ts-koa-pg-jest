class Model {
  constructor(props) {
    for (const key in props) {
      this[key] = props[key]
    }
  }

  serialize() {
    return this.publicProperties()
      .reduce((propertyName, result) => {
        result[propertyName] = this[propertyName]
      }, {})
  }
  
  publicProperties() {
    return []
  }
}

export default Model
