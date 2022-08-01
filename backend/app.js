const express = require('express')
require('express-async-errors')

const fooRouter = require('./controllers/foo')
const groceriesRouter = require('./controllers/groceries')
const listsRouter = require('./controllers/lists')
const listItemsRouter = require('./controllers/listItems')
const storesRouter = require('./controllers/stores')
const usersRouter = require('./controllers/users')

const middleware = require('./utils/middleware')

const app = express()
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)
app.use(express.static('frontend/build'))
app.use('/api/foo', fooRouter)
app.use('/api/groceries', groceriesRouter)
app.use('/api/lists', listsRouter)
app.use('/api/lists', listItemsRouter)
app.use('/api/stores', storesRouter)
app.use('/api/users', usersRouter)
app.use(middleware.errorHandler)

module.exports = app
