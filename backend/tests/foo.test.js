const assert = require('assert')
const sinon = require('sinon')
const supertest = require('supertest')

const app = require('../app')
const fooModel = require('../models/foo')

describe('Array', () => {
    describe('#indexOf()', () => {
        it('should return -1 when the value is not present', () => {
            assert.equal([1, 2, 3].indexOf(4), -1)
        })
    })
})

describe('Foo Controller', () => {
    it('should return a secret value', async () => {
        const fooModelMock = sinon.mock(fooModel)

        // sinon fakes:
        //    returns
        //    throws
        //    resolves (returns a promise)
        //    rejects (returns a failed promise)
        fooModelMock.expects('getFoo').once().resolves([1, 2, 3])

        const response = await supertest(app).get('/api/foo').expect(200)
        console.log(response.body)
        assert.equal(response.body.secret, 42)

        fooModelMock.verify()
        fooModelMock.restore()
    })
})
