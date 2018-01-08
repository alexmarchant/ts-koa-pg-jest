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

export async function selectRow(tableName: string, data: QueryData): Promise<{[key: string]: string}> {
  const text = `
    SELECT * FROM ${tableName}
    WHERE ${queryKeyVariablePairs(data)}
    LIMIT 1
  `
  const response = await client.query(text, queryValues(data))
  return response.rows[0]
}

export async function insertRow(tableName: string, data: QueryData): Promise<{[key: string]: string}> {
  const text = `
    INSERT INTO ${tableName}(${queryKeys(data)})
    VALUES(${queryVariables(data)})
    RETURNING *
  `
  const response = await client.query(text, queryValues(data))
  return response.rows[0]
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
    .map((key, index) => `${key}=${index}`)
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

