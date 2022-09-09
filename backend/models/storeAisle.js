const db = require('../utils/db')
const storeDb = require('./store')

const tablename = 'storeAisle'
const idColumn = 'id'
const storeIdColumn = 'storeId'
const nameColumn = 'name'
const positionColumn = 'position'

let hasInit = false
const init = async () => {
    if (!hasInit) {
        await db.createTable(tablename, {
            [idColumn]: 'SERIAL PRIMARY KEY',
            [storeIdColumn]: `INTEGER REFERENCES ${storeDb.tablename}(${storeDb.primaryKey})`,
            [nameColumn]: 'TEXT',
            [positionColumn]: 'INTEGER',
        })

        hasInit = true
    }
}

const convertRowToAisle = (row) => {
    if (!row) {
        return null
    }

    return {
        id: row[idColumn],
        storeId: row[storeIdColumn],
        name: row[nameColumn],
        position: row[positionColumn],
    }
}

const addAisle = async (aisle) => {
    await init()

    const newAisle = await db.insert(tablename, {
        values: {
            [storeIdColumn]: aisle.storeId,
            [nameColumn]: aisle.name,
            [positionColumn]: aisle.position,
        },
        returning: [idColumn, nameColumn, nameColumn, positionColumn],
    })

    return convertRowToAisle(newAisle)
}

const deleteAisle = async (id) => {
    await init()

    await db.removeSingle(tablename, { filters: { [idColumn]: id } })
}

const deleteAislesByStoreId = async (storeId) => {
    await init()

    await db.remove(tablename, { filters: { [storeIdColumn]: storeId } })
}

const getAislesByStoreId = async (storeId) => {
    await init()

    const aisles = await db.select(tablename, {
        columns: [idColumn, storeIdColumn, nameColumn, positionColumn],
        filters: { [storeIdColumn]: storeId },
    })
    return aisles.map((row) => convertRowToAisle(row)).sort((a, b) => a.position - b.position)
}

const updateAisle = async (aisle) => {
    await init()

    const values = {}
    if (aisle.storeId) values[storeIdColumn] = aisle.storeId
    if (aisle.name) values[nameColumn] = aisle.name
    if (Number.isInteger(aisle.position)) values[positionColumn] = aisle.position

    const wasUpdated = await db.updateSingle(tablename, {
        values,
        filters: { [idColumn]: aisle.id },
    })

    return wasUpdated
}

module.exports = {
    tablename,
    primaryKey: idColumn,
    addAisle,
    deleteAisle,
    deleteAislesByStoreId,
    getAislesByStoreId,
    updateAisle,
}
