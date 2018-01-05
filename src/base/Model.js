import db from '../lib/db'

class Model {
  static async creatTable() {
    await db.query(this._createTableQuery())
  }

  static async destroyAll() {
    await db.query(this._destroyAllQuery())
  }

  constructor(props) {
    for (const key in props) {
      this[key] = props[key]
    }
    this.errors = []
    this.validations = []
  }

  serialize() {
    return this.constructor._serializeProperties()
      .reduce((result, propertyName) => {
        result[propertyName] = this[propertyName]
        return result
      }, {})
  }

  valid() {
    let valid = true
    this.errors = []

    this.validations.forEach((validation) => {
      validation = validation.bind(this)
      if (validation() === false)  {
        valid = false
      }
    })

    return valid
  }

  async save() {
    if (this.valid()) {
      try {
        await db.query(this._createQuery())
      } catch(err) {
        this.errors.push(err.detail)
        return Promise.resolve(false)
      }
      return Promise.resolve(true)
    }
    return Promise.resolve(false)
  }

  async destroy() {
    if (this.persists()) {
      await db.query(this._destroyQuery())
    }
  }

  persists() {
    return this.hasOwnProperty('id')
  }

  // Private

  static _tableName() {
    throw 'unimplemented abstract method'
  }

  static _serializeProperties() {
    return []
  }

  static _persistProperties() {
    return []
  }

  static _createTableQuery() {
    return {
      name: 'ensure-record-table',
      text: `
        CREATE TABLE IF NOT EXISTS ${this._tableName()} (
          ${this._tableFields()}
        );
      `
    }
  }

  static _tableFields() {
    throw 'unimplemented abstract method'
  }

  static _destroyAllQuery() {
    return {
      name: 'destroy-all-records',
      text: `
        DELETE FROM ${this._tableName()};
      `,
    }
  }

  _persistPropertiesValues() {
    return this.constructor._persistProperties()
      .map(property => this[property])
  }

  _createQuery() {
    const keysText = this.constructor._persistProperties()
      .map(key => key.toUnderscore())
      .join(', ')
    const valuesText = this.constructor._persistProperties()
      .map((prop, index) => `$${index + 1}`)
      .join(', ') 
    return {
      name: 'create-record',
      text: `
        INSERT INTO ${this.constructor._tableName()}(${keysText})
        VALUES(${valuesText});
      `,
      values: this._persistPropertiesValues(),
    }
  }

  _destroyQuery() {
    return {
      name: 'destroy-record',
      text: `
        DELETE FROM ${this.constructor._tableName()}
        WHERE id=$1;
      `,
      values: [this.id],
    }
  }
}

export default Model
