const jwt = require('jsonwebtoken')

const config = require('../utils/config')

const getAuthHeader = (username = 'defaultuser', isAdmin = false, expiresIn = 60) => {
    const payload = {
        id: 42,
        username,
        joinedDate: new Date(),
        isAdmin,
    }

    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn })
    return `Bearer ${token}`
}

module.exports = {
    getAuthHeader,
}
