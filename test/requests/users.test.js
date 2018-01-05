const request = require('supertest')
const server = require('../../src/index')
const User = require('../../src/models/User')

beforeEach(async () => {
  server.close()
  await User.destroyAll()
})

describe('routes: /users#post', () => {
  test('success', async () => {
    expect.assertions(3)
    const response = await request(server)
      .post('/users')
      .send({
        email: 'test@test.com',
        password: '12345678',
      })
    expect(response.status).toBe(201)
    expect(response.body.id).not.toBeNull()
    expect(response.body.email).toBe('test@test.com')
  })

  test('fail: missing fields', async () => {
    expect.assertions(2)
    const response = await request(server)
      .post('/users')
      .send({
        email: 'test@test.com',
      })
    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      errors: ['"password" is required'],
    })
  })
})
