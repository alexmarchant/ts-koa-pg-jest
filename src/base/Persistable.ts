import Validatable, { Validation } from './Validatable'
import {
  insertRow,
  deleteRow,
  selectRow,
  QueryData
} from '../lib/db'
import { applyMixins } from '../lib/applyMixins'

export default abstract class Persistable implements Validatable {
  abstract tableFields: string[]
  abstract tableName: string
  abstract persistProperties(): {[property: string]: any}
  id?: number

  async findOne(params: QueryData): Promise<Persistable> {
    const result = await selectRow(this.tableName, params)
    return this.constructor(result)
  }

  async save(): Promise<boolean> {
    if (!this.valid()) { return false }
    await this.beforeSave()
    try {
      const result = await insertRow(this.tableName, this.persistProperties())
      this.id = parseInt(result['id'])
      return true
    } catch(err) {
      this.handleQueryError(err)
      return false
    }
  }

  async destroy(): Promise<boolean> {
    if (typeof this.id !== 'number') {
      throw new Error('id can\'t be blank')
    }
    try {
      await deleteRow(this.tableName, this.id)
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

