import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import Model, { ModelProps } from '../model/Model'
import { presence } from '../model/ModelValidations'

interface UserProps extends ModelProps {
  email?: string
  password?: string
  hashedPassword?: string
  token?: string
}

export default class User extends Model implements UserProps{
  static tableName = 'users'
  static tableFields = [
    'id SERIAL',
    'email VARCHAR(128) NOT NULL UNIQUE',
    'hashed_password VARCHAR(256) NOT NULL',
    'token VARCHAR(40)',
  ]
  email?: string
  password?: string
  hashedPassword?: string
  token?: string
  validations = {
    email: {
      save: [presence],
      create: [presence],
    },
    password: {
      create: [presence],
    },
  }

  constructor(props: Partial<UserProps> = {}) {
    super(props)
    this.email = props.email
    this.password = props.password
    this.hashedPassword = props.hashedPassword
    this.token = props.token
  }

  async generateToken(): Promise<{}> {
    const byteSize = 20
    let user = this
    return new Promise((resolve, reject) => {
      crypto.randomBytes(byteSize, (err, buf) => {
        if (err) { reject(err) }
        const token = buf.toString('hex')
        user.token = token
        resolve()
      })
    })
  }

  async hashPassword(): Promise<boolean> {
    if (!this.password) { throw new Error('"password" can\'t be empty') }
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

  persistProperties(): UserProps {
    return {
      email: this.email,
      hashedPassword: this.hashedPassword,
      token: this.token,
    }
  }

  async beforeCreate(): Promise<void> {
    await this.hashPassword()
  }

  handleQueryError(err: Error): void {
    super.handleQueryError(err)

    if (err.message === 'duplicate key value violates unique constraint "users_email_key"') {
      this.errors.push('An account already exists with that email address')
    }
  }

  serialize(): object {
    return {
      id: this.id,
      email: this.email,
    }
  }
}
