import * as pg from 'pg'
import {
  insertRow,
  deleteRow,
  deleteAllRows,
  createTable,
} from '../lib/db'

export default abstract class Persistable {
  abstract tableFields: string[]
  abstract tableName: string
  abstract persistProperties(): {[property: string]: any}
  id?: number

  // Fake class methods

  async destroyAll(): Promise<pg.QueryResult> {
    return await deleteAllRows(this.tableName)
  }

  async createTable(): Promise<pg.QueryResult> {
    return await createTable(this.tableName, this.tableFields)
  }

  // Instance methods

  async save(): Promise<boolean> {
    try {
      await insertRow(this.tableName, this.persistProperties())
      return true
    } catch(err) {
      console.error(err)
      return false
    }
  }

  async destroy(): Promise<boolean> {
    if (typeof this.id !== 'number') {
      throw 'id can\'t be blank'
    }
    try {
      await deleteRow(this.tableName, this.id)
      return true
    } catch(err) {
      console.error(err)
      return false
    }
  }
}
