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
const noteColumn = 'note'

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
            [noteColumn]: 'TEXT',
        })

        hasInit = true
    }
}

const convertRowToListItem = (row) => {
    if (!row) {
        return null
    }

    return {
        ...row,
        id: row[idColumn],
        listId: row[listIdColumn],
        groceryId: row[groceryIdColumn],
        storeId: row[storeIdColumn],
        amount: row[amountColumn],
        pickedUp: row[pickedUpColumn],
        unit: row[unitColumn],
        note: row[noteColumn],
    }
}

const addListItem = async (item) => {
    await init()

    // const newItem = await db.insert(tablename, {
    //     values: {
    //         [listIdColumn]: item.listId,
    //         [groceryIdColumn]: item.groceryId,
    //         [storeIdColumn]: item.storeId,
    //         [amountColumn]: item.amount,
    //         [pickedUpColumn]: item.pickedUp,
    //         [unitColumn]: item.unit,
    //         [noteColumn]: item.note,
    //     },
    //     returning: [
    //         idColumn,
    //         listIdColumn,
    //         groceryIdColumn,
    //         storeIdColumn,
    //         amountColumn,
    //         pickedUpColumn,
    //         unitColumn,
    //         noteColumn,
    //     ],
    // })

    const addedItemName = 'item'
    const result = await db.query(
        `WITH ${addedItemName} as (
                INSERT INTO ${tablename}
                (
                    ${listIdColumn},
                    ${groceryIdColumn},
                    ${storeIdColumn},
                    ${amountColumn},
                    ${pickedUpColumn},
                    ${unitColumn},
                    ${noteColumn}
                )
                VALUES($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            )
        SELECT 
            ${addedItemName}.${idColumn} AS id,
            ${listIdColumn},
            ${groceryIdColumn},
            ${groceryDb.tablename}.name AS groceryname,
            ${groceryDb.tablename}.section AS grocerysection,
            ${storeIdColumn},
            ${amountColumn},
            ${pickedUpColumn},
            ${unitColumn},
            ${noteColumn}
        FROM ${addedItemName}
            LEFT OUTER JOIN ${groceryDb.tablename} ON ${addedItemName}.${groceryIdColumn} = ${groceryDb.tablename}.${groceryDb.primaryKey}
        `,
        [item.listId, item.groceryId, item.storeId, item.amount, item.pickedUp, item.unit, item.note]
    )

    return convertRowToListItem(result.rows[0])
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

    // const items = await db.select(tablename, {
    //     columns: [idColumn, groceryIdColumn, storeIdColumn, amountColumn, pickedUpColumn, unitColumn, noteColumn],
    //     filters: { [listIdColumn]: listId },
    // })
    // return items.map((row) => convertRowToListItem(row))

    const result = await db.query(
        `SELECT
            ${tablename}.${idColumn} AS id,
            ${groceryIdColumn},
            ${groceryDb.tablename}.name AS groceryname,
            ${groceryDb.tablename}.section AS grocerysection,
            ${storeIdColumn},
            ${amountColumn},
            ${pickedUpColumn},
            ${unitColumn},
            ${noteColumn}
        FROM ${tablename}
            LEFT OUTER JOIN ${groceryDb.tablename} ON ${tablename}.${groceryIdColumn} = ${groceryDb.tablename}.${groceryDb.primaryKey}
        WHERE ${listIdColumn} = $1`,
        [listId]
    )

    return result.rows.map((row) => convertRowToListItem(row))
}

const getStoresByListId = async (listId) => {
    await init()

    const result = await db.query(
        `SELECT DISTINCT
            ${storeIdColumn} AS id,
            ${storeDb.tablename}.name AS name,
            ${storeDb.tablename}.address AS address
        FROM ${tablename}
            LEFT OUTER JOIN ${storeDb.tablename} ON ${tablename}.${storeIdColumn} = ${storeDb.tablename}.${storeDb.primaryKey}
        WHERE ${listIdColumn} = $1`,
        [listId]
    )

    return result.rows
}

const getListItemById = async (id) => {
    await init()

    // const item = await db.selectSingle(tablename, {
    //     columns: [
    //         idColumn,
    //         listIdColumn,
    //         groceryIdColumn,
    //         storeIdColumn,
    //         amountColumn,
    //         pickedUpColumn,
    //         unitColumn,
    //         noteColumn,
    //     ],
    //     filters: { [idColumn]: id },
    // })

    // return convertRowToListItem(item)

    const result = await db.query(
        `SELECT
            ${tablename}.${idColumn} AS id,
            ${groceryIdColumn},
            ${groceryDb.tablename}.name AS groceryname,
            ${groceryDb.tablename}.section AS grocerysection,
            ${storeIdColumn},
            ${amountColumn},
            ${pickedUpColumn},
            ${unitColumn},
            ${noteColumn}
        FROM ${tablename}
            LEFT OUTER JOIN ${groceryDb.tablename} ON ${tablename}.${groceryIdColumn} = ${groceryDb.tablename}.${groceryDb.primaryKey}
        WHERE ${tablename}.${idColumn} = $1`,
        [id]
    )

    if (result.rows.length === 0) {
        return null
    }

    if (result.rows.length === 1) {
        return convertRowToListItem(result.rows[0])
    }

    throw new Error(`Unexpected row count after get list item. Got ${result.rows.length} rows.`)
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
    if (item.note) values[noteColumn] = item.note

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
    getStoresByListId,
    getListItemById,
    updateListItem,
}
