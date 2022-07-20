const db = require('../utils/db')

const tablename = 'foo'
const idColumn = 'id'
const messageColumn = 'message'

let hasInit = false
const init = async () => {
    await db.query(
        `CREATE TABLE IF NOT EXISTS ${tablename}(
        ${idColumn} SERIAL,
        ${messageColumn} TEXT
    )`
    )

    await db.query(
        `INSERT INTO ${tablename}(${messageColumn})
        VALUES($1)`,
        [`This Database was initialized on ${new Date()}`]
    )
    hasInit = true
}

const getFoo = async () => {
    if (!hasInit) await init()

    const result = await db.query(`SELECT ${idColumn}, ${messageColumn} FROM ${tablename}`)
    return result.rows
}

module.exports = {
    getFoo,
}
