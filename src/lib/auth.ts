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
