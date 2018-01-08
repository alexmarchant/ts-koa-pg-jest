import { Client, QueryResult } from 'pg'

export type QueryData = {[key: string]: any}

// Monkey patch in some logging
// var actualSubmit = Query.prototype.submit
// Query.prototype.submit = function() {
//   if (this.values) {
//     console.log(this.text, this.values)
//   } else {
//     console.log(this.text)
//   }
//   actualSubmit.apply(this, arguments)
// }

const client = new Client({})
client.connect()

export { client as Client }

export async function selectRow(tableName: string, data: QueryData): Promise<{[key: string]: string} | false> {
  const text = `
    SELECT * FROM ${tableName}
    WHERE ${queryKeyVariablePairs(data)}
    LIMIT 1
  `
  const result = await client.query(text, queryValues(data))
  if (result.rows.length > 0) {
    camelCaseResultKeys(result)
    return result.rows[0]
  } else {
    return false
  }
}

export async function insertRow(tableName: string, data: QueryData): Promise<{[key: string]: string} | false> {
  const text = `
    INSERT INTO ${tableName}(${queryKeys(data)})
    VALUES(${queryVariables(data)})
    RETURNING *
  `
  const result = await client.query(text, queryValues(data))
  if (result.rows.length > 0) {
    camelCaseResultKeys(result)
    return result.rows[0]
  } else {
    return false
  }
}

export async function deleteRow(tableName: string, data: QueryData): Promise<QueryResult> {
  const text = `
    DELETE FROM ${tableName}
    WHERE ${queryKeyVariablePairs(data)}
  `
  return client.query(text, queryValues(data))
}

export async function deleteAllRows(tableName: string): Promise<QueryResult> {
  return client.query(`
    DELETE FROM ${tableName}
  `)
}

export async function createTable(tableName: string, tableFields: string[]): Promise<QueryResult> {
  const queryTableFields = tableFields.join(', ')
  return client.query(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ${queryTableFields}
    )
  `)
}

function queryKeyVariablePairs(data: QueryData): string {
  return Object.keys(data)
    .map((key, index) => `${key}=$${index + 1}`)
    .join(' ')
}

function queryKeys(data: QueryData): string {
  return Object.keys(data)
    .map(key => key.toUnderscore())
    .join(', ')
}

function queryVariables(data: QueryData): string {
  return Object.keys(data)
    .map((prop, index) => `$${index + 1}`)
    .join(', ')
}

function queryValues(data: QueryData): any[] {
  return Object.keys(data)
    .map(key => data[key])
}

function camelCaseResultKeys(result: QueryResult) {
  result.rows.forEach((row) => {
    Object.keys(row).forEach(key => {
      let camelKey = key.toCamel()
      if (key !== camelKey) {
        row[camelKey] = row[key]
        delete row[key]
      }
    })
  })
}

