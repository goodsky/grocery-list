const assert = require('assert')
const sinon = require('sinon')
const supertest = require('supertest')

const app = require('../app')
const crudTests = require('./crudtests')
const sectionDb = require('../models/storeSection')
const helpers = require('./helpers')

describe('Store Sections Controller', () => {
    afterEach(() => {
        sinon.restore()
    })

    crudTests(
        '/api/stores/42/aisles/1/sections',
        'section',
        sectionDb,
        {
            aisle: 1,
            name: 'Ice Cream',
        },
        {
            create: {
                method: 'addSection',
                additionalTests: () => {
                    it('should not add a section if not admin', async () => {
                        await supertest(app)
                            .post('/api/stores/42/aisles')
                            .set('Authorization', helpers.getJwt('not admin', false))
                            .send({ storeId: 42, name: 'Foo Grocery', position: 5 })
                            .expect(403)
                    })
                },
            },
            retrieveAll: { method: 'getSectionsByAisleId' },
            remove: {
                method: 'deleteSection',
                additionalTests: () => {
                    it('should not delete section if not admin', async () => {
                        await supertest(app)
                            .delete('/api/stores/42/aisles/1/sections/Ice%20Cream')
                            .set('Authorization', helpers.getJwt('not admin', false))
                            .expect(403)
                    })
                },
            },
        }
    )

    describe('GET /api/sections', () => {
        it('should return all sections', async () => {
            const retriveAllStub = sinon.stub(sectionDb, 'getAllSections').resolves(['foo', 'bar'])

            const response = await supertest(app)
                .get('/api/sections')
                .set('Authorization', helpers.getJwt('some_user'))
                .expect(200)

            assert(retriveAllStub.calledOnce)
            assert.equal(response.body.length, 2)
        })

        it(`should not return all sections if not authenticated`, async () => {
            await supertest(app).get('/api/sections').expect(401)
        })
    })
})
