import User from '../models/user'

const TokensController = {}

TokensController.create = ctx => {
  ctx.body = {token: '1234'}
}

TokensController.destroy = ctx => {
  ctx.status = 204
}

export default TokensController
