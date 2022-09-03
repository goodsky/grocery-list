const sinon = require('sinon')
const supertest = require('supertest')

const app = require('../app')
const crudTests = require('./crudtests')
const aisleDb = require('../models/storeAisle')
const helpers = require('./helpers')

describe('Store Aisles Controller', () => {
    afterEach(() => {
        sinon.restore()
    })

    crudTests(
        '/api/stores/42/aisles',
        'aisle',
        aisleDb,
        {
            id: 1,
            storeId: 42,
            name: 'Frozen Foods',
            position: 5,
        },
        {
            create: {
                method: 'addAisle',
                additionalTests: () => {
                    it('should not add a aisle if not admin', async () => {
                        await supertest(app)
                            .post('/api/stores/42/aisles')
                            .set('Authorization', helpers.getJwt('not admin', false))
                            .send({ storeId: 42, name: 'Foo Grocery', position: 5 })
                            .expect(403)
                    })
                },
            },
            update: {
                method: 'updateAisle',
                additionalTests: () => {
                    it('should not update aisle if not admin', async () => {
                        await supertest(app)
                            .put('/api/stores/42/aisles/1')
                            .set('Authorization', helpers.getJwt('not admin', false))
                            .send({
                                id: 1,
                                name: 'Fun Frozen Food',
                            })
                            .expect(403)
                    })
                },
            },
            retrieveAll: { method: 'getAislesByStoreId' },
            remove: {
                method: 'deleteAisle',
                additionalTests: () => {
                    it('should not delete aisle if not admin', async () => {
                        await supertest(app)
                            .delete('/api/stores/42/aisles/1')
                            .set('Authorization', helpers.getJwt('not admin', false))
                            .expect(403)
                    })
                },
            },
        }
    )
})
