export type Params = {[key: string]: any}

export default function(params: Params) {
  return {
    permit: function(permitParams: string[]) {
      return Object.keys(params)
        .filter(key => permitParams.includes(key))
        .reduce((obj, key) => {
          obj[key] = params[key]
          return obj
        }, <Params>{})
    },
  }
}
