import koa from 'koa'
import serve from 'koa-static'
import path from 'path'
import passport from 'koa-passport'
import bodyParser from 'koa-bodyparser'

import Token from './models/Token'
import User from './models/User'
// Setup auth strategy (local database)
import './auth/local'

// Create server
const app = new koa()

// Parse JSON requests
app.use(bodyParser());

// Auth
app.use(passport.initialize())
app.use(passport.session())

// Serve static files
app.use(serve('public'))

// Let models setup their own routes and other config
Token.init(app)
User.init(app)

// Start server
app.listen(8000)
console.log('listening on port 8000')
