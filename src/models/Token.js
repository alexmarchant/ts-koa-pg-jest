import passport from 'koa-passport'
import route from 'koa-route'
import controller from '../controllers/tokens'

class Token {
  static init(app) {
    app.use(route.post('/tokens', controller.create))
    app.use(route.delete('/tokens', controller.destroy))
  }
}

export default Token
