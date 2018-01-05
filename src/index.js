import 'dotenv/config'
import koa from 'koa'
import path from 'path'
import passport from 'koa-passport'
import bodyParser from 'koa-bodyparser'

import Token from './models/Token'
import User from './models/User'

// Setup auth
import './lib/auth'

// Setup some string helpers
import './lib/string'

// Create server
const app = new koa()

// Parse JSON requests
app.use(bodyParser())

// Auth
app.use(passport.initialize())

// Create database tables
User.creatTable()

// Let models setup their own routes
Token.routes(app)
User.routes(app)

// Start server
const port = process.env.PORT || 8000
const server = app.listen(port)
console.log(`listening on port ${port}`)

module.exports = server
