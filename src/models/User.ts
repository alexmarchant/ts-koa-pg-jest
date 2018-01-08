import * as bcrypt from 'bcrypt'
import Model, { ModelProps } from '../base/Model'
import { presence } from '../base/Validatable'
import { QueryData } from '../lib/db'

interface UserProps extends ModelProps {
  email?: string
  password?: string
  hashedPassword?: string
}

export default class User extends Model {
  static findOne: (params: QueryData) => Promise<User | false>
  email?: string
  password?: string
  hashedPassword?: string

  constructor(props: UserProps = {}) {
    super(props)
    this.email = props.email
    this.password = props.password
    this.hashedPassword = props.hashedPassword
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

  // Persistable
  static tableName = 'users'
  static tableFields = [
    'id SERIAL',
    'email VARCHAR(128) NOT NULL UNIQUE',
    'hashed_password VARCHAR(256) NOT NULL',
  ]
  persistProperties = () => ({
    email: this.email,
    hashedPassword: this.hashedPassword,
  })
  beforeSave = async () => {
    await this.hashPassword()
  }
  handleQueryError = (err: Error) => {
    super.handleQueryError(err)

    if (err.message === 'duplicate key value violates unique constraint "users_email_key"') {
      this.errors.push('An account already exists with that email address')
    }
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
