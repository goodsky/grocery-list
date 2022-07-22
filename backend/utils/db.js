const pgWrapper = require('./pgWrapper')

const createTable = async (tablename, tableDefinition) => {
    const columnString = Object.entries(tableDefinition)
        .map(([name, type]) => `${name} ${type}`)
        .reduce((prev, nextColumn) => `${prev}, ${nextColumn}`)

    const queryString = `CREATE TABLE IF NOT EXISTS ${tablename} (${columnString})`
    await pgWrapper.query(queryString)
}

const insert = async (tablename, row, returning) => {
    const columns = Object.keys(row)
    const values = Object.values(row)

    const columnString = columns.reduce((prev, nextColumn) => `${prev}, ${nextColumn}`)
    const valuesString = values
        .map((value, index) => `$${index + 1}`)
        .reduce((prev, nextValue) => `${prev}, ${nextValue}`)

    const returningString = !returning ? null : returning.reduce((prev, nextColumn) => `${prev}, ${nextColumn}`)

    const queryString = `INSERT INTO ${tablename} (${columnString}) VALUES(${valuesString})${
        !returningString ? '' : ` RETURNING ${returningString}`
    }`

    const result = await pgWrapper.query(queryString, values)
    return result.rows
}

const query = async (text, params) => pgWrapper.query(text, params)

module.exports = {
    createTable,
    insert,
    query,
}
