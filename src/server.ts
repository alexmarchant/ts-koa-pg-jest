import 'dotenv/config'
import * as Koa from 'koa'
import * as path from 'path'
import * as passport from 'koa-passport'
import * as bodyParser from 'koa-bodyparser'

import User from './models/User'

// Setup auth
import './lib/auth'

// Setup some string extensions
import './lib/String'

// Create server
const app = new Koa()

// Parse JSON requests
app.use(bodyParser())

// Auth
app.use(passport.initialize())

// Let models setup their own routes
new User().routes(app)

// Start server
const port = process.env.PORT || 8000
const server = app.listen(port)
console.log(`listening on port ${port}`)

export default server
