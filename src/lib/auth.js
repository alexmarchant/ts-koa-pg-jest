import passport from 'koa-passport'
import LocalStrategy from 'passport-local'
import User from '../models/User'

const options = {
  usernameField: 'email',
}

passport.use(new LocalStrategy(options,
  async (username, password, done) => {
    const user = await User.findByEmail(username)
    if (username === user.username && password === user.password) {
      done(null, user)
    } else {
      done(null, false)
    }
  }
))
