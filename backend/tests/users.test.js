const assert = require('assert')
const sinon = require('sinon')
const supertest = require('supertest')

const app = require('../app')
const userDb = require('../models/user')

describe('Users Controller', () => {
    it('should return all users', async () => {
        const userDbMock = sinon.mock(userDb)
        userDbMock
            .expects('getUsers')
            .once()
            .resolves([
                {
                    id: 1,
                    username: 'first',
                },
                {
                    id: 2,
                    username: 'second',
                },
            ])

        const response = await supertest(app).get('/api/users').expect(200)
        assert.equal(response.body.length, 2)

        userDbMock.verify()
        userDbMock.restore()
    })

    it('should add a user', async () => {
        const username = 'newguy'
        const password = 'super secret'

        const userDbMock = sinon.mock(userDb)
        userDbMock.expects('addUser').once().withArgs(username).resolves({
            id: 42,
            username,
        })

        const body = {
            username,
            password,
        }

        await supertest(app).post('/api/users').send(body).expect(201)
    })

    it('should require a username', async () => {
        const username = null
        const password = 'super secret'

        const body = {
            username,
            password,
        }

        await supertest(app).post('/api/users').send(body).expect(400)
    })

    it('should require a password', async () => {
        const username = 'newguy'
        const password = null

        const body = {
            username,
            password,
        }

        await supertest(app).post('/api/users').send(body).expect(400)
    })

    it('should require a password > 6 characters', async () => {
        const username = 'newguy'
        const password = '12345'

        const body = {
            username,
            password,
        }

        await supertest(app).post('/api/users').send(body).expect(400)
    })
})
