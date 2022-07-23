const Router = require('express')

const logger = require('../utils/logger')
const middleware = require('../utils/middleware')
const groceryDb = require('../models/grocery')

const router = Router()

// GET /api/groceries
router.get('/', middleware.tokenRequired, async (request, response) => {
    const groceries = await groceryDb.getGroceryItems()

    logger.info('Read groceries count', groceries.length)
    response.status(200).json(groceries)
})

// POST /api/groceries
router.post('/', middleware.tokenAdminRequired, async (request, response) => {
    const { name, aliases, sections, units } = request.body
    if (!name || !Array.isArray(aliases) || !Array.isArray(sections)) {
        response.status(400).json({ error: 'invalid input' })
        return
    }

    const grocery = {
        name,
        aliases,
        sections,
        units,
    }

    const addedGrocery = await groceryDb.addGroceryItem(grocery)
    response.status(200).json(addedGrocery)
})

module.exports = router
