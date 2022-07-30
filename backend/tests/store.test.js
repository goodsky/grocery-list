const sinon = require('sinon')
const supertest = require('supertest')

const app = require('../app')
const crudTests = require('./crudtests')
const storeDb = require('../models/store')
const helpers = require('./helpers')

describe('Stores Controller', () => {
    afterEach(() => {
        sinon.restore()
    })

    crudTests(
        '/api/stores',
        'store',
        storeDb,
        {
            id: 1,
            name: 'Test Mart',
            address: '1234 FooBar Circle, Orlando FL 12345',
        },
        {
            create: {
                method: 'addStore',
                additionalTests: () => {
                    it('should not add a store if not admin', async () => {
                        await supertest(app)
                            .post('/api/store')
                            .set('Authorization', helpers.getJwt('not admin', false))
                            .send({ name: 'Foo Grocery', address: 'abcdefg' })
                            .expect(403)
                    })
                },
            },
            retriveAll: { method: 'getStores' },
            retrieveById: { method: 'getStoreById' },
            update: {
                method: 'updateStore',
                additionalTests: () => {
                    it('should not update store if not admin', async () => {
                        await supertest(app)
                            .put('/api/stores/42')
                            .set('Authorization', helpers.getJwt('not admin', false))
                            .send({
                                id: 42,
                                name: 'Foo Grocery',
                            })
                            .expect(403)
                    })
                },
            },
            remove: {
                method: 'deleteStore',
                additionalTests: () => {
                    it('should not delete store if not admin', async () => {
                        await supertest(app)
                            .put('/api/stores/42')
                            .set('Authorization', helpers.getJwt('not admin', false))
                            .expect(403)
                    })
                },
            },
        }
    )
})
