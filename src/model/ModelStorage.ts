import {
  insertRow,
  updateRow,
  deleteRow,
  selectRow,
  QueryData
} from '../lib/db'
import Model from './Model'

interface findable<T> {
  tableName: string
  new(...args: any[]):T
}

export async function findOne<T>(model: findable<T>, params: QueryData): Promise<T | false> {
   const result = await selectRow(model.tableName, params)
   if (result) {
     return new model(result)
   } else {
     return false
   }
}

export async function save<T extends Model>(instance: T): Promise<boolean> {
  if (instance.persisted()) {
    if (typeof instance.id !== 'number') { throw new Error('Model#id must be a number') }
    return await updateRow(
      instance.constructor.tableName,
      instance.id as number,
      instance.persistProperties()
    )
  } else {
    const result = await insertRow(
      instance.constructor.tableName,
      instance.persistProperties()
    )
    if (result) {
      instance.id = parseInt(result['id'])
      return true
    } else {
      return false
    }
  }
}

export async function destroy<T extends Model>(instance: T): Promise<boolean> {
  if (!instance.id && typeof instance.id !== 'number') {
    throw new Error('id can\'t be blank')
  }
  try {
    await deleteRow(instance.constructor.tableName, {id: instance.id})
    return true
  } catch(err) {
    return false
  }
}
