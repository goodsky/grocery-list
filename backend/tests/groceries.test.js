const assert = require('assert')
const sinon = require('sinon')
const supertest = require('supertest')

const app = require('../app')
const groceryDb = require('../models/grocery')
const helpers = require('./helpers')

describe('Groceries Controller', () => {
    afterEach(() => {
        sinon.restore()
    })

    describe('POST /api/groceries', () => {
        it('should add a grocery', async () => {
            const addGroceryStub = sinon.stub(groceryDb, 'addGrocery').resolves({ name: 'Test Grocery' })
            const body = {
                name: 'Test Grocery',
                aliases: [],
                sections: ['Test Section'],
            }

            const response = await supertest(app)
                .post('/api/groceries')
                .set('Authorization', helpers.getJwt('admin', true))
                .send(body)
                .expect(201)

            assert(addGroceryStub.calledOnce)
            assert.equal(response.body.name, 'Test Grocery')
        })

        it('should not add a grocery if not authenticated', async () => {
            await supertest(app).post('/api/groceries').send({ name: 'foo' }).expect(401)
        })

        it('should not add a grocery if not admin', async () => {
            await supertest(app)
                .post('/api/groceries')
                .set('Authorization', helpers.getJwt('not admin', false))
                .send({ name: 'foo' })
                .expect(403)
        })
    })

    describe('GET /api/groceries', () => {
        it('should return groceries', async () => {
            const getGroceriesStub = sinon
                .stub(groceryDb, 'getGroceries')
                .resolves([{ name: 'Grocery 1' }, { name: 'Grocery 2' }])

            const response = await supertest(app)
                .get('/api/groceries')
                .set('Authorization', helpers.getJwt())
                .expect(200)

            assert(getGroceriesStub.calledOnce)
            assert.equal(response.body.length, 2)
        })

        it('should not return groceries if not authenticated', async () => {
            await supertest(app).get('/api/groceries').expect(401)
        })
    })

    describe('GET /api/groceries/:id', () => {
        it('should return single grocery', async () => {
            const getGroceryByIdStub = sinon
                .stub(groceryDb, 'getGroceryById')
                .resolves({ id: 42, name: 'Test Grocery' })

            const response = await supertest(app)
                .get('/api/groceries/42')
                .set('Authorization', helpers.getJwt())
                .expect(200)

            assert(getGroceryByIdStub.calledOnce)
            assert.deepEqual(response.body, { id: 42, name: 'Test Grocery' })
        })

        it('should return 404 when grocery does not exist', async () => {
            const getGroceryByIdStub = sinon.stub(groceryDb, 'getGroceryById').resolves(null)

            await supertest(app).get('/api/groceries/42').set('Authorization', helpers.getJwt()).expect(404)

            assert(getGroceryByIdStub.calledOnce)
        })

        it('should return 400 when id is not an integer', async () => {
            await supertest(app).get('/api/groceries/abcdefg').set('Authorization', helpers.getJwt()).expect(400)
        })

        it('should not return single grocery if not authenticated', async () => {
            await supertest(app).get('/api/groceries/42').expect(401)
        })
    })

    describe('PUT /api/groceries/:id', () => {
        it('should update grocery', async () => {
            const updateGroceryStub = sinon.stub(groceryDb, 'updateGrocery').resolves({ id: 42 })
            const body = {
                id: 42,
                name: 'Test Grocery',
            }

            await supertest(app)
                .put('/api/groceries/42')
                .set('Authorization', helpers.getJwt('admin', true))
                .send(body)
                .expect(204)

            assert(updateGroceryStub.calledOnce)
        })

        it('should return 404 when grocery does not exist', async () => {
            const updateGroceryStub = sinon.stub(groceryDb, 'updateGrocery').resolves(null)
            const body = {
                id: 42,
                name: 'Test Grocery',
            }

            await supertest(app)
                .put('/api/groceries/42')
                .set('Authorization', helpers.getJwt('admin', true))
                .send(body)
                .expect(404)

            assert(updateGroceryStub.calledOnce)
        })

        it('should not update if body and parameters do not match', async () => {
            const body = {
                id: 1234, // 1234 != 42
                name: 'Test Grocery',
            }

            await supertest(app)
                .put('/api/groceries/42')
                .set('Authorization', helpers.getJwt('admin', true))
                .send(body)
                .expect(400)
        })

        it('should return 400 when id is not an integer', async () => {
            await supertest(app)
                .put('/api/groceries/abcdefg')
                .set('Authorization', helpers.getJwt('admin', true))
                .expect(400)
        })

        it('should not update grocery if not authenticated', async () => {
            const body = {
                id: 42,
                name: 'Test Grocery',
            }

            await supertest(app).put('/api/groceries/42').send(body).expect(401)
        })

        it('should not update grocery if not admin', async () => {
            const body = {
                id: 42,
                name: 'Test Grocery',
            }

            await supertest(app)
                .put('/api/groceries/42')
                .set('Authorization', helpers.getJwt('not admin', false))
                .send(body)
                .expect(403)
        })
    })

    describe('DELETE /api/groceries/:id', () => {
        it('should delete grocery', async () => {
            const deleteGroceryStub = sinon.stub(groceryDb, 'deleteGrocery')

            await supertest(app)
                .delete('/api/groceries/42')
                .set('Authorization', helpers.getJwt('admin', true))
                .expect(204)

            assert(deleteGroceryStub.calledOnce)
        })

        it('should not delete grocery if not authenticated', async () => {
            await supertest(app).delete('/api/groceries/42').expect(401)
        })

        it('should not delete grocery if not admin', async () => {
            await supertest(app)
                .put('/api/groceries/42')
                .set('Authorization', helpers.getJwt('not admin', false))
                .expect(403)
        })
    })
})
