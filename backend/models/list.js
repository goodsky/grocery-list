const db = require('../utils/db')
const userDb = require('./user')

const tablename = 'lists'
const idColumn = 'id'
const nameColumn = 'name'
const ownerColumn = 'owner'
const createdDateColumn = 'created'

let hasInit = false
const init = async () => {
    if (!hasInit) {
        await db.createTable(tablename, {
            [idColumn]: 'SERIAL PRIMARY KEY',
            [nameColumn]: 'TEXT',
            [ownerColumn]: `TEXT REFERENCES ${userDb.tablename}(${userDb.primaryKey})`,
            [createdDateColumn]: 'TIMESTAMP WITH TIME ZONE',
        })

        hasInit = true
    }
}

const convertRowToList = (row) => {
    if (!row) {
        return null
    }

    return {
        id: row[idColumn],
        name: row[nameColumn],
        owner: row[ownerColumn],
        createdDate: row[createdDateColumn],
    }
}

const addList = async (list) => {
    await init()

    const newList = await db.insert(tablename, {
        values: {
            [nameColumn]: list.name,
            [ownerColumn]: list.owner,
            [createdDateColumn]: list.createdDate,
        },
        returning: [idColumn, nameColumn, ownerColumn, createdDateColumn],
    })

    return convertRowToList(newList)
}

const deleteList = async (id, username) => {
    await init()

    const filters = {
        [idColumn]: id,
    }

    if (username) {
        filters[ownerColumn] = username
    }

    await db.removeSingle(tablename, { filters })
}

const getLists = async () => {
    await init()

    const lists = await db.select(tablename, {
        columns: [idColumn, nameColumn, ownerColumn, createdDateColumn],
    })
    return lists.map((row) => convertRowToList(row))
}

const getListsByUsername = async (username) => {
    await init()

    const lists = await db.select(tablename, {
        columns: [idColumn, nameColumn, ownerColumn, createdDateColumn],
        filters: { [ownerColumn]: username },
    })
    return lists.map((row) => convertRowToList(row))
}

const getListById = async (id, username) => {
    await init()

    const filters = {
        [idColumn]: id,
    }

    if (username) {
        filters[ownerColumn] = username
    }

    const list = await db.selectSingle(tablename, {
        columns: [idColumn, nameColumn, ownerColumn, createdDateColumn],
        filters,
    })

    return convertRowToList(list)
}

const updateList = async (list, username) => {
    await init()

    if (!list.id) {
        throw new Error('UpdateList requires a list id')
    }

    const values = {}
    if (list.name) values[nameColumn] = list.name
    if (list.owner) values[ownerColumn] = list.owner
    if (list.createdDate) values[createdDateColumn] = list.createdDate

    const filters = {
        [idColumn]: list.id,
    }

    if (username) {
        filters[ownerColumn] = username
    }

    const wasUpdated = await db.updateSingle(tablename, {
        values,
        filters,
    })

    return wasUpdated
}

module.exports = {
    tablename,
    primaryKey: idColumn,
    addList,
    deleteList,
    getLists,
    getListsByUsername,
    getListById,
    updateList,
}
