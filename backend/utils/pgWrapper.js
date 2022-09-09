const { Client } = require('pg')

const config = require('./config')
const logger = require('./logger')

const queryLogging = false

class DbQueryFailed extends Error {
    constructor(message) {
        super(message)
        this.name = 'DbQueryFailed'
    }
}

const client = new Client({
    connectionString: config.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
})

let isConnected = false
const query = async (text, params) => {
    if (config.NODE_ENV === 'test') {
        throw Error('PostgreSQL queries are disabled in the test environment.')
    }

    try {
        if (!isConnected) {
            logger.info('Connecting to PostgreSQL')
            await client.connect()
            isConnected = true
        }

        if (queryLogging) {
            logger.info('PostgreSQL>', text, params)
        }

        return await client.query(text, params)
    } catch (ex) {
        logger.error('DB query failed: ', text, ex)
        throw new DbQueryFailed(ex.message)
    }
}

module.exports = {
    query,
}
