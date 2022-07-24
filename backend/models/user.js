const db = require('../utils/db')

const tablename = 'users'
const idColumn = 'id'
const usernameColumn = 'username'
const passwordHashColumn = 'passwordhash'
const isAdminColumn = 'admin'
const joinedDateColumn = 'joined'

let hasInit = false
const init = async () => {
    if (!hasInit) {
        await db.createTable(tablename, {
            [idColumn]: 'SERIAL',
            [usernameColumn]: 'TEXT PRIMARY KEY',
            [passwordHashColumn]: 'TEXT',
            [joinedDateColumn]: 'TIMESTAMP WITH TIME ZONE',
            [isAdminColumn]: 'BOOLEAN',
        })

        hasInit = true
    }
}

const convertRowToUser = (row) => {
    if (!row) {
        throw Error('Attempted to convert empty row to User')
    }

    return {
        id: row[idColumn],
        username: row[usernameColumn],
        passwordHash: row[passwordHashColumn],
        joinedDate: row[joinedDateColumn],
        isAdmin: row[isAdminColumn],
    }
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
        columns: [idColumn, usernameColumn, joinedDateColumn, isAdminColumn],
    })
    return users.map((row) => convertRowToUser(row))
}

const getUserByUsername = async (username) => {
    await init()

    const user = await db.selectSingle(tablename, {
        columns: [idColumn, usernameColumn, passwordHashColumn, joinedDateColumn, isAdminColumn],
        filters: { [usernameColumn]: username },
    })

    return convertRowToUser(user)
}

module.exports = {
    addUser,
    getUsers,
    getUserByUsername,
}
