const assert = require('assert')
const sinon = require('sinon')

const db = require('../utils/db')
const pgWrapper = require('../utils/pgWrapper')

describe('PostgreSQL db wrapper', () => {
    afterEach(() => {
        sinon.restore()
    })

    it('should query wrapper', async () => {
        const queryStub = sinon.stub(pgWrapper, 'query').resolves(null)
        await db.query('FOO', 'BAR')

        assert(queryStub.calledOnce)
        assert.equal(queryStub.getCall(0).args[0], 'FOO')
        assert.equal(queryStub.getCall(0).args[1], 'BAR')
    })

    it('should create table', async () => {
        const queryStub = sinon.stub(pgWrapper, 'query').resolves(null)
        await db.createTable('testtable', {
            col1: 'SERIAL',
            col2: 'TEXT PRIMARY KEY',
            col3: 'TIMESTAMP WITH TIME ZONE',
            col4: 'BOOLEAN',
        })

        assert(queryStub.calledOnce)
        assert.equal(
            queryStub.getCall(0).args[0],
            'CREATE TABLE IF NOT EXISTS testtable (col1 SERIAL, col2 TEXT PRIMARY KEY, col3 TIMESTAMP WITH TIME ZONE, col4 BOOLEAN)'
        )
    })

    it('should insert into table', async () => {
        const queryStub = sinon.stub(pgWrapper, 'query').resolves({})
        await db.insert('testtable', {
            col2: 'This is my string',
            col3: new Date('1/1/1970'),
            col4: true,
        })

        assert(queryStub.calledOnce)
        assert.equal(queryStub.getCall(0).args[0], 'INSERT INTO testtable (col2, col3, col4) VALUES($1, $2, $3)')

        const expectedValues = ['This is my string', new Date('1/1/1970'), true]
        const actualValues = queryStub.getCall(0).args[1]
        assert.equal(actualValues.toString(), expectedValues.toString())
    })

    it('should insert into table with return', async () => {
        const queryStub = sinon.stub(pgWrapper, 'query').resolves({ rows: ['foo'] })
        const result = await db.insert(
            'testtable',
            {
                col2: 'This is my string',
                col3: new Date('1/1/1970'),
                col4: true,
            },
            ['col1', 'col2', 'col4']
        )

        assert(queryStub.calledOnce)
        assert.equal(
            queryStub.getCall(0).args[0],
            'INSERT INTO testtable (col2, col3, col4) VALUES($1, $2, $3) RETURNING col1, col2, col4'
        )

        const expectedValues = ['This is my string', new Date('1/1/1970'), true]
        const actualValues = queryStub.getCall(0).args[1]
        assert.equal(actualValues.toString(), expectedValues.toString())

        assert.equal(result.length, 1)
        assert.equal(result[0], 'foo')
    })
})
