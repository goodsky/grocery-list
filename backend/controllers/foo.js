const Router = require('express')

const foo = require('../models/foo')
const logger = require('../utils/logger')

const router = Router()
router.get('/', async (request, response) => {
    const allmyfoos = await foo.getFoo()
    const hello = {
        message: `Hello World! This time now is ${new Date()}.`,
        foo: allmyfoos,
    }

    logger.info('Returning message', hello.message)
    response.status(200).json(hello)
})

module.exports = router
