const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
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

router.post('/login', async (request, response) => {
    const { username, password } = request.body

    if (!username || !password) {
        response.status(400).json({ error: 'must supply username and password' })
        return
    }

    const user = await userDb.getUserByUsername(username)
    logger.info('got user', user)

    const passwordsMatch = user && (await bcrypt.compare(password, user.passwordHash))
    if (!user || !passwordsMatch) {
        response.status(401).json({ error: 'username or password is incorrect' })
        return
    }

    const payload = {
        id: user.id,
        username: user.username,
        joinedDate: user.joinedDate,
        isAdmin: user.isAdmin,
    }

    logger.info('Successful login for user', payload)

    const token = jwt.sign(payload, config.JWT_SECRET)
    response.status(200).json({ ...payload, token })
})

module.exports = router
