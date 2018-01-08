import * as request from 'supertest'
import app from '../../src/app'
import User from '../../src/models/User'
import { deleteAllRows } from '../../src/lib/db'

const props = {
  email: 'test@test.com',
  password: '12345678',
}

beforeAll(async () => {
  await new User(props).save()
})

afterAll(async () => {
  await deleteAllRows(User.tableName)
})

describe('routes: /tokens#post', () => {
  test('success: responds with token', async () => {
    expect.assertions(2)
    const response = await request(app.callback())
      .post('/tokens')
      .send(props)
    expect(response.status).toBe(201)
    expect(response.body.token).toBeDefined()
  })

  test('error: user doesn\'t exist', async () => {
    expect.assertions(2)
    const response = await request(app.callback())
      .post('/tokens')
      .send({
        ...props,
        email: 'testfail@test.com',
      })
    expect(response.status).toBe(400)
    expect(response.body.errors).toEqual([
      'Invalid email or password',
    ])
  })

  test('error: wrong password', async () => {
    expect.assertions(2)
    const response = await request(app.callback())
      .post('/tokens')
      .send({
        ...props,
        password: '87654321',
      })
    expect(response.status).toBe(400)
    expect(response.body.errors).toEqual([
      'Invalid email or password',
    ])
  })
})
