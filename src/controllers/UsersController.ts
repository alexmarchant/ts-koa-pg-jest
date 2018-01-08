import * as Koa from 'koa'
import * as route from 'koa-route'
import User from '../models/User'
import params from '../lib/params'

const permittedParams = [
  'email',
  'password',
]

export function routes(app: Koa) {
  app.use(route.post('/users', create))
}

export async function create(ctx: Koa.Context) {
  const userParams = params(ctx.request.body).permit(permittedParams)
  const user = new User(userParams)
  if (await user.save()) {
    ctx.status = 201
    ctx.body = user.serialize()
  } else {
    ctx.status = 400
    ctx.body = {errors: user.errors}
  }
}
