export type Validation = <T extends Validatable>(
  obj: T,
  property: keyof T
) => boolean
export type Validations = {[property: string]: Validation[]}

export default abstract class Validatable {
  validations: {[property: string]: Validation[]} = {}
  errors: string[] = []

  valid(): boolean {
    this.errors = []
    let valid = true

    // Runs all validations and returns false
    // if any validation returned false
    for (let property in this.validations) {
      let funcs = this.validations[property]

      for (let func of funcs) {
        if (!func(this, property as keyof this)) {
          valid = false
        }
      }
    }

    return valid
  }
}

export function presence<T extends Validatable>(obj: T, property: keyof T): boolean {
  let valid = obj[property] ? true : false
  if (!valid) {
    obj.errors.push(`"${property}" can't be blank`)
  }
  return valid
}
