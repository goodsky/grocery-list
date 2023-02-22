const db = require('../utils/db')

const tablename = 'users'
const idColumn = 'id'
const usernameColumn = 'username'
const passwordHashColumn = 'passwordhash'
const isAdminColumn = 'admin'
const joinedDateColumn = 'joined'
const isDeletedColumn = 'isdeleted'

let hasInit = false
const init = async () => {
    if (!hasInit) {
        await db.createTable(tablename, {
            [idColumn]: 'SERIAL',
            [usernameColumn]: 'TEXT PRIMARY KEY',
            [passwordHashColumn]: 'TEXT',
            [joinedDateColumn]: 'TIMESTAMP WITH TIME ZONE',
            [isAdminColumn]: 'BOOLEAN',
            [isDeletedColumn]: 'BOOLEAN',
        })

        hasInit = true
    }
}

const convertRowToUser = (row) => {
    if (!row) {
        return null
    }

    const user = {
        id: row[idColumn],
        username: row[usernameColumn],
        passwordHash: row[passwordHashColumn],
        joinedDate: row[joinedDateColumn],
        isAdmin: row[isAdminColumn],
    }

    if (row[isDeletedColumn] !== null) {
        user.isDeleted = row[isDeletedColumn]
    }

    return user
}

const addUser = async (user) => {
    await init()

    const newUser = await db.insert(tablename, {
        values: {
            [usernameColumn]: user.username,
            [passwordHashColumn]: user.passwordHash,
            [joinedDateColumn]: user.joinedDate,
            [isAdminColumn]: user.isAdmin,
        },
        returning: [idColumn, usernameColumn, joinedDateColumn, isAdminColumn],
    })

    return convertRowToUser(newUser)
}

const getUsers = async () => {
    await init()

    const users = await db.select(tablename, {
        columns: [idColumn, usernameColumn, joinedDateColumn, isAdminColumn, isDeletedColumn],
    })

    return users.map((row) => convertRowToUser(row))
}

const getUserByUsername = async (username) => {
    await init()

    const user = await db.selectSingle(tablename, {
        columns: [idColumn, usernameColumn, passwordHashColumn, joinedDateColumn, isAdminColumn, isDeletedColumn],
        filters: { [usernameColumn]: username },
    })

    return convertRowToUser(user)
}

const updateUser = async (user) => {
    await init()

    const values = {}
    if (user.isAdmin !== undefined) values[isAdminColumn] = user.isAdmin
    if (user.isDeleted !== undefined) values[isDeletedColumn] = user.isDeleted

    const wasUpdated = await db.updateSingle(tablename, {
        values,
        filters: { [idColumn]: user.id },
        notFilters: { [usernameColumn]: 'admin' }, // just don't
    })

    return wasUpdated
}

module.exports = {
    tablename,
    primaryKey: usernameColumn,
    addUser,
    getUsers,
    getUserByUsername,
    updateUser,
}
