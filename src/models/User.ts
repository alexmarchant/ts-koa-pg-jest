import * as Koa from 'koa'
import * as pg from 'pg'
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
    this.hashedPassword = await bcrypt.hash(this.password, saltRounds)
    return true
  }

  async findByEmail(email: string): Promise<User> {
    const result = await selectRow<User>(this.tableName, {email: email})
    return new User({
      id: result.id,
      email: result.email,
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
    'email TEXT NOT NULL UNIQUE',
    'hashed_password text NOT NULL',
  ]
  beforeSave = async () => {
		await this.hashPassword()
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
