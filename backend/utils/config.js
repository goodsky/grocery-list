require('dotenv').config()

const { DATABASE_URL, JWT_SECRET, NODE_ENV } = process.env

const SALT_ROUNDS = 10
const JWT_EXPIRATION = 7 * 24 * 60 * 60 // 7 days

module.exports = {
    DATABASE_URL,
    JWT_SECRET,
    JWT_EXPIRATION,
    NODE_ENV,
    SALT_ROUNDS,
}
