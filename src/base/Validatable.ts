export type Validation = (
  obj: Validatable,
  property: string
) => boolean
export type Validations = {[property: string]: Validation[]}

export default abstract class Validatable {
  abstract validations: Validations = <Validations>{}
  errors: string[] = []

  valid(): boolean {
    this.errors = []
    // Runs all validations and returns false if
    // if any are false
    return Object.keys(this.validations)
      .reduce((valid, property) => {
        const validationFuncs = this.validations[property]
        return validationFuncs
          .reduce((valid, func) => {
            if (!func(this, property)) {
              return false
            }
          }, valid)
      }, true)
  }

}

export function presence(obj: Validatable, property: string): boolean {
  let valid = obj.hasOwnProperty(property)
  if (!valid) {
    obj.errors.push(`"${property}" can't be null`)
  }
  return valid
}
