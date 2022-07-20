const express = require('express')
require('express-async-errors')

const fooRouter = require('./controllers/foo')
const usersRouter = require('./controllers/users')
const middleware = require('./utils/middleware')

const app = express()
app.use(express.json())
app.use(middleware.requestLogger)
app.use(express.static('frontend/build'))
app.use('/api/foo', fooRouter)
app.use('/api/users', usersRouter)
app.use(middleware.errorHandler)

module.exports = app
