const params = {
  permittedKeys: null,
  permit: function(newPermittedKeys) {
    this.permittedKeys = newPermittedKeys

    return (params) => {
      return Object.keys(params)
        .reduce((accumulator, key) => {
          if (this.permittedKeys.includes(key)) {
            accumulator[key] = params[key]
          }
          return accumulator
        }, {})
    }
  },
}

export default params
