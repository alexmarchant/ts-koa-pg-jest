const validations = {}

validations.require = (property) => {
  return function () {
    if (!this[property]) {
      this.count = this.count + 1 || 1
      this.errors.push(`"${property}" is required`)
      return false
    }
    return true
  }
}

export default validations
