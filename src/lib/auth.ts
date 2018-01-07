import * as passport from 'koa-passport'
import { Strategy as LocalStrategy } from 'passport-local'
import User from '../models/User'

const options = {
  usernameField: 'email',
}

passport.use(new LocalStrategy(options,
  async (email, password, done) => {
    const user = await new User().findByEmail(email)
    if (email === user.email && password === user.password) {
      done(null, user)
    } else {
      done(null, false)
    }
  }
))
