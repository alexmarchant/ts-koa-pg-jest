import 'dotenv/config'
import * as Koa from 'koa'
import * as passport from 'koa-passport'
import * as bodyParser from 'koa-bodyparser'
import * as UsersController from './controllers/UsersController'
import * as TokensController from './controllers/TokensController'
import './lib/String'
import './lib/auth'

// Create server
const app = new Koa()

// Parse JSON requests
app.use(bodyParser())

// Auth
app.use(passport.initialize())

// Let controllers setup their own routes
UsersController.routes(app)
TokensController.routes(app)

export default app
