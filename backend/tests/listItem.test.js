const assert = require('assert')
const sinon = require('sinon')
const supertest = require('supertest')

const app = require('../app')
const crudTests = require('./crudtests')
const listDb = require('../models/list')
const listItemDb = require('../models/listItem')
const helpers = require('./helpers')

describe('List Items Controller', () => {
    beforeEach(() => {
        // Called whenever interacting with a list item to verify ownership
        sinon.stub(listDb, 'getListById').resolves({
            id: 2,
            name: 'Test List',
            owner: 'defaultuser',
        })
    })

    afterEach(() => {
        sinon.restore()
    })

    crudTests(
        '/api/lists/2/items',
        'list item',
        listItemDb,
        {
            id: 1,
            listId: 2,
            groceryId: 33,
            storeId: 7,
            pickedUp: false,
            amount: 28.5,
            unitOverride: 'oz',
            multiplier: 2,
        },
        {
            create: {
                method: 'addListItem',
                additionalTests: () => {
                    it('should return 404 if list is not owned by user', async () => {
                        await supertest(app)
                            .post('/api/lists/2/items')
                            .set('Authorization', helpers.getJwt('notdefaultuser'))
                            .send({ groceryId: 33, storeId: 7, amount: 1 })
                            .expect(404)
                    })
                },
            },
            retrieveAll: {
                method: 'getListItemsByListId',
                additionalTests: () => {
                    it(`should return 404 if list is not owned by user`, async () => {
                        await supertest(app)
                            .get('/api/lists/2/items')
                            .set('Authorization', helpers.getJwt('notdefaultuser'))
                            .expect(404)
                    })
                },
            },
            retrieveById: {
                method: 'getListItemById',
                additionalTests: () => {
                    it('should return 404 if list is not owned by user', async () => {
                        await supertest(app)
                            .get('/api/lists/2/items/1')
                            .set('Authorization', helpers.getJwt('notdefaultuser'))
                            .expect(404)
                    })

                    it('should return list item if list is not owned by user, but user is admin', async () => {
                        sinon.stub(listItemDb, 'getListItemById').resolves({})

                        await supertest(app)
                            .get('/api/lists/2/items/1')
                            .set('Authorization', helpers.getJwt('admin', true))
                            .expect(200)
                    })
                },
            },
            update: {
                method: 'updateListItem',
                additionalTests: () => {
                    it('should not update list if list is not owned by user and return 404', async () => {
                        const updateStub = sinon.stub(listItemDb, 'updateListItem').resolves(1)

                        await supertest(app)
                            .put('/api/lists/2/items/1')
                            .set('Authorization', helpers.getJwt('notdefaultuser'))
                            .send({ id: 1, groceryId: 33, storeId: 7, amount: 1 })
                            .expect(404)

                        assert(updateStub.notCalled)
                    })

                    it('should update list if list is not owned by user but user is admin', async () => {
                        const updateStub = sinon.stub(listItemDb, 'updateListItem').resolves(1)

                        await supertest(app)
                            .put('/api/lists/2/items/1')
                            .set('Authorization', helpers.getJwt('admin', true))
                            .send({ id: 1, groceryId: 33, storeId: 7, amount: 1 })
                            .expect(204)

                        assert(updateStub.calledOnce)
                    })
                },
            },
            remove: {
                method: 'deleteListItem',
                additionalTests: () => {
                    it('should not delete if list is not owned by user and return 204', async () => {
                        const deleteStub = sinon.stub(listItemDb, 'deleteListItem').resolves(1)

                        await supertest(app)
                            .delete('/api/lists/2/items/1')
                            .set('Authorization', helpers.getJwt('notdefaultuser'))
                            .expect(204)

                        assert(deleteStub.notCalled)
                    })

                    it('should delete if list is not owned by user but user is admin', async () => {
                        const deleteStub = sinon.stub(listItemDb, 'deleteListItem')

                        await supertest(app)
                            .delete('/api/lists/2/items/1')
                            .set('Authorization', helpers.getJwt('admin', true))
                            .expect(204)

                        assert(deleteStub.calledOnce)
                    })
                },
            },
        },
        'defaultuser'
    )
})
