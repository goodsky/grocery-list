const Router = require('express')

const logger = require('../utils/logger')
const middleware = require('../utils/middleware')
const aisleDb = require('../models/storeAisle')
const sectionDb = require('../models/storeSection')

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

// GET /api/stores/:storeId/aisles(?all=true)
router.get('/:storeId/aisles', middleware.tokenRequired, async (request, response) => {
    const storeId = getStoreId(request, response)
    if (!storeId) {
        return
    }

    const getAll = request.query.all === 'true'

    let aisles = await aisleDb.getAislesByStoreId(storeId)

    if (getAll) {
        const sectionPromises = aisles.map((aisle) => sectionDb.getSectionsByAisleId(aisle.id))
        const sections = await Promise.all(sectionPromises)

        aisles = aisles.map((aisle, i) => ({
            id: aisle.id,
            name: aisle.name,
            position: aisle.position,
            sections: sections[i],
        }))
    }

    response.status(200).json(aisles)
})

// PUT /api/stores/:storeId/aisles
// Helper API: Set the order for all aisles in one call
router.put('/:storeId/aisles', middleware.tokenAdminRequired, async (request, response) => {
    const storeId = getStoreId(request, response)
    if (!storeId) {
        return
    }

    const { order } = request.body
    if (!order || !Array.isArray(order)) {
        response.status(400).json({ error: 'Expected array of aisle ids' })
        return
    }

    const aisles = await aisleDb.getAislesByStoreId(storeId)

    const aisleIdsSorted = aisles.map((aisle) => aisle.id).sort()
    const orderSorted = [...order].sort()

    if (aisleIdsSorted.length !== orderSorted.length) {
        response.status(400).json({
            error: 'Must supply order for all aisles in the store',
            expected: aisleIdsSorted,
            supplied: orderSorted,
        })
        return
    }

    for (let i = 0; i < aisleIdsSorted.length; i++) {
        if (aisleIdsSorted[i] !== orderSorted[i]) {
            response.status(400).json({
                error: 'Must supply order for all aisles in the store',
                expected: aisleIdsSorted,
                supplied: orderSorted,
            })
            return
        }
    }

    const reorderedAisles = aisles.map((aisle) => ({
        id: aisle.id,
        name: aisle.name,
        position: order.indexOf(aisle.id),
    }))

    const updatePromises = reorderedAisles.map((aisle) => aisleDb.updateAisle(aisle))
    const updates = await Promise.all(updatePromises)
    if (updates.some((updated) => !updated)) {
        logger.error('Failed to reorder aisles.', reorderedAisles, updates)
        response.status(500).json({ error: 'Failed to reorder aisles' })
        return
    }

    response.status(200).json(reorderedAisles)
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

    await sectionDb.deleteSectionByAisleId(id)
    await aisleDb.deleteAisle(id)

    response.sendStatus(204)
})

module.exports = router
