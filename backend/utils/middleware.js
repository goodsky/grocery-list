const jwt = require('jsonwebtoken')
const config = require('./config')
const logger = require('./logger')

const errorHandler = (error, request, response, next) => {
    logger.error(`Unhandled error (${error.name})`, error.message)

    switch (error.name) {
        case 'DbQueryFailed':
            if (error.message.startsWith('duplicate key value violates unique constraint')) {
                response.status(409).json({ error: 'key already exists' })
            } else {
                response.status(500).json({ error: 'query failed' })
            }
            break

        case 'JsonWebTokenError':
            response.status(401).json({ error: 'invalid token' })
            break

        default:
            response.status(500).json({ error: 'oops' })
    }

    next(error)
}

const requestLogger = (request, response, next) => {
    logger.info(`${request.method} ${request.path}`)
    next()
}

const tokenExtractor = (request, response, next) => {
    const authHeader = request.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring('Bearer '.length)
        const claims = jwt.verify(token, config.JWT_SECRET)
        request.claims = claims
    }

    next()
}

module.exports = {
    errorHandler,
    requestLogger,
    tokenExtractor,
}
