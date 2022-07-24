const Router = require('express')

const logger = require('../utils/logger')
const middleware = require('../utils/middleware')
const groceryDb = require('../models/grocery')

const router = Router()

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

    const addedGrocery = await groceryDb.addGrocery(grocery)
    response.status(201).json(addedGrocery)
})

// GET /api/groceries
router.get('/', middleware.tokenRequired, async (request, response) => {
    const groceries = await groceryDb.getGroceries()

    logger.info('Read groceries count', groceries.length)
    response.status(200).json(groceries)
})

// GET /api/groceries/:id
router.get('/:id', middleware.tokenRequired, async (request, response) => {
    const { id } = request.params

    const idInt = parseInt(id, 10)
    if (!idInt) {
        response.status(400).json({ error: 'invalid id' })
        return
    }

    const grocery = await groceryDb.getGroceryById(idInt)

    if (!grocery) {
        response.sendStatus(404)
        return
    }

    response.status(200).json(grocery)
})

// PUT /api/groceries/:id
router.put('/:id', middleware.tokenAdminRequired, async (request, response) => {
    const { id } = request.params

    const idInt = parseInt(id, 10)
    if (!idInt) {
        response.status(400).json({ error: 'invalid id' })
        return
    }

    const idFromBody = request.body.id
    if (idInt !== idFromBody) {
        response.status(400).json({ error: 'id in body and path do not match' })
        return
    }

    const { name, aliases, sections, units } = request.body
    const updatedGrocery = {
        id: idInt,
        name,
        aliases,
        sections,
        units,
    }

    const wasUpdated = await groceryDb.updateGrocery(updatedGrocery)
    if (!wasUpdated) {
        response.sendStatus(404)
        return
    }

    response.sendStatus(204)
})

// DELETE /api/groceries/:id
router.delete('/:id', middleware.tokenAdminRequired, async (request, response) => {
    const { id } = request.params

    const idInt = parseInt(id, 10)
    if (!idInt) {
        response.status(400).json({ error: 'invalid id' })
        return
    }

    await groceryDb.deleteGrocery(idInt)

    response.sendStatus(204)
})

module.exports = router
