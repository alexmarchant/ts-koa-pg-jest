import * as Koa from 'koa'

export default abstract class Routable {
  routes(app: Koa): void {}
}
