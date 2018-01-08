import * as Koa from 'koa'
import * as route from 'koa-route'
import * as bcrypt from 'bcrypt'
import Model, { ModelProps } from '../base/Model'
import * as UsersController from '../controllers/UsersController'
import { selectRow } from '../lib/db'
import { presence } from '../base/Validatable'

interface UserProps extends ModelProps {
  email?: string
  password?: string
}

export default class User extends Model {
  email?: string
  password?: string
  hashedPassword?: string

  constructor(props: UserProps = {}) {
    super(props)
    this.email = props.email
    this.password = props.password
  }

  async hashPassword(): Promise<boolean> {
    const saltRounds = 12

    try {
      const salt = await bcrypt.genSalt(saltRounds)
      this.hashedPassword = await bcrypt.hash(this.password, salt)
      return true
    } catch(err) {
      console.error(err)
      return false
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    if (!this.hashedPassword) {
      throw new Error('hashedPassword not found on User')
    }
    return await bcrypt.compare(password, this.hashedPassword)
  }

  async findByEmail(email: string): Promise<User> {
    const result = await selectRow(this.tableName, {email: email})
    return new User({
      id: parseInt(result['id']),
      email: result['email'],
    })
  }

  // Persistable
  tableName = 'users'
  persistProperties = () => ({
    email: this.email,
    hashedPassword: this.hashedPassword,
  })
  tableFields = [
    'id SERIAL',
    'email VARCHAR(128) NOT NULL UNIQUE',
    'hashed_password VARCHAR(256) NOT NULL',
  ]
  beforeSave = async () => {
    await this.hashPassword()
  }
  handleQueryError = (err: Error) => {
    super.handleQueryError(err)

    if (err.message === 'duplicate key value violates unique constraint "users_email_key"') {
      this.errors.push('An account already exists with that email address')
    }
  }

  // Routable
  routes = (app: Koa) => {
    app.use(route.post('/users', UsersController.create))
  }

  // Serializable
  serialize = () => ({
    id: this.id,
    email: this.email,
  })

  // Validatable
  validations = {
    email: [presence],
    password: [presence],
  }
}
