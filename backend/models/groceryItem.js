const db = require('../utils/db')

const tablename = 'groceryitems'
const idColumn = 'id'
const nameColumn = 'name'
const aliasesColumn = 'aliases'
const sectionsColumn = 'sections'
const defaultUnitColumn = 'unit'

let hasInit = false
const init = async () => {
    if (!hasInit) {
        await db.createTable(tablename, {
            [idColumn]: 'SERIAL PRIMARY KEY',
            [nameColumn]: 'TEXT',
            [aliasesColumn]: 'TEXT[]',
            [sectionsColumn]: 'TEXT[]',
            [defaultUnitColumn]: 'TEXT',
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
        defaultUnit: row[defaultUnitColumn],
    }
}

const addGroceryItem = async (name, aliases, sections, defaultUnit) => {
    await init()

    if (defaultUnit) {
        await db.insert(tablename, {
            [nameColumn]: name,
            [aliasesColumn]: aliases,
            [sectionsColumn]: sections,
            [defaultUnitColumn]: defaultUnit,
        })
    } else {
        await db.insert(tablename, {
            [nameColumn]: name,
            [aliasesColumn]: aliases,
            [sectionsColumn]: sections,
        })
    }
}

const getGroceryItems = async () => {
    await init()

    const result = await db.query(
        `SELECT ${idColumn}, ${nameColumn}, ${aliasesColumn}, ${sectionsColumn}, ${defaultUnitColumn} FROM ${tablename}`
    )

    return result.rows.map((row) => convertRowToGroceryItem(row))
}

module.exports = {
    addGroceryItem,
    getGroceryItems,
}
