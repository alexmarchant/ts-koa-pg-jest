import * as request from 'supertest'
import app from '../../src/app'
import User from '../../src/models/User'
import { deleteAllRows } from '../../src/lib/db'

const props = {
  email: 'test@test.com',
  password: '12345678',
}

afterEach(async () => {
  await deleteAllRows(User.tableName)
})

describe('routes: /users#post', () => {
  test('success: responds with user', async () => {
    expect.assertions(3)
    const response = await request(app.callback())
      .post('/users')
      .send(props)
    expect(response.status).toBe(201)
    expect(response.body.id).toBeDefined()
    expect(response.body.email).toBe('test@test.com')
  })

  test('error: missing fields', async () => {
    expect.assertions(2)
    const response = await request(app.callback())
      .post('/users')
      .send({})
    expect(response.status).toBe(400)
    expect(response.body.errors).toEqual([
      '"email" can\'t be blank',
      '"password" can\'t be blank',
    ])
  })

  test('error: duplicate email', async () => {
    expect.assertions(2)
    await new User(props).save()
    const response = await request(app.callback())
      .post('/users')
      .send(props)
    expect(response.status).toBe(400)
    expect(response.body.errors).toEqual([
      'An account already exists with that email address',
    ])
  })
})

describe('routes: /users/current#get', () => {
  test('success: responds with user', async () => {
    expect.assertions(3)
    const user = await new User(props)
    await user.generateToken()
    await user.save()
    const response = await request(app.callback())
      .get('/users/current')
      .set('Authorization', `Bearer ${user.token}`)
    expect(response.status).toBe(200)
    expect(response.body.id).toBeDefined()
    expect(response.body.email).toBe('test@test.com')
  })

  test('error: auth', async () => {
    expect.assertions(2)
    const user = await new User(props)
    await user.generateToken()
    await user.save()
    const response = await request(app.callback())
      .get('/users/current')
      .set('Authorization', `Bearer 12345678`)
    expect(response.status).toBe(401)
    expect(response.body.errors).toEqual([
      'Bad authentication data',
    ])
  })
})

