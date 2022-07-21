require('dotenv').config()

const { DATABASE_URL, JWT_SECRET, NODE_ENV } = process.env

const SALT_ROUNDS = 10

module.exports = {
    DATABASE_URL,
    JWT_SECRET,
    NODE_ENV,
    SALT_ROUNDS,
}
