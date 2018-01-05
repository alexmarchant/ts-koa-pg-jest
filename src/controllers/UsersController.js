import User from '../models/User'
import params from '../lib/params'

const userParams = params.permit([
  'email',
  'password',
])

const UsersController = {}

UsersController.create = async ctx => {
  const params = userParams(ctx.request.body)
  const user = new User(params)
  if (await user.save()) {
    ctx.status = 201
    ctx.body = user.serialize()
  } else {
    ctx.status = 400
    if (user.errors.length > 0) {
      ctx.body = {
        errors: user.errors
      }
    }
  }
}

export default UsersController
