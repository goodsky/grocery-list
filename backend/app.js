const express = require('express')

const fooRouter = require('./controllers/foo')

const app = express()
app.use(express.json())
app.use('/api/foo', fooRouter)

module.exports = app
