const Router = require('express')

const logger = require('../utils/logger')
const middleware = require('../utils/middleware')
const storeDb = require('../models/store')
const aisleDb = require('../models/storeAisle')
const sectionDb = require('../models/storeSection')

const router = Router()

// POST /api/stores
router.post('/', middleware.tokenAdminRequired, async (request, response) => {
    const { name, address } = request.body
    if (!name || !address) {
        response.status(400).json({ error: 'invalid input' })
        return
    }

    const store = {
        name,
        address,
    }

    const addedStore = await storeDb.addStore(store)
    response.status(201).json(addedStore)
})

// GET /api/stores
router.get('/', middleware.tokenRequired, async (request, response) => {
    const stores = await storeDb.getStores()

    logger.info('Read stores count', stores.length)
    response.status(200).json(stores)
})

// GET /api/stores/:id(?aisles=true)
router.get('/:id', middleware.tokenRequired, async (request, response) => {
    const { id } = request.params
    const populateAisles = request.query.aisles === 'true'

    const idInt = parseInt(id, 10)
    if (!idInt) {
        response.status(400).json({ error: 'invalid id' })
        return
    }

    const store = await storeDb.getStoreById(idInt)

    if (!store) {
        response.sendStatus(404)
        return
    }

    if (populateAisles) {
        const aisles = await aisleDb.getAislesByStoreId(idInt)
        const sectionPromises = aisles.map((aisle) => sectionDb.getSectionsByAisleId(aisle.id))
        const sections = await Promise.all(sectionPromises)

        const aislesWithSections = aisles.map((aisle, i) => ({
            id: aisle.id,
            name: aisle.name,
            position: aisle.position,
            sections: sections[i],
        }))

        store.aisles = aislesWithSections
    }

    response.status(200).json(store)
})

// PUT /api/stores/:id
// TODO: I think I should just make this the mega store endpoint... why bother with aisles and sections separately?
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

    const { name, address } = request.body
    const updatedStore = {
        id: idInt,
        name,
        address,
    }

    const wasUpdated = await storeDb.updateStore(updatedStore)
    if (!wasUpdated) {
        response.sendStatus(404)
        return
    }

    response.sendStatus(204)
})

// DELETE /api/stores/:id
router.delete('/:id', middleware.tokenAdminRequired, async (request, response) => {
    const { id } = request.params

    const idInt = parseInt(id, 10)
    if (!idInt) {
        response.status(400).json({ error: 'invalid id' })
        return
    }

    await storeDb.deleteStore(idInt)

    response.sendStatus(204)
})

module.exports = router
