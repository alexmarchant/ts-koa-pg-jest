import * as Koa from 'koa'
import * as route from 'koa-route'
import * as passport from 'koa-passport'

export function routes(app: Koa) {
  app.use(route.post('/tokens', create))
}

export async function create(ctx: Koa.Context, next: () => Promise<any>) {
  const middleware = passport.authenticate(
    'local', 
    function(err, user, info, status) {
      if (err) {
        console.error(err)
        ctx.status = 500
        return
      }

      if (user) {
        ctx.status = 201
        ctx.body = {token: '12345678'}
      } else {
        ctx.status = 400
        ctx.body = {errors: ['Invalid email or password']}
      }
    }
  )
  await middleware(ctx, next)
}
