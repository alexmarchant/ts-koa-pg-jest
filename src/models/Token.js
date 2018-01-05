import passport from 'koa-passport'
import route from 'koa-route'
import TokensController from '../controllers/TokensController'

class Token {
  static routes(app) {
    app.use(route.post('/tokens', TokensController.create))
    app.use(route.delete('/tokens', TokensController.destroy))
  }
}

export default Token
