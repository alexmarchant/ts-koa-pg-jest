import * as Koa from 'koa'
import * as route from 'koa-route'
import User from '../models/User'
import params from '../lib/params'
import { tokenAuthenticate } from '../lib/auth'

const permittedParams = [
  'email',
  'password',
]

export function routes(app: Koa) {
  app.use(route.post('/users', create))
  app.use(route.get('/users/current', read))
}

export async function create(ctx: Koa.Context) {
  const props = params(ctx.request.body).permit(permittedParams)
  const user = new User(props)
  if (await user.save()) {
    ctx.status = 201
    ctx.body = user.serialize()
  } else {
    ctx.status = 400
    ctx.body = {errors: user.errors}
  }
}

export async function read(ctx: Koa.Context, next: () => Promise<any>) {
  await tokenAuthenticate(ctx, next, async (ctx, user) => {
    ctx.status = 200
    ctx.body = user.serialize()
  })
}
