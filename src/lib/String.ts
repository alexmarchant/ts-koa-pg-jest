interface String {
  toUnderscore: () => string
  toCamel: () => string
}

String.prototype.toUnderscore = function(){
  return this.replace(/([A-Z])/g, function($1: string) {
    return '_'+$1.toLowerCase()
  })
}

String.prototype.toCamel = function(){
  return this.replace(/(\_[a-z])/g, function($1: string) {
    return $1.toUpperCase().replace('_','')
  })
}
