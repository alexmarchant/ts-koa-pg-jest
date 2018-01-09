import { Client, QueryResult } from 'pg'

export type QueryData = {[key: string]: any}

interface LogData {
  text: string
  values?: any[]
}

const logQueries = false

const client = new Client({})
client.connect()

export { client as Client }

if (logQueries) {
  const originalQuery = client.query as any
  (client.query as any) = function(queryText: string, values?: any[]): Promise<QueryResult> {
    let text = queryText.replace(/\s+|\\n/g, ' ')
    text = text.trim()
    const log: LogData = {
      text,
    }
    if (values) { log.values = values }
    return originalQuery(queryText, values)
  }
}

export async function selectRow(tableName: string, data: QueryData): Promise<{[key: string]: string} | false> {
  removeEmptyQueryData(data)
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
  removeEmptyQueryData(data)
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

export async function updateRow(tableName: string, id: number, data: QueryData): Promise<boolean> {
  removeEmptyQueryData(data)
  const text = `
    UPDATE ${tableName}
    SET ${queryKeyVariablePairs(data, true)}
    WHERE id=$${Object.keys(data).length + 1}
  `
  try {
    await client.query(
      text,
      [...queryValues(data), id]
    )
  } catch(e) { console.error(e) }
  return true
}

export async function deleteRow(tableName: string, data: QueryData): Promise<QueryResult> {
  removeEmptyQueryData(data)
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

export async function dropTable(tableName: string): Promise<QueryResult> {
  return client.query(`
    DROP TABLE ${tableName}
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

function removeEmptyQueryData(data: QueryData) {
  for (let key in data) {
    if (!data[key]) {
      delete data[key]
    }
  }
}

function queryKeyVariablePairs(data: QueryData, commas = false): string {
  return Object.keys(data)
    .map((key, index) => `${key.toUnderscore()}=$${index + 1}`)
    .join(commas ? ', ' : ' ')
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

