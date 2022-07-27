const Router = require('express')

const logger = require('../utils/logger')
const middleware = require('../utils/middleware')
const listDb = require('../models/list')

const router = Router()

// POST /api/lists
router.post('/', middleware.tokenRequired, async (request, response) => {
    const { name } = request.body
    const { username } = request.claims

    if (!name) {
        response.status(400).json({ error: 'invalid input' })
        return
    }

    const list = {
        name,
        owner: username,
        createdDate: new Date(),
    }

    const addedList = await listDb.addList(list)
    response.status(201).json(addedList)
})

// GET /api/lists(?all=true)
router.get('/', middleware.tokenRequired, async (request, response) => {
    const { username, isAdmin } = request.claims
    const readAll = request.query.all === 'true'

    let lists
    if (readAll && isAdmin) {
        lists = await listDb.getLists()
    } else {
        lists = await listDb.getListsByUsername(username)
    }

    logger.info(`Read ${lists.length} lists for user ${username} (all=${readAll})`)
    response.status(200).json(lists)
})

// GET /api/lists/:id
router.get('/:id', middleware.tokenRequired, async (request, response) => {
    const { id } = request.params
    const { username, isAdmin } = request.claims

    const idInt = parseInt(id, 10)
    if (!idInt) {
        response.status(400).json({ error: 'invalid id' })
        return
    }

    const list = await listDb.getListById(idInt, isAdmin ? null : username)

    if (!list) {
        response.sendStatus(404)
        return
    }

    response.status(200).json(list)
})

// PUT /api/lists/:id
router.put('/:id', middleware.tokenRequired, async (request, response) => {
    const { id } = request.params
    const { username, isAdmin } = request.claims

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

    const { name } = request.body
    const updatedList = {
        id: idInt,
        name,
    }

    const wasUpdated = await listDb.updateList(updatedList, isAdmin ? null : username)
    if (!wasUpdated) {
        response.sendStatus(404)
        return
    }

    response.sendStatus(204)
})

// DELETE /api/lists/:id
router.delete('/:id', middleware.tokenRequired, async (request, response) => {
    const { id } = request.params
    const { username, isAdmin } = request.claims

    const idInt = parseInt(id, 10)
    if (!idInt) {
        response.status(400).json({ error: 'invalid id' })
        return
    }

    await listDb.deleteList(idInt, isAdmin ? null : username)

    response.sendStatus(204)
})

module.exports = router
