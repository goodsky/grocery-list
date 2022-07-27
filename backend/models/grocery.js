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
        return null
    }

    return {
        id: row[idColumn],
        name: row[nameColumn],
        aliases: row[aliasesColumn],
        sections: row[sectionsColumn],
        units: row[unitsColumn],
    }
}

const addGrocery = async (grocery) => {
    await init()

    const newGrocery = await db.insert(tablename, {
        values: {
            [nameColumn]: grocery.name,
            [aliasesColumn]: grocery.aliases,
            [sectionsColumn]: grocery.sections,
            [unitsColumn]: grocery.units,
        },
        returning: [idColumn, nameColumn, aliasesColumn, sectionsColumn, unitsColumn],
    })

    return convertRowToGroceryItem(newGrocery)
}

const deleteGrocery = async (id) => {
    await init()

    await db.removeSingle(tablename, { filters: { [idColumn]: id } })
}

const getGroceries = async () => {
    await init()

    const groceries = await db.select(tablename, {
        columns: [idColumn, nameColumn, aliasesColumn, sectionsColumn, unitsColumn],
    })
    return groceries.map((row) => convertRowToGroceryItem(row))
}

const getGroceryById = async (id) => {
    await init()

    const grocery = await db.selectSingle(tablename, {
        columns: [idColumn, nameColumn, aliasesColumn, sectionsColumn, unitsColumn],
        filters: { [idColumn]: id },
    })

    return convertRowToGroceryItem(grocery)
}

const updateGrocery = async (grocery) => {
    await init()

    const values = {}
    if (grocery.name) values[nameColumn] = grocery.name
    if (grocery.aliases) values[aliasesColumn] = grocery.aliases
    if (grocery.sections) values[sectionsColumn] = grocery.sections
    if (grocery.units) values[unitsColumn] = grocery.units

    const wasUpdated = await db.updateSingle(tablename, {
        values,
        filters: { [idColumn]: grocery.id },
    })

    return wasUpdated
}

module.exports = {
    tablename,
    primaryKey: idColumn,
    addGrocery,
    deleteGrocery,
    getGroceries,
    getGroceryById,
    updateGrocery,
}
