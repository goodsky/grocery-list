/* eslint-disable no-console */

const config = require('./config')

const info = (...params) => {
    if (config.NODE_ENV !== 'test') {
        console.log(params)
    }
}

const warn = (...params) => {
    if (config.NODE_ENV !== 'test') {
        console.warn(params)
    }
}

const error = (...params) => {
    console.error(params)
}

module.exports = {
    info,
    warn,
    error,
}
