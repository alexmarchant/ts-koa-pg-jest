import * as pg from 'pg'
import Validatable, { Validation } from './Validatable'
import {
  insertRow,
  deleteRow,
  deleteAllRows,
  createTable,
  selectRow,
  QueryData
} from '../lib/db'
import { applyMixins } from '../lib/applyMixins'

export default abstract class Persistable implements Validatable {
  abstract tableFields: string[]
  abstract tableName: string
  abstract persistProperties(): {[property: string]: any}
  id?: number

  // Fake class methods
  // look into maybe moving these out of the class

  async destroyAll(): Promise<pg.QueryResult> {
    return await deleteAllRows(this.tableName)
  }

  async createTable(): Promise<pg.QueryResult> {
    return await createTable(this.tableName, this.tableFields)
  }

  // Instance methods
  
  async findOne(params: QueryData): Promise<this> {
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
