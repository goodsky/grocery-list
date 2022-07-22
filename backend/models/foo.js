const db = require('../utils/db')

const tablename = 'foo'
const idColumn = 'id'
const messageColumn = 'message'

let hasInit = false
const init = async () => {
    await db.createTable(tablename, {
        [idColumn]: 'SERIAL',
        [messageColumn]: 'TEXT',
    })

    await db.insert(tablename, {
        [messageColumn]: `This Database was initialized on ${new Date().toString()}`,
    })

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
