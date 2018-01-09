import * as Koa from 'koa'
import * as route from 'koa-route'
import * as passport from 'koa-passport'

export function routes(app: Koa) {
  app.use(route.post('/tokens', create))
}

export async function create(ctx: Koa.Context, next: () => Promise<any>) {
  const middleware = passport.authenticate(
    'local', 
    async function(err, user, info, status) {
      if (err) {
        console.error(err)
        ctx.status = 500
        return
      }

      if (user) {
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
      } else {
        ctx.status = 400
        ctx.body = {errors: ['Invalid email or password']}
      }
    }
  )
  await middleware(ctx, next)
}
