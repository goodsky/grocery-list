require('dotenv').config()

const { DATABASE_URL, NODE_ENV } = process.env

module.exports = {
    DATABASE_URL,
    NODE_ENV,
}
