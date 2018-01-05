import passport from 'koa-passport'
import LocalStrategy from 'passport-local'

const fetchUser = (() => {
  // This is an example! Use password hashing in your project and avoid storing passwords in your code
  const user = { id: 1, username: 'test', password: 'test' }
  return async function() {
    return user
  }
})()

passport.use(new LocalStrategy({
    usernameField: 'email',
  },
  (username, password, done) => {
    fetchUser()
      .then(user => {
        if (username === user.username && password === user.password) {
          done(null, user)
        } else {
          done(null, false)
        }
      })
      .catch(err => done(err))
  }
))
