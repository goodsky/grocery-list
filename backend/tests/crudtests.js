/* eslint-disable import/no-extraneous-dependencies */
const assert = require('assert')
const sinon = require('sinon')
const supertest = require('supertest')

const app = require('../app')
const helpers = require('./helpers')

// I thought this was fun.
// Is it a good idea? ... I don't know.
const crudTests = (url, noun, db, body, { create, retrieveAll, retrieveById, update, remove }, username) => {
    afterEach(() => {
        sinon.restore()
    })

    if (create) {
        describe(`POST ${url}`, () => {
            it(`should add a ${noun}`, async () => {
                const createStub = sinon.stub(db, create.method).resolves(body)

                const response = await supertest(app)
                    .post(url)
                    .set('Authorization', helpers.getJwt(username, true))
                    .send(body)
                    .expect(201)

                assert(createStub.calledOnce)
                assert.deepEqual(response.body, body)
            })

            it(`should not add a ${noun} if not authenticated`, async () => {
                await supertest(app).post(url).send(body).expect(401)
            })

            if (create.additionalTests) {
                create.additionalTests()
            }
        })
    }

    if (retrieveAll) {
        describe(`GET ${url}`, () => {
            it(`should return all ${noun}`, async () => {
                const retriveAllStub = sinon.stub(db, retrieveAll.method).resolves([body, body])

                const response = await supertest(app)
                    .get(url)
                    .set('Authorization', helpers.getJwt(username, true))
                    .expect(200)

                assert(retriveAllStub.calledOnce)
                assert.equal(response.body.length, 2)
            })

            it(`should not return all ${noun} if not authenticated`, async () => {
                await supertest(app).get(url).expect(401)
            })

            if (retrieveAll.additionalTests) {
                retrieveAll.additionalTests()
            }
        })
    }

    if (retrieveById) {
        describe(`GET ${url}/:id`, () => {
            it(`should return single ${noun}`, async () => {
                const retrieveByIdStub = sinon.stub(db, retrieveById.method).resolves(body)

                const response = await supertest(app)
                    .get(`${url}/42`)
                    .set('Authorization', helpers.getJwt(username, true))
                    .expect(200)

                assert(retrieveByIdStub.calledOnce)
                assert.deepEqual(response.body, body)
            })

            it(`should return 404 when ${noun} does not exist`, async () => {
                const retriveByIdStub = sinon.stub(db, retrieveById.method).resolves(null)

                await supertest(app).get(`${url}/42`).set('Authorization', helpers.getJwt(username, true)).expect(404)

                assert(retriveByIdStub.calledOnce)
            })

            it('should return 400 when id is not an integer', async () => {
                await supertest(app)
                    .get(`${url}/abcdefg`)
                    .set('Authorization', helpers.getJwt(username, true))
                    .expect(400)
            })

            it('should return 401 if not authenticated', async () => {
                await supertest(app).get(`${url}/42`).expect(401)
            })

            if (retrieveById.additionalTests) {
                retrieveById.additionalTests()
            }
        })
    }

    if (update) {
        describe(`PUT ${url}/:id`, () => {
            it(`should update ${noun}`, async () => {
                const updateStub = sinon.stub(db, update.method).resolves(1)
                const validBody = {
                    ...body,
                    id: 42,
                }

                await supertest(app)
                    .put(`${url}/42`)
                    .set('Authorization', helpers.getJwt(username, true))
                    .send(validBody)
                    .expect(204)

                assert(updateStub.calledOnce)
            })

            it(`should return 404 when ${noun} does not exist`, async () => {
                const updateStub = sinon.stub(db, update.method).resolves(null)
                const validBody = {
                    ...body,
                    id: 42,
                }

                await supertest(app)
                    .put(`${url}/42`)
                    .set('Authorization', helpers.getJwt(username, true))
                    .send(validBody)
                    .expect(404)

                assert(updateStub.calledOnce)
            })

            it('should not update if body and parameters do not match', async () => {
                const invalidBody = {
                    ...body,
                    id: 1234, // 1234 != 42
                }

                await supertest(app)
                    .put(`${url}/42`)
                    .set('Authorization', helpers.getJwt(username, true))
                    .send(invalidBody)
                    .expect(400)
            })

            it('should return 400 when id is not an integer', async () => {
                const validBody = {
                    ...body,
                    id: 42,
                }

                await supertest(app)
                    .put(`${url}/abcdefg`)
                    .set('Authorization', helpers.getJwt(username, true))
                    .send(validBody)
                    .expect(400)
            })

            it('should not update if not authenticated', async () => {
                await supertest(app).put(`${url}/42`).send(body).expect(401)
            })

            if (update.additionalTests) {
                update.additionalTests()
            }
        })
    }

    if (remove) {
        describe(`DELETE ${url}/:id`, () => {
            it(`should delete ${noun}`, async () => {
                const removeStub = sinon.stub(db, remove.method)

                await supertest(app)
                    .delete(`${url}/42`)
                    .set('Authorization', helpers.getJwt(username, true))
                    .expect(204)

                assert(removeStub.calledOnce)
            })

            it(`should not delete ${noun} if not authenticated`, async () => {
                await supertest(app).delete(`${url}/42`).expect(401)
            })

            if (remove.additionalTests) {
                remove.additionalTests()
            }
        })
    }
}

module.exports = crudTests
