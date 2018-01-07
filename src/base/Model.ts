import * as pg from 'pg'
import * as Koa from 'koa'
import Persistable from './Persistable'
import Routable from './Routable'
import Serializable from './Serializable'
import Validatable, { Validations } from './Validatable'
import { applyMixins } from '../lib/applyMixins'

export interface ModelProps {
  id?: number
}

export default abstract class Model
implements Persistable, Routable, Serializable
{
  constructor(props: ModelProps) {
    this.id = props.id
  }

  // Persistable
  abstract tableFields: string[]
  abstract tableName: string
  abstract persistProperties: () => {[property: string]: any}
  id?: number
  save: () => Promise<boolean>
  destroy: () => Promise<boolean>
  destroyAll: () => Promise<pg.QueryResult>
  createTable: () => Promise<pg.QueryResult>

  // Routable
  routes: (app: Koa) => void

  // Serializable
  abstract serialize: () => object
  json: () => string

  // Validatable
  abstract validations: Validations = <Validations>{}
  errors: string[] = []
  valid: () => boolean
}
applyMixins(Model, [Persistable, Routable, Serializable, Validatable])
