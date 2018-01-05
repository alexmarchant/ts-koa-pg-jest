import passport from 'koa-passport'

const controller = {}

controller.login = passport.authenticate('local', {
  successRedirect: '/app',
  failureRedirect: '/',
  session: false,
})

export default controller
