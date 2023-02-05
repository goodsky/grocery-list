const Router = require('express')

const middleware = require('../utils/middleware')
const sectionDb = require('../models/storeSection')
const groceryDb = require('../models/grocery')

const router = Router()

// GET /api/sections
router.get('/', middleware.tokenRequired, async (request, response) => {
    const sections = await sectionDb.getAllSections()
    response.status(200).json(sections)
})

// GET /api/sections/groceries
router.get('/groceries', middleware.tokenRequired, async (request, response) => {
    const sections = await groceryDb.getGrocerySections()
    response.status(200).json(sections)
})

module.exports = router
