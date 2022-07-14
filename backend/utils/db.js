const { Client } = require('pg')

const config = require('./config')
const logger = require('./logger')

const client = new Client({
    connectionString: config.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
})

client.connect()

module.exports = {
    query: async (text, params) => {
        logger.log('DB QUERY> ', text)
        try {
            const result = await client.query(text, params)
            return {
                success: true,
                result,
            }
        } catch (ex) {
            logger.error('DB QUERY FAILED> ', ex)
            return {
                success: false,
                error: ex,
            }
        }
    },
}
