const bcrypt = require('bcrypt')
const Router = require('express')

const config = require('../utils/config')
const logger = require('../utils/logger')
const userDb = require('../models/user')

const router = Router()

router.get('/', async (request, response) => {
    const users = await userDb.getUsers()

    logger.info('Read', users.length, 'users')
    response.status(200).json(users)
})

router.post('/', async (request, response) => {
    const { username, password } = request.body

    if (!username) {
        response.status(400).json({ error: 'missing username' })
        return
    }

    if (!password || password.length < 6) {
        response.status(400).json({ error: 'invalid password' })
        return
    }

    const passwordHash = await bcrypt.hash(password, config.SALT_ROUNDS)
    const joinedDate = new Date()
    const isAdmin = false

    logger.info('Adding new user', username)
    const newUser = await userDb.addUser(username, passwordHash, joinedDate, isAdmin)

    response.status(201).json(newUser)
})

// router.post('/login', async (request, response) => {
//     const { username, password } = request.body
// })

module.exports = router
