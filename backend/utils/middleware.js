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

        default:
        // no default
    }

    next(error)
}

const requestLogger = (request, response, next) => {
    logger.info(`${request.method} ${request.path}`)
    next()
}

module.exports = {
    errorHandler,
    requestLogger,
}
