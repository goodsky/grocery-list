const Router = require('express')

const middleware = require('../utils/middleware')
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

const getAisleId = (request, response) => {
    const { aisleId } = request.params
    const aisleIdInt = parseInt(aisleId, 10)

    if (!aisleIdInt) {
        response.status(400).json({ error: 'invalid aisle id' })
        return null
    }

    return aisleIdInt
}

const getName = (request, response) => {
    const { name } = request.params

    if (!name) {
        response.status(400).json({ error: 'invalid name' })
        return null
    }

    return name
}

// POST /api/stores/:storeId/aisles/:aisleId/sections
router.post('/:storeId/aisles/:aisleId/sections', middleware.tokenAdminRequired, async (request, response) => {
    const storeId = getStoreId(request, response)
    if (!storeId) {
        return
    }

    const aisleId = getAisleId(request, response)
    if (!aisleId) {
        return
    }

    const { name } = request.body
    if (!name) {
        response.status(400).json({ error: 'invalid input' })
        return
    }

    const section = {
        aisleId,
        name,
    }

    const addedSection = await sectionDb.addSection(section)
    response.status(201).json(addedSection)
})

// GET /api/stores/:storeId/aisles/:aisleId/sections
router.get('/:storeId/aisles/:aisleId/sections', middleware.tokenRequired, async (request, response) => {
    const storeId = getStoreId(request, response)
    if (!storeId) {
        return
    }

    const aisleId = getAisleId(request, response)
    if (!aisleId) {
        return
    }

    const sections = await sectionDb.getSectionsByAisleId(aisleId)
    response.status(200).json(sections)
})

// GET /api/stores/:storeId/sections
// Helper API: Get all sections for this aisle in one call
router.get('/:storeId/sections', middleware.tokenRequired, async (request, response) => {
    const storeId = getStoreId(request, response)
    if (!storeId) {
        return
    }

    const sections = await sectionDb.getSectionsByStoreId(storeId)
    response.status(200).json(sections)
})

// PUT /api/stores/:storeId/aisles/:aisleId/sections
// Helper API: Set all sections for this aisle in one call
router.put('/:storeId/aisles/:aisleId/sections', middleware.tokenAdminRequired, async (request, response) => {
    const storeId = getStoreId(request, response)
    if (!storeId) {
        return
    }

    const aisleId = getAisleId(request, response)
    if (!aisleId) {
        return
    }

    const { sections } = request.body
    if (!sections || !Array.isArray(sections)) {
        response.status(400).json({ error: 'Expected array of section names' })
        return
    }

    const currentSections = await sectionDb.getSectionsByAisleId(aisleId)

    const deletePromises = currentSections
        .filter((section) => sections.indexOf(section) === -1)
        .map((section) => sectionDb.deleteSection({ aisleId, name: section }))

    const addPromises = sections
        .filter((section) => currentSections.indexOf(section) === -1)
        .map((section) => sectionDb.addSection({ aisleId, name: section }))

    await Promise.all(deletePromises)
    await Promise.all(addPromises)

    response.sendStatus(204)
})

// DELETE /api/stores/:storeId/aisles/:aisleId/sections/:name
router.delete('/:storeId/aisles/:aisleId/sections/:name', middleware.tokenAdminRequired, async (request, response) => {
    const storeId = getStoreId(request, response)
    if (!storeId) {
        return
    }

    const aisleId = getAisleId(request, response)
    if (!aisleId) {
        return
    }

    const name = getName(request, response)

    await sectionDb.deleteSection({ aisleId, name })

    response.sendStatus(204)
})

module.exports = router
