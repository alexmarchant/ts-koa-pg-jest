import * as Koa from 'koa'
import * as route from 'koa-route'
import { passwordAuthenticate } from '../lib/auth'

export function routes(app: Koa) {
  app.use(route.post('/tokens', create))
}

async function create(ctx: Koa.Context, next: () => Promise<any>) {
  await passwordAuthenticate(ctx, next, async (ctx, user) => {
    if (!user.token) {
      await user.generateToken()
      if (!await user.save()) {
        console.error('Error saving token')
        ctx.status = 500
        return
      }
    }
    ctx.status = 201
    ctx.body = {token: user.token}
  })
}
