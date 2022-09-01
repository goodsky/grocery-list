const sinon = require('sinon')
const supertest = require('supertest')

const app = require('../app')
const crudTests = require('./crudtests')
const groceryDb = require('../models/grocery')
const helpers = require('./helpers')

describe('Groceries Controller', () => {
    afterEach(() => {
        sinon.restore()
    })

    crudTests(
        '/api/groceries',
        'grocery',
        groceryDb,
        {
            id: 1,
            name: 'Test Grocery',
            section: 'Test Section',
            units: 'foobars',
        },
        {
            create: {
                method: 'addGrocery',
                additionalTests: () => {
                    it('should not add a grocery if not admin', async () => {
                        await supertest(app)
                            .post('/api/groceries')
                            .set('Authorization', helpers.getJwt('not admin', false))
                            .send({ name: 'foo' })
                            .expect(403)
                    })
                },
            },
            retriveAll: { method: 'getGroceries' },
            retrieveById: { method: 'getGroceryById' },
            update: {
                method: 'updateGrocery',
                additionalTests: () => {
                    it('should not update grocery if not admin', async () => {
                        await supertest(app)
                            .put('/api/groceries/42')
                            .set('Authorization', helpers.getJwt('not admin', false))
                            .send({
                                id: 42,
                                name: 'Test Grocery',
                            })
                            .expect(403)
                    })
                },
            },
            remove: {
                method: 'deleteGrocery',
                additionalTests: () => {
                    it('should not delete grocery if not admin', async () => {
                        await supertest(app)
                            .put('/api/groceries/42')
                            .set('Authorization', helpers.getJwt('not admin', false))
                            .expect(403)
                    })
                },
            },
        }
    )
})
