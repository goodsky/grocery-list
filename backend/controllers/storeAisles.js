const Router = require('express')

const logger = require('../utils/logger')
const middleware = require('../utils/middleware')
const aisleDb = require('../models/storeAisle')

const router = Router()

const getStoreId = (request, response) => {
    const { storeId } = request.params
    const storeIdInt = parseInt(storeId, 10)

    if (!storeIdInt) {
        response.status(400).json({ error: 'invalid store id' })
        return null
    }

    return storeIdInt
}

const getId = (request, response) => {
    const { id } = request.params
    const idInt = parseInt(id, 10)

    if (!idInt) {
        response.status(400).json({ error: 'invalid id' })
        return null
    }

    return idInt
}

// POST /api/stores/:storeId/aisles
router.post('/:storeId/aisles', middleware.tokenAdminRequired, async (request, response) => {
    const storeId = getStoreId(request, response)
    if (!storeId) {
        return
    }

    const { name, position } = request.body
    if (!name) {
        response.status(400).json({ error: 'invalid input' })
        return
    }

    const aisle = {
        storeId,
        name,
        position,
    }

    if (typeof aisle.position === 'undefined') {
        logger.warn('Aisle added without position in store')
        aisle.position = -1
    }

    const addedAisle = await aisleDb.addAisle(aisle)
    response.status(201).json(addedAisle)
})

// GET /api/stores/:storeId/aisles
router.get('/:storeId/aisles', middleware.tokenRequired, async (request, response) => {
    const storeId = getStoreId(request, response)
    if (!storeId) {
        return
    }

    const aisles = await aisleDb.getAislesByStoreId(storeId)
    response.status(200).json(aisles)
})

// PUT /api/stores/:storeId/aisles/:id
router.put('/:storeId/aisles/:id', middleware.tokenAdminRequired, async (request, response) => {
    const storeId = getStoreId(request, response)
    if (!storeId) {
        return
    }

    const id = getId(request, response)
    if (!id) {
        return
    }

    const idFromBody = request.body.id
    if (id !== idFromBody) {
        response.status(400).json({ error: 'id in body and path do not match' })
        return
    }

    const { name, position } = request.body
    const updatedAisle = {
        id,
        name,
        position,
    }

    const wasUpdated = await aisleDb.updateAisle(updatedAisle)
    if (!wasUpdated) {
        response.sendStatus(404)
        return
    }

    response.sendStatus(204)
})

// DELETE /api/stores/:storeId/aisles/:id
router.delete('/:storeId/aisles/:id', middleware.tokenAdminRequired, async (request, response) => {
    const id = getId(request, response)

    await aisleDb.deleteAisle(id)

    response.sendStatus(204)
})

module.exports = router
