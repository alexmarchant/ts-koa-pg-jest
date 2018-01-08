import Validatable, { Validation } from './Validatable'
import {
  insertRow,
  deleteRow,
  selectRow,
  QueryData
} from '../lib/db'
import { applyMixins } from '../lib/applyMixins'

export default abstract class Persistable implements Validatable {
  static tableFields: string[]
  static tableName: string
  abstract persistProperties(): {[property: string]: any}
  id?: number
  'constructor': typeof Persistable

  static async findOne(params: QueryData): Promise<Persistable | false> {
    const result = await selectRow(this.tableName, params)
    if (result) {
      return new (this.constructor as any)(result)
    } else {
      return false
    }
  }

  async save(): Promise<boolean> {
    if (!this.valid()) { return false }
    await this.beforeSave()
    try {
      const result = await insertRow(this.constructor.tableName, this.persistProperties())
      if (result) {
        this.id = parseInt(result['id'])
        return true
      } else {
        return false
      }
    } catch(err) {
      this.handleQueryError(err)
      return false
    }
  }

  async destroy(): Promise<boolean> {
    if (!this.id && typeof this.id !== 'number') {
      throw new Error('id can\'t be blank')
    }
    try {
      await deleteRow(this.constructor.tableName, {id: this.id})
      return true
    } catch(err) {
      this.handleQueryError(err)
      return false
    }
  }

  // Callbacks

  async beforeSave(): Promise<void> { return }

  // Errors
  
  handleQueryError(err: Error): void {}

  // Validatable
  validations: {[property: string]: Validation[]} = {}
  errors: string[] = []
  valid: () => boolean
}
applyMixins(Persistable, [Validatable])


