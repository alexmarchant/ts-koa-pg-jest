import Model from '../model/Model'

export function presence<T extends Model>(obj: T, property: keyof T): boolean {
  let valid = obj[property] ? true : false
  if (!valid) {
    obj.errors.push(`"${property}" can't be blank`)
  }
  return valid
}
