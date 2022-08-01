const db = require('../utils/db')

const tablename = 'stores'
const idColumn = 'id'
const nameColumn = 'name'
const addressColumn = 'address'

let hasInit = false
const init = async () => {
    if (!hasInit) {
        await db.createTable(tablename, {
            [idColumn]: 'SERIAL PRIMARY KEY',
            [nameColumn]: 'TEXT',
            [addressColumn]: 'TEXT',
        })

        hasInit = true
    }
}

const convertRowToStore = (row) => {
    if (!row) {
        return null
    }

    return {
        id: row[idColumn],
        name: row[nameColumn],
        address: row[addressColumn],
    }
}

const addStore = async (store) => {
    await init()

    const newStore = await db.insert(tablename, {
        values: {
            [nameColumn]: store.name,
            [addressColumn]: store.address,
        },
        returning: [idColumn, nameColumn, addressColumn],
    })

    return convertRowToStore(newStore)
}

const deleteStore = async (id) => {
    await init()

    await db.removeSingle(tablename, { filters: { [idColumn]: id } })
}

const getStores = async () => {
    await init()

    const stores = await db.select(tablename, {
        columns: [idColumn, nameColumn, addressColumn],
    })
    return stores.map((row) => convertRowToStore(row))
}

const getStoreById = async (id) => {
    await init()

    const store = await db.selectSingle(tablename, {
        columns: [idColumn, nameColumn, addressColumn],
        filters: { [idColumn]: id },
    })

    return convertRowToStore(store)
}

const updateStore = async (store) => {
    await init()

    const values = {}
    if (store.name) values[nameColumn] = store.name
    if (store.address) values[addressColumn] = store.address

    const wasUpdated = await db.updateSingle(tablename, {
        values,
        filters: { [idColumn]: store.id },
    })

    return wasUpdated
}

module.exports = {
    tablename,
    primaryKey: idColumn,
    addStore,
    deleteStore,
    getStores,
    getStoreById,
    updateStore,
}
