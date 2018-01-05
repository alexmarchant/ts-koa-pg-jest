import passport from 'koa-passport'
import route from 'koa-route'
import bcrypt from 'bcrypt'
import Model from '../base/Model'
import UsersController from '../controllers/UsersController'
import validations from '../lib/validations'

class User extends Model {
  static routes(app) {
    app.use(route.post('/users', UsersController.create))
  }

  constructor(props) {
    super(props)

    this.validations.push(validations.require('email'))
    this.validations.push(validations.require('password'))
  }

  async save() {
		await this._hashPassword()
		return await super.save()
  }

  // Private

  // Model#
	static _tableName() {
    return 'users'
	}
  
  // Model#
  static _serializeProperties() {
    return [
      'id',
      'email',
    ]
  }

  // Model#
  static _persistProperties() {
    return [
      'email',
      'hashedPassword',
    ]
  }

  // Model#
  static _tableFields() {
    return `
      id SERIAL,
      email TEXT NOT NULL UNIQUE,
      hashed_password text NOT NULL
    `
  }

  async _hashPassword() {
    const saltRounds = 12
    this.hashedPassword = await bcrypt.hash(this.password, saltRounds)
  }
}

export default User
