import passport from 'koa-passport'
import route from 'koa-route'
import Model from '../base/model'
import controller from '../controllers/users'

class User extends Model {
  static init(app) {
    app.use(route.get('/users', controller.read))
  }

  // Model
  
  publicProperties() {
    return [
      'id',
      'email',
    ]
  }
}

export default User
