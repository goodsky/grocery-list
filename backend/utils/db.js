const pgWrapper = require('./pgWrapper')

const createTable = async (tablename, tableDefinition, tableConstraints) => {
    const columnString = Object.entries(tableDefinition)
        .map(([name, type]) => `${name} ${type}`)
        .reduce((prev, nextColumn) => `${prev}, ${nextColumn}`)

    const constraintString = tableConstraints
        ? Object.entries(tableConstraints)
              .map(([name, type]) => `${name} ${type}`)
              .reduce((prev, nextColumn) => `${prev}, ${nextColumn}`)
        : null

    // The table definition is columns + constraints
    const columnAndConstraintString = constraintString ? `${columnString}, ${constraintString}` : columnString

    const createTableString = `CREATE TABLE IF NOT EXISTS ${tablename} (${columnAndConstraintString})`
    await pgWrapper.query(createTableString)

    // The table update is just columns
    // NB: I don't support adding constraints without recreating the table
    const addColumnString = Object.entries(tableDefinition)
        .map(([name, type]) => `ADD COLUMN IF NOT EXISTS ${name} ${type}`)
        .reduce((prev, nextColumn) => `${prev}, ${nextColumn}`)

    const alterTableString = `ALTER TABLE ${tablename} ${addColumnString}`
    await pgWrapper.query(alterTableString)
}

const insert = async (tablename, config) => {
    const { values, returning } = config
    if (!values) throw new Error('insert requires values')

    const columns = Object.keys(values)
    const params = Object.values(values)

    const columnString = columns.reduce((prev, nextColumn) => `${prev}, ${nextColumn}`)
    const paramsIndexString = params
        .map((value, index) => `$${index + 1}`)
        .reduce((prev, nextValue) => `${prev}, ${nextValue}`)

    let queryString = `INSERT INTO ${tablename} (${columnString}) VALUES(${paramsIndexString})`
    if (returning) {
        const returningString = returning.reduce((prev, nextColumn) => `${prev}, ${nextColumn}`)
        queryString += ` RETURNING ${returningString}`
    }

    const result = await pgWrapper.query(queryString, params)

    if (result.rows.length === 0) {
        return null
    }

    if (result.rows.length === 1) {
        return result.rows[0]
    }

    throw new Error(`Unexpected row count after insert. Got ${result.rows.length} rows.`)
}

const select = async (tablename, config) => {
    const { columns, filters } = config
    if (!columns) throw new Error('select requires columns')

    const columnString = columns.reduce((prev, nextColumn) => `${prev}, ${nextColumn}`)

    let queryString = `SELECT ${columnString} FROM ${tablename}`
    let params = []
    if (filters) {
        const filterKeys = Object.keys(filters)
        params = Object.values(filters)
        const filtersString = filterKeys
            .map((key, index) => `${key} = $${index + 1}`)
            .reduce((prev, nextFilter) => `${prev} AND ${nextFilter}`)

        queryString += ` WHERE ${filtersString}`
    }

    const result = await pgWrapper.query(queryString, params)
    return result.rows
}

const selectSingle = async (tablename, config) => {
    const rows = await select(tablename, config)

    if (rows.length === 0) {
        return null
    }

    if (rows.length === 1) {
        return rows[0]
    }

    throw new Error(`Unexpected row count after selectSingle. Got ${rows.length} rows.`)
}

const update = async (tablename, config) => {
    const { values, filters } = config
    if (!values) throw new Error('update requires values')

    const columns = Object.keys(values)
    let params = Object.values(values)
    const setString = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .reduce((prev, nextColumn) => `${prev}, ${nextColumn}`)

    let query = `UPDATE ${tablename} SET ${setString}`

    if (filters) {
        const filterKeys = Object.keys(filters)
        const filterParams = Object.values(filters)

        const startParamIndex = columns.length + 1
        const filterString = filterKeys
            .map((key, index) => `${key} = $${index + startParamIndex}`)
            .reduce((prev, nextFilter) => `${prev} AND ${nextFilter}`)

        query += ` WHERE ${filterString}`
        params = params.concat(filterParams)
    }

    const result = await pgWrapper.query(query, params)
    return result.rowCount
}

const updateSingle = async (tablename, config) => {
    const rowCount = await update(tablename, config)

    if (rowCount === 0) {
        return false
    }

    if (rowCount === 1) {
        return true
    }

    throw new Error(`Unexpected row count after updateSingle. Updated ${rowCount} rows.`)
}

const remove = async (tablename, config) => {
    const { filters } = config
    if (!filters) throw new Error("Let's not delete an entire table, shall we?")

    const columns = Object.keys(filters)
    const params = Object.values(filters)

    const filterString = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .reduce((prev, nextFilter) => `${prev} AND ${nextFilter}`)
    const queryText = `DELETE FROM ${tablename} WHERE ${filterString}`

    const result = await pgWrapper.query(queryText, params)
    return result.rowCount
}

const removeSingle = async (tablename, config) => {
    const rowCount = await remove(tablename, config)

    if (rowCount === 0) {
        return false
    }

    if (rowCount === 1) {
        return true
    }

    throw new Error(`Unexpected row count after updateSingle. Updated ${rowCount} rows.`)
}

const query = async (text, params) => pgWrapper.query(text, params)

module.exports = {
    createTable,
    insert,
    select,
    selectSingle,
    update,
    updateSingle,
    remove,
    removeSingle,
    query,
}
