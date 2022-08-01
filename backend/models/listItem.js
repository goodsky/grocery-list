const db = require('../utils/db')
const groceryDb = require('./grocery')
const listDb = require('./list')
const storeDb = require('./store')

const tablename = 'listitems'
const idColumn = 'id'
const listIdColumn = 'listid'
const groceryIdColumn = 'groceryid'
const storeIdColumn = 'storeid'
const amountColumn = 'amount'
const pickedUpColumn = 'pickedup'
const unitColumn = 'unit'
const multiplierColumn = 'multiplier'

let hasInit = false
const init = async () => {
    if (!hasInit) {
        await db.createTable(tablename, {
            [idColumn]: 'SERIAL PRIMARY KEY',
            [listIdColumn]: `INTEGER REFERENCES ${listDb.tablename}(${listDb.primaryKey})`,
            [groceryIdColumn]: `INTEGER REFERENCES ${groceryDb.tablename}(${groceryDb.primaryKey})`,
            [storeIdColumn]: `INTEGER REFERENCES ${storeDb.tablename}(${storeDb.primaryKey})`,
            [amountColumn]: 'DECIMAL',
            [pickedUpColumn]: 'BOOLEAN',
            [unitColumn]: 'TEXT',
            [multiplierColumn]: 'INTEGER',
        })

        hasInit = true
    }
}

const convertRowToListItem = (row) => {
    if (!row) {
        return null
    }

    return {
        id: row[idColumn],
        listId: row[listIdColumn],
        groceryId: row[groceryIdColumn],
        storeId: row[storeIdColumn],
        amount: row[amountColumn],
        pickedUp: row[pickedUpColumn],
        unit: row[unitColumn],
        multiplier: row[multiplierColumn],
    }
}

const addListItem = async (item) => {
    await init()

    const newItem = await db.insert(tablename, {
        values: {
            [listIdColumn]: item.listId,
            [groceryIdColumn]: item.groceryId,
            [storeIdColumn]: item.storeId,
            [amountColumn]: item.amount,
            [pickedUpColumn]: item.pickedUp,
            [unitColumn]: item.unit,
            [multiplierColumn]: item.multiplier,
        },
        returning: [
            idColumn,
            listIdColumn,
            groceryIdColumn,
            storeIdColumn,
            amountColumn,
            pickedUpColumn,
            unitColumn,
            multiplierColumn,
        ],
    })

    return convertRowToListItem(newItem)
}

const deleteListItem = async (id) => {
    await init()

    await db.removeSingle(tablename, { filters: { [idColumn]: id } })
}

const deleteListItemsByListId = async (listId) => {
    await init()

    await db.remove(tablename, { filters: { [listIdColumn]: listId } })
}

const getListItemsByListId = async (listId) => {
    await init()

    const items = await db.select(tablename, {
        columns: [idColumn, groceryIdColumn, storeIdColumn, amountColumn, pickedUpColumn, unitColumn, multiplierColumn],
        filters: { [listIdColumn]: listId },
    })
    return items.map((row) => convertRowToListItem(row))
}

const getListItemById = async (id) => {
    await init()

    const item = await db.selectSingle(tablename, {
        columns: [
            idColumn,
            listIdColumn,
            groceryIdColumn,
            storeIdColumn,
            amountColumn,
            pickedUpColumn,
            unitColumn,
            multiplierColumn,
        ],
        filters: { [idColumn]: id },
    })

    return convertRowToListItem(item)
}

const updateListItem = async (item) => {
    await init()

    const values = {}
    if (item.listId) values[listIdColumn] = item.listId
    if (item.groceryId) values[groceryIdColumn] = item.groceryId
    if (item.storeId) values[storeIdColumn] = item.storeId
    if (item.amount) values[amountColumn] = item.amount
    if (item.pickedUp !== null) values[pickedUpColumn] = item.pickedUp // todo: beware of setting to false
    if (item.unit) values[unitColumn] = item.unit
    if (item.multiplier) values[multiplierColumn] = item.multiplier

    const wasUpdated = await db.updateSingle(tablename, {
        values,
        filters: { [idColumn]: item.id },
    })

    return wasUpdated
}

module.exports = {
    tablename,
    primaryKey: idColumn,
    addListItem,
    deleteListItem,
    deleteListItemsByListId,
    getListItemsByListId,
    getListItemById,
    updateListItem,
}
