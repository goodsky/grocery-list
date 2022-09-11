const Router = require('express')

const logger = require('../utils/logger')
const middleware = require('../utils/middleware')
const listDb = require('../models/list')
const listItemDb = require('../models/listItem')

const router = Router()

const userIsOwner = async (listId, username) => {
    const list = await listDb.getListById(listId)
    return list && list.owner === username
}

// POST /api/lists/:listId/items
router.post('/:listId/items/', middleware.tokenRequired, async (request, response) => {
    const { groceryId, storeId, amount, unit, note } = request.body
    const { listId } = request.params
    const { username } = request.claims

    if (!groceryId || !storeId || !amount) {
        response.status(400).json({ error: 'invalid input' })
        return
    }

    if (!(await userIsOwner(listId, username))) {
        logger.warn(`User ${username} attempted to add to unowned list ${listId}`)
        response.sendStatus(404)
        return
    }

    const item = {
        listId,
        groceryId,
        storeId,
        amount,
        unit,
        note,
        pickedUp: false,
    }

    const addedItem = await listItemDb.addListItem(item)
    response.status(201).json(addedItem)
})

// GET /api/lists/:listId/items
router.get('/:listId/items/', middleware.tokenRequired, async (request, response) => {
    const { listId } = request.params
    const { username, isAdmin } = request.claims

    if (!(isAdmin || (await userIsOwner(listId, username)))) {
        logger.warn(`User ${username} attempted to get unowned list ${listId}`)
        response.sendStatus(404)
        return
    }

    const items = await listItemDb.getListItemsByListId(listId)
    response.status(200).json(items)
})

// GET /api/lists/:listId/items/:id
router.get('/:listId/items/:id', middleware.tokenRequired, async (request, response) => {
    const { listId, id } = request.params
    const { username, isAdmin } = request.claims

    const idInt = parseInt(id, 10)
    if (!idInt) {
        response.status(400).json({ error: 'invalid id' })
        return
    }

    if (!(isAdmin || (await userIsOwner(listId, username)))) {
        logger.warn(`User ${username} attempted to get item from unowned list ${listId}`)
        response.sendStatus(404)
        return
    }

    const item = await listItemDb.getListItemById(idInt)
    if (!item) {
        response.sendStatus(404)
        return
    }

    response.status(200).json(item)
})

// PUT /api/lists/:listId/items/:id
router.put('/:listId/items/:id', middleware.tokenRequired, async (request, response) => {
    const { listId, id } = request.params
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

    if (!(isAdmin || (await userIsOwner(listId, username)))) {
        logger.warn(`User ${username} attempted to update to unowned list ${listId}`)
        response.sendStatus(404)
        return
    }

    const { groceryId, storeId, amount, unit, note, pickedUp } = request.body
    const updatedItem = {
        id: idInt,
        groceryId,
        storeId,
        amount,
        unit,
        note,
        pickedUp,
    }

    const wasUpdated = await listItemDb.updateListItem(updatedItem)
    if (!wasUpdated) {
        response.sendStatus(404)
        return
    }

    response.sendStatus(204)
})

// DELETE /api/lists/:listId/items/:id
router.delete('/:listId/items/:id', middleware.tokenRequired, async (request, response) => {
    const { listId, id } = request.params
    const { username, isAdmin } = request.claims

    const idInt = parseInt(id, 10)
    if (!idInt) {
        response.status(400).json({ error: 'invalid id' })
        return
    }

    if (!(isAdmin || (await userIsOwner(listId, username)))) {
        logger.warn(`User ${username} attempted to delete from unowned list ${listId}`)
        response.sendStatus(204)
        return
    }

    await listItemDb.deleteListItem(idInt)

    response.sendStatus(204)
})

module.exports = router
