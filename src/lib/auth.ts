import * as Koa from 'koa'
import * as passport from 'koa-passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import User from '../models/User'
import * as ModelStorage from '../model/ModelStorage'

const options = {
  usernameField: 'email',
}

passport.use(new LocalStrategy(options,
  async (email, password, done) => {
    try {
      const user = await ModelStorage.findOne(User, {email: email})
      if (user && await user.comparePassword(password)) {
        done(null, user)
      } else {
        done(null, false)
      }
    } catch(err) {
      done(err)
    }
  }
))

passport.use(new BearerStrategy(
  async (token, done) => {
    try {
      const user = await ModelStorage.findOne(User, {token: token})
      if (user) {
        done(null, user, {message: '', scope: 'all'})
      } else {
        done(null, false)
      }
    } catch(err) {
      done(err)
    }
  }
))

export async function passwordAuthenticate(
  ctx: Koa.Context,
  next: () => Promise<any>,
  cb: (ctx: Koa.Context, user: User, err?: Error, info?: string, status?: number) => Promise<any>
) {
  await passport.authenticate(
    'local', 
    async (err, user, info, status) => {
      if (err) {
        handleAuthError(ctx, err)
        return
      }

      if (user) {
        await cb(ctx, user, err, info, status)
      } else {
        handleBadAuth(ctx, 'Invalid email or password')
      }
    }
  )(ctx, next)
}

export async function tokenAuthenticate(
  ctx: Koa.Context,
  next: () => Promise<any>,
  cb: (ctx: Koa.Context, user: User, err?: Error, info?: string, status?: number) => Promise<any>
) {
  await passport.authenticate(
    'bearer', 
    async (err, user, info, status) => {
      if (err) {
        handleAuthError(ctx, err)
        return
      }

      if (user) {
        await cb(ctx, user, err, info, status)
      } else {
        handleBadAuth(ctx, 'Bad authentication data')
      }
    }
  )(ctx, next)
}

function handleAuthError(ctx: Koa.Context, err: Error) {
  console.error(err)
  ctx.status = 500
}

function handleBadAuth(ctx: Koa.Context, message: string) {
  ctx.status = 401
  ctx.body = {errors: [message]}
}

