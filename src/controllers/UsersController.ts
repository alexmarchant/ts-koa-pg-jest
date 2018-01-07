import * as Koa from 'koa'
import User from '../models/User'

type Params = {[key: string]: any}

const permittedParams = [
  'email',
  'password',
]

const userParams = (params: Params) => {
  debugger
  return Object.keys(params)
    .filter(key => permittedParams.includes(key))
    .reduce((obj, key) => {
      obj[key] = params[key]
      return obj
    }, <Params>{})
}

export async function create(ctx: Koa.Context) {
  const params = userParams(ctx.request.body)
  const user = new User(params)
  if (await user.save()) {
    ctx.status = 201
    ctx.body = user.serialize()
  } else {
    ctx.status = 400
    ctx.body = {errors: user.errors}
  }
}

