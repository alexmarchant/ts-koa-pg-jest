import * as pg from 'pg'
import * as Koa from 'koa'
import Persistable from './Persistable'
import Routable from './Routable'
import Serializable from './Serializable'
import Validatable, { Validation } from './Validatable'
import { applyMixins } from '../lib/applyMixins'
import { QueryData } from '../lib/db'

// Use this class for mixins then you can override functions
// in Model (without this you can't override default
// implements from mixins e.g. #save()

export default abstract class SuperModel
implements Persistable, Routable, Serializable, Validatable
{
  // Persistable
  abstract tableFields: string[]
  abstract tableName: string
  abstract persistProperties: () => {[property: string]: any}
  id?: number
  save: () => Promise<boolean>
  destroy: () => Promise<boolean>
  destroyAll: () => Promise<pg.QueryResult>
  createTable: () => Promise<pg.QueryResult>
  findOne: (params: QueryData) => Promise<this>
  beforeSave: () => Promise<void>
  handleQueryError: (err: Error) => void

  // Routable
  routes: (app: Koa) => void

  // Serializable
  abstract serialize: () => object
  json: () => string

  // Validatable
  validations: {[property: string]: Validation[]}
  errors: string[]
  valid: () => boolean
}
applyMixins(SuperModel, [Persistable, Routable, Serializable, Validatable])
