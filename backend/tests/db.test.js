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

        // Expect create then later with columns
        assert(queryStub.calledTwice)
        const queryText = queryStub.getCall(0).args[0]
        assert.equal(
            queryText,
            'CREATE TABLE IF NOT EXISTS testtable (col1 SERIAL, col2 TEXT PRIMARY KEY, col3 TIMESTAMP WITH TIME ZONE, col4 BOOLEAN)'
        )

        const alterText = queryStub.getCall(1).args[0]
        assert.equal(
            alterText,
            'ALTER TABLE testtable ADD COLUMN IF NOT EXISTS col1 SERIAL, ADD COLUMN IF NOT EXISTS col2 TEXT PRIMARY KEY, ADD COLUMN IF NOT EXISTS col3 TIMESTAMP WITH TIME ZONE, ADD COLUMN IF NOT EXISTS col4 BOOLEAN'
        )
    })

    it('should insert into table', async () => {
        const queryStub = sinon.stub(pgWrapper, 'query').resolves({ rows: ['foo'] })
        await db.insert('testtable', {
            values: {
                col2: 'This is my string',
                col3: new Date('1/1/1970'),
                col4: true,
            },
        })

        assert(queryStub.calledOnce)
        const queryText = queryStub.getCall(0).args[0]
        const queryValues = queryStub.getCall(0).args[1]
        const expectedValues = ['This is my string', new Date('1/1/1970'), true]

        assert.equal(queryText, 'INSERT INTO testtable (col2, col3, col4) VALUES($1, $2, $3)')
        assert.equal(queryValues.toString(), expectedValues.toString())
    })

    it('should insert into table with return', async () => {
        const queryStub = sinon.stub(pgWrapper, 'query').resolves({ rows: ['foo'] })
        const result = await db.insert('testtable', {
            values: {
                col2: 'This is my string',
                col3: new Date('1/1/1970'),
                col4: true,
            },
            returning: ['col1', 'col2', 'col4'],
        })

        assert(queryStub.calledOnce)
        const queryText = queryStub.getCall(0).args[0]
        const queryValues = queryStub.getCall(0).args[1]
        const expectedValues = ['This is my string', new Date('1/1/1970'), true]

        assert.equal(
            queryText,
            'INSERT INTO testtable (col2, col3, col4) VALUES($1, $2, $3) RETURNING col1, col2, col4'
        )
        assert.equal(queryValues.toString(), expectedValues.toString())
        assert.equal(result.toString(), ['foo'].toString())
    })

    it('should select rows', async () => {
        const queryStub = sinon.stub(pgWrapper, 'query').resolves({ rows: ['foo'] })
        const result = await db.select('testtable', {
            columns: ['col1', 'col2', 'col3'],
        })

        assert(queryStub.calledOnce)
        const queryText = queryStub.getCall(0).args[0]

        assert.equal(queryText, 'SELECT col1, col2, col3 FROM testtable')
        assert.equal(result.toString(), ['foo'].toString())
    })

    it('should select rows with filter', async () => {
        const queryStub = sinon.stub(pgWrapper, 'query').resolves({ rows: ['foo'] })
        const result = await db.select('testtable', {
            columns: ['col1', 'col2', 'col3'],
            filters: { id: 'ABC' },
        })

        assert(queryStub.calledOnce)
        const queryText = queryStub.getCall(0).args[0]
        const queryValues = queryStub.getCall(0).args[1]
        const expectedValues = ['ABC']

        assert.equal(queryText, 'SELECT col1, col2, col3 FROM testtable WHERE id = $1')
        assert.equal(queryValues.toString(), expectedValues.toString())
        assert.equal(result.toString(), ['foo'].toString())
    })

    it('should select rows with multiple filters', async () => {
        const queryStub = sinon.stub(pgWrapper, 'query').resolves({ rows: ['foo'] })
        const result = await db.select('testtable', {
            columns: ['col1', 'col2', 'col3'],
            filters: { id: 'ABC', name: 'wombat' },
        })

        assert(queryStub.calledOnce)
        const queryText = queryStub.getCall(0).args[0]
        const queryValues = queryStub.getCall(0).args[1]
        const expectedValues = ['ABC', 'wombat']

        assert.equal(queryText, 'SELECT col1, col2, col3 FROM testtable WHERE id = $1 AND name = $2')
        assert.equal(queryValues.toString(), expectedValues.toString())
        assert.equal(result.toString(), ['foo'].toString())
    })

    it('should update row', async () => {
        const queryStub = sinon.stub(pgWrapper, 'query').resolves({ rowCount: 1 })
        const result = await db.update('testtable', {
            values: {
                col2: 'new value',
                col4: 'abcdefg',
                col5: 37,
            },
            filters: {
                id: 42,
                username: 'foo',
            },
        })

        assert(queryStub.calledOnce)
        const queryText = queryStub.getCall(0).args[0]
        const queryValues = queryStub.getCall(0).args[1]
        const expectedValues = ['new value', 'abcdefg', 37, 42, 'foo']

        assert.equal(queryText, 'UPDATE testtable SET col2 = $1, col4 = $2, col5 = $3 WHERE id = $4 AND username = $5')
        assert.equal(queryValues.toString(), expectedValues.toString())
        assert.equal(result, 1)
    })

    it('should delete row', async () => {
        const queryStub = sinon.stub(pgWrapper, 'query').resolves({ rowCount: 1 })
        const result = await db.remove('testtable', {
            filters: {
                id: 42,
                name: 'wombat',
            },
        })

        assert(queryStub.calledOnce)
        const queryText = queryStub.getCall(0).args[0]
        const queryValues = queryStub.getCall(0).args[1]
        const expectedValues = [42, 'wombat']

        assert.equal(queryText, 'DELETE FROM testtable WHERE id = $1 AND name = $2')
        assert.equal(queryValues.toString(), expectedValues.toString())
        assert.equal(result, 1)
    })
})
