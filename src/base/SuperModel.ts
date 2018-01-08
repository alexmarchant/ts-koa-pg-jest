import Persistable from './Persistable'
import Serializable from './Serializable'
import Validatable, { Validation } from './Validatable'
import { applyMixins } from '../lib/applyMixins'
import { QueryData } from '../lib/db'

// Use this class for mixins then you can override functions
// in Model (without this you can't override default
// implements from mixins e.g. #save()

export default abstract class SuperModel
implements Persistable, Serializable, Validatable
{
  // Persistable
  static tableFields: string[]
  static tableName: string
  static findOne: (params: QueryData) => Promise<SuperModel | false>
  abstract persistProperties: () => {[property: string]: any}
  id?: number
  save: () => Promise<boolean>
  destroy: () => Promise<boolean>
  beforeSave: () => Promise<void>
  handleQueryError: (err: Error) => void
  'constructor': typeof SuperModel

  // Serializable
  abstract serialize: () => object
  json: () => string

  // Validatable
  validations: {[property: string]: Validation[]}
  errors: string[]
  valid: () => boolean
}
applyMixins(SuperModel, [Persistable, Serializable, Validatable])
