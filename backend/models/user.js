const db = require('../utils/db')

const logger = require('../utils/logger')

const tablename = 'users'
const idColumn = 'id'
const usernameColumn = 'username'
const passwordHashColumn = 'passwordhash'
const isAdminColumn = 'admin'
const joinedDateColumn = 'joined'

let hasInit = false
const init = async () => {
    if (!hasInit) {
        await db.query(
            `CREATE TABLE IF NOT EXISTS ${tablename}(
            ${idColumn} SERIAL,
            ${usernameColumn} TEXT PRIMARY KEY,
            ${passwordHashColumn} TEXT,
            ${joinedDateColumn} TIMESTAMP WITH TIME ZONE,
            ${isAdminColumn} BOOLEAN)`
        )
        hasInit = true
    }
}

const convertRowToUser = (row) => {
    if (!row || !row.id || !row.username) {
        throw Error('Attempted to convert invalid row to User')
    }

    return {
        id: row[idColumn],
        username: row[usernameColumn],
        passwordHash: row[passwordHashColumn],
        joinedDate: row[joinedDateColumn],
        isAdmin: row[isAdminColumn],
    }
}

const addUser = async (username, passwordHash, joinedDate, isAdmin) => {
    await init()

    const result = await db.query(
        `INSERT INTO ${tablename} (${usernameColumn}, ${passwordHashColumn}, ${joinedDateColumn}, ${isAdminColumn}) VALUES($1, $2, $3, $4)
        RETURNING ${idColumn}, ${usernameColumn}, ${joinedDateColumn}, ${isAdminColumn}`,
        [username, passwordHash, joinedDate, isAdmin]
    )

    return convertRowToUser(result.rows[0])
}

const getUsers = async () => {
    await init()

    const result = await db.query(
        `SELECT ${idColumn}, ${usernameColumn}, ${joinedDateColumn}, ${isAdminColumn} FROM ${tablename}`
    )

    return result.rows.map((row) => convertRowToUser(row))
}

const getUserByUsername = async (username) => {
    await init()

    const result = await db.query(
        `SELECT ${idColumn}, ${usernameColumn}, ${passwordHashColumn}, ${joinedDateColumn}, ${isAdminColumn} FROM ${tablename}
        WHERE ${usernameColumn} = '${username}'`
    )

    if (result.rows.length === 0) {
        return null
    }

    if (result.rows.length === 1) {
        return convertRowToUser(result.rows[0])
    }

    throw Error(`unexpected query result : expected exactly one user with username ${username}`)
}

module.exports = {
    addUser,
    getUsers,
    getUserByUsername,
}
