const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Router = require('express')

const config = require('../utils/config')
const logger = require('../utils/logger')
const middleware = require('../utils/middleware')
const userDb = require('../models/user')

const router = Router()

const defaultAdminUsername = 'admin'

// POST /api/users
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

    const user = {
        username,
        passwordHash,
        joinedDate: new Date(),
        isAdmin: username === defaultAdminUsername,
    }

    logger.info('Adding new user', username)
    const newUser = await userDb.addUser(user)

    response.status(201).json(newUser)
})

// GET /api/users
router.get('/', middleware.tokenAdminRequired, async (request, response) => {
    const users = await userDb.getUsers()

    logger.info('Read users count', users.length)
    response.status(200).json(users)
})

// POST /api/users/login
router.post('/login', async (request, response) => {
    const { username, password } = request.body

    if (!username || !password) {
        response.status(400).json({ error: 'must supply username and password' })
        return
    }

    const user = await userDb.getUserByUsername(username)
    if (!user) {
        logger.warn('Login attempt for non-existent user', username)
    }

    const passwordsMatch = user && (await bcrypt.compare(password, user.passwordHash))
    if (!user || !passwordsMatch) {
        response.status(401).json({ error: 'username or password is incorrect' })
        return
    }

    const expiresDate = new Date()
    expiresDate.setDate(expiresDate.getDate() + config.JWT_EXPIRATION_DAYS)
    const payload = {
        id: user.id,
        username: user.username,
        joinedDate: user.joinedDate,
        expiresDate,
        isAdmin: user.isAdmin,
    }

    logger.info('Successful login for user', payload)

    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRATION_SECONDS })
    response.status(200).json({ ...payload, token })
})

module.exports = router
