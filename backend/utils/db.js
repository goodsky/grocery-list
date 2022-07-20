const { Client } = require('pg')

const config = require('./config')
const logger = require('./logger')

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
client.connect()

const query = async (text, params) => {
    try {
        return await client.query(text, params)
    } catch (ex) {
        logger.error('DB query failed: ', text, ex)
        throw new DbQueryFailed(ex.message)
    }
}

module.exports = {
    query,
}
