const assert = require('assert')
const sinon = require('sinon')
const supertest = require('supertest')

const app = require('../app')
const crudTests = require('./crudtests')
const listDb = require('../models/list')
const helpers = require('./helpers')

describe('Lists Controller', () => {
    afterEach(() => {
        sinon.restore()
    })

    crudTests(
        '/api/lists',
        'list',
        listDb,
        {
            id: 1,
            name: 'Test List',
            owner: 'defaultuser',
        },
        {
            create: {
                method: 'addList',
                additionalTests: () => {
                    it('should set owner list to username of creator', async () => {
                        const createStub = sinon
                            .stub(listDb, 'addList')
                            .resolves({ id: 1, name: 'Test List', owner: 'listowner' })

                        await supertest(app)
                            .post('/api/lists')
                            .set('Authorization', helpers.getJwt('listowner'))
                            .send({ name: 'Test List' })
                            .expect(201)

                        const createdList = createStub.getCall(0).args[0]
                        assert.equal(createdList.owner, 'listowner')
                    })
                },
            },
            retrieveAll: {
                method: 'getListsByUsername',
                additionalTests: () => {
                    it(`should only query for lists owned by user`, async () => {
                        const retrieveAllStub = sinon.stub(listDb, 'getListsByUsername').resolves([])

                        await supertest(app)
                            .get('/api/lists')
                            .set('Authorization', helpers.getJwt('listowner'))
                            .expect(200)

                        assert(retrieveAllStub.calledOnce)
                        const queriedOwner = retrieveAllStub.getCall(0).args[0]
                        assert.equal(queriedOwner, 'listowner')
                    })
                },
            },
            retrieveById: {
                method: 'getListById',
                additionalTests: () => {
                    it('should return 404 if list is not owned by user', async () => {
                        const getByIdStub = sinon.stub(listDb, 'getListById').resolves(null)

                        await supertest(app)
                            .get('/api/lists/37')
                            .set('Authorization', helpers.getJwt('thisguy'))
                            .expect(404)

                        // this test asserts that the username was supplied as a filter
                        assert(getByIdStub.calledOnce)
                        assert(getByIdStub.getCall(0).args.includes('thisguy'))
                    })

                    it('should return list if list is not owned by user, but user is admin', async () => {
                        const getByIdStub = sinon
                            .stub(listDb, 'getListById')
                            .resolves({ id: 37, name: 'Secret List', owner: 'otherguy' })

                        await supertest(app)
                            .get('/api/lists/37')
                            .set('Authorization', helpers.getJwt('admin', true))
                            .expect(200)

                        // this test asserts that the username was NOT supplied as a filter
                        assert(getByIdStub.calledOnce)
                        assert(!getByIdStub.getCall(0).args.includes('admin'))
                    })
                },
            },
            update: {
                method: 'updateList',
                additionalTests: () => {
                    it('should not update list if list is not owned by user and return 404', async () => {
                        const updateStub = sinon.stub(listDb, 'updateList').resolves(0)

                        await supertest(app)
                            .put('/api/lists/37')
                            .set('Authorization', helpers.getJwt('thisguy'))
                            .send({ id: 37, name: 'New Name' })
                            .expect(404)

                        // this test asserts that the username was supplied as a filter
                        assert(updateStub.calledOnce)
                        assert(updateStub.getCall(0).args.includes('thisguy'))
                    })

                    it('should update list if list is not owned by user but user is admin', async () => {
                        const updateStub = sinon.stub(listDb, 'updateList').resolves(1)

                        await supertest(app)
                            .put('/api/lists/37')
                            .set('Authorization', helpers.getJwt('admin', true))
                            .send({ id: 37, name: 'New Name' })
                            .expect(204)

                        // this test asserts that the username was supplied as a filter
                        assert(updateStub.calledOnce)
                        assert(!updateStub.getCall(0).args.includes('admin'))
                    })
                },
            },
            remove: {
                method: 'deleteList',
                additionalTests: () => {
                    it('should not delete if list is not owned by user and return 404', async () => {
                        const deleteStub = sinon.stub(listDb, 'deleteList')

                        await supertest(app)
                            .delete('/api/lists/37')
                            .set('Authorization', helpers.getJwt('thisguy'))
                            .expect(204)

                        // this test asserts that the username was supplied as a filter
                        assert(deleteStub.calledOnce)
                        assert(deleteStub.getCall(0).args.includes('thisguy'))
                    })

                    it('should delete if list is not owned by user but user is admin', async () => {
                        const deleteStub = sinon.stub(listDb, 'deleteList')

                        await supertest(app)
                            .delete('/api/lists/37')
                            .set('Authorization', helpers.getJwt('admin', true))
                            .expect(204)

                        // this test asserts that the username was supplied as a filter
                        assert(deleteStub.calledOnce)
                        assert(!deleteStub.getCall(0).args.includes('admin'))
                    })
                },
            },
        },
        'defaultuser'
    )

    describe(`GET /api/lists?all=true`, () => {
        it(`should return ALL lists when admin`, async () => {
            const retriveAllStub = sinon.stub(listDb, 'getLists').resolves([{ name: 'A' }, { name: 'B' }])

            const response = await supertest(app)
                .get('/api/lists?all=true')
                .set('Authorization', helpers.getJwt('admin', true))
                .expect(200)

            assert(retriveAllStub.calledOnce)
            assert.equal(response.body.length, 2)
        })

        it(`should not return ALL lists if not admin`, async () => {
            const retrieveStub = sinon.stub(listDb, 'getListsByUsername').resolves([{ name: 'A' }, { name: 'B' }])
            const retriveAllStub = sinon.stub(listDb, 'getLists')

            await supertest(app).get('/api/lists?all=true').set('Authorization', helpers.getJwt()).expect(200)

            assert(retrieveStub.calledOnce)
            assert(retriveAllStub.notCalled)
        })

        it(`should not return ALL lists if not authenticated`, async () => {
            await supertest(app).get('/api/lists/all').expect(401)
        })
    })
})
