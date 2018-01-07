import * as request from 'supertest'
import app from '../../src/app'
import User from '../../src/models/User'

afterEach(() => {
  new User().destroyAll()
})

const userProps = {
  email: 'test@test.com',
  password: '12345678',
}

describe('routes: /users#post', () => {
  test('success: creates user', async () => {
    expect.assertions(3)
    const response = await request(app.callback())
      .post('/users')
      .send(userProps)
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
    await request(app.callback())
      .post('/users')
      .send(userProps)
    const response = await request(app.callback())
      .post('/users')
      .send(userProps)
    expect(response.status).toBe(400)
    expect(response.body.errors).toEqual([
      'An account already exists with that email address',
    ])
  })
})