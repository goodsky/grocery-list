const db = require('../utils/db')

const tablename = 'groceries'
const idColumn = 'id'
const nameColumn = 'name'
const sectionColumn = 'section'
const unitsColumn = 'units'

let hasInit = false
const init = async () => {
    if (!hasInit) {
        await db.createTable(tablename, {
            [idColumn]: 'SERIAL PRIMARY KEY',
            [nameColumn]: 'TEXT',
            [sectionColumn]: 'TEXT',
            [unitsColumn]: 'TEXT',
        })

        hasInit = true
    }
}

const convertRowToGrocery = (row) => {
    if (!row) {
        return null
    }

    return {
        id: row[idColumn],
        name: row[nameColumn],
        section: row[sectionColumn],
        units: row[unitsColumn],
    }
}

const convertRowToSection = (row) => {
    if (!row) {
        return null
    }

    return row[sectionColumn]
}

const addGrocery = async (grocery) => {
    await init()

    const newGrocery = await db.insert(tablename, {
        values: {
            [nameColumn]: grocery.name,
            [sectionColumn]: grocery.section,
            [unitsColumn]: grocery.units,
        },
        returning: [idColumn, nameColumn, sectionColumn, unitsColumn],
    })

    return convertRowToGrocery(newGrocery)
}

const deleteGrocery = async (id) => {
    await init()

    await db.removeSingle(tablename, { filters: { [idColumn]: id } })
}

const getGroceries = async () => {
    await init()

    const groceries = await db.select(tablename, {
        columns: [idColumn, nameColumn, sectionColumn, unitsColumn],
    })
    return groceries.map((row) => convertRowToGrocery(row))
}

const getGroceryById = async (id) => {
    await init()

    const grocery = await db.selectSingle(tablename, {
        columns: [idColumn, nameColumn, sectionColumn, unitsColumn],
        filters: { [idColumn]: id },
    })

    return convertRowToGrocery(grocery)
}

const getGrocerySections = async () => {
    await init()

    const result = await db.query(`SELECT DISTINCT ${sectionColumn} FROM ${tablename}`)
    const sections = result.rows

    return sections.map((row) => convertRowToSection(row))
}

const updateGrocery = async (grocery) => {
    await init()

    const values = {}
    if (grocery.name) values[nameColumn] = grocery.name
    if (grocery.section) values[sectionColumn] = grocery.section
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
    getGrocerySections,
    updateGrocery,
}
