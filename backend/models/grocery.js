const db = require('../utils/db')

const tablename = 'groceries'
const idColumn = 'id'
const nameColumn = 'name'
const aliasesColumn = 'aliases'
const sectionsColumn = 'sections'
const unitsColumn = 'units'

let hasInit = false
const init = async () => {
    if (!hasInit) {
        await db.createTable(tablename, {
            [idColumn]: 'SERIAL PRIMARY KEY',
            [nameColumn]: 'TEXT',
            [aliasesColumn]: 'TEXT[]',
            [sectionsColumn]: 'TEXT[]',
            [unitsColumn]: 'TEXT',
        })

        hasInit = true
    }
}

const convertRowToGroceryItem = (row) => {
    if (!row) {
        throw Error('Attempted to convert empty row to GroceryItem')
    }

    return {
        id: row[idColumn],
        name: row[nameColumn],
        aliases: row[aliasesColumn],
        sections: row[sectionsColumn],
        units: row[unitsColumn],
    }
}

const addGrocery = async (groceryItem) => {
    await init()

    const rows = await db.insert(
        tablename,
        {
            [nameColumn]: groceryItem.name,
            [aliasesColumn]: groceryItem.aliases,
            [sectionsColumn]: groceryItem.sections,
            [unitsColumn]: groceryItem.units,
        },
        [idColumn, nameColumn, aliasesColumn, sectionsColumn, unitsColumn]
    )

    return convertRowToGroceryItem(rows[0])
}

const deleteGrocery = async (id) => {
    await init()

    await db.query(`DELETE FROM ${tablename} WHERE ${idColumn} = $1`, [id])
}

const getGroceries = async () => {
    await init()

    const result = await db.query(
        `SELECT ${idColumn}, ${nameColumn}, ${aliasesColumn}, ${sectionsColumn}, ${unitsColumn} FROM ${tablename}`
    )

    return result.rows.map((row) => convertRowToGroceryItem(row))
}

const getGroceryById = async (id) => {
    await init()

    const result = await db.query(
        `SELECT ${idColumn}, ${nameColumn}, ${aliasesColumn}, ${sectionsColumn}, ${unitsColumn} FROM ${tablename} WHERE ${idColumn} = $1`,
        [id]
    )

    if (result.rows.length === 0) {
        return null
    }

    if (result.rows.length > 1) {
        throw new Error(`unexpected query result : expected exactly one grocery item with id = '${id}'`)
    }

    return convertRowToGroceryItem(result.rows[0])
}

const updateGrocery = async (groceryItem) => {
    await init()

    const result = await db.query(
        `UPDATE ${tablename} SET ${nameColumn} = $1, ${aliasesColumn} = $2, ${sectionsColumn} = $3, ${unitsColumn} = $4 WHERE ${idColumn} = $5 RETURNING ${idColumn}`,
        [groceryItem.name, groceryItem.aliases, groceryItem.sections, groceryItem.units, groceryItem.id]
    )

    if (result.rows.length === 0) {
        return null
    }

    return result.rows[0].id
}

module.exports = {
    addGrocery,
    deleteGrocery,
    getGroceries,
    getGroceryById,
    updateGrocery,
}
