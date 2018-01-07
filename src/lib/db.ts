import { Client, Query, QueryResult } from 'pg'

type QueryData = {[key: string]: any}

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

export async function selectRow<T>(tableName: string, data: QueryData): Promise<T> {
  const text = `
    SELECT * FROM ${tableName}
    WHERE ${queryKeyVariablePairs(data)}
    LIMIT 1
  `
  const response = await client.query(text, queryValues(data))
  return response.rows[0]
}

export async function insertRow(tableName: string, data: QueryData): Promise<QueryResult> {
  const text = `
    INSERT INTO ${tableName}(${queryKeys(data)})
    VALUES(${queryVariables(data)})
  `
  return client.query(text, queryValues(data))
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

export async function deleteRow(tableName: string, id: number): Promise<QueryResult> {
  const text = `
    DELETE FROM ${tableName}
    WHERE id=$1
  `
  return client.query(text, [id])
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
