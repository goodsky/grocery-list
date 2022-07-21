const assert = require('assert')
const jwt = require('jsonwebtoken')
const sinon = require('sinon')
const supertest = require('supertest')

const app = require('../app')
const config = require('../utils/config')
const userDb = require('../models/user')

describe('Users Controller', () => {
    afterEach(() => {
        sinon.restore()
    })

    it('should return all users', async () => {
        const getUsersStub = sinon.stub(userDb, 'getUsers')
        getUsersStub.resolves([
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
        assert(getUsersStub.calledOnce)
        assert.equal(response.body.length, 2)
    })

    it('should add a user', async () => {
        const body = {
            username: 'newguy',
            password: 'super secret',
        }

        const addUserStub = sinon.stub(userDb, 'addUser')
        addUserStub.resolves({
            id: 42,
            username: body.username,
        })

        await supertest(app).post('/api/users').send(body).expect(201)
        assert(addUserStub.calledOnce)
        assert.equal(addUserStub.getCall(0).args[0], body.username)
        assert.notEqual(addUserStub.getCall(0).args[0], body.password)
    })

    it('should require a username', async () => {
        const body = {
            username: null,
            password: 'super secret',
        }

        await supertest(app).post('/api/users').send(body).expect(400)
    })

    it('should require a password', async () => {
        const body = {
            username: 'no password guy',
            password: null,
        }

        await supertest(app).post('/api/users').send(body).expect(400)
    })

    it('should require a password > 6 characters', async () => {
        const body = {
            username: 'short password guy',
            password: '12345',
        }

        await supertest(app).post('/api/users').send(body).expect(400)
    })

    it('should allow a created user to login', async () => {
        const joinedDate = new Date()
        const isAdmin = false
        const body = {
            username: 'logmein',
            password: 'super secret',
        }

        const addUserStub = sinon.stub(userDb, 'addUser')
        addUserStub.resolves({
            id: 42,
            username: body.username,
        })

        await supertest(app).post('/api/users').send(body).expect(201)
        assert(addUserStub.calledOnce)

        const getUserByUsernameStub = sinon.stub(userDb, 'getUserByUsername')
        getUserByUsernameStub.resolves({
            id: 42,
            username: body.username,
            passwordHash: addUserStub.getCall(0).args[1],
            joinedDate,
            isAdmin,
        })

        const response = await supertest(app).post('/api/users/login').send(body).expect(200)
        assert(getUserByUsernameStub.calledOnce)

        const verifiedToken = jwt.verify(response.body.token, config.JWT_SECRET)
        assert.equal(response.body.username, body.username)
        assert.equal(verifiedToken.username, body.username)
        assert.equal(new Date(response.body.joinedDate).getDate(), joinedDate.getDate()) // response returns string - joinedDate is Date
        assert.equal(new Date(verifiedToken.joinedDate).getDate(), joinedDate.getDate())
        assert.equal(response.body.isAdmin, isAdmin)
        assert.equal(verifiedToken.isAdmin, isAdmin)
    })

    it('should not allow a nonregistered user to login', async () => {
        const body = {
            username: 'logmein',
            password: 'super secret',
        }

        const getUserByUsernameStub = sinon.stub(userDb, 'getUserByUsername')
        getUserByUsernameStub.resolves(null)

        await supertest(app).post('/api/users/login').send(body).expect(401)
    })

    it('should not allow a created user to login with wrong password', async () => {
        const correctBody = {
            username: 'logmein',
            password: 'super secret',
        }

        const incorrectBody = {
            username: 'logmein',
            password: 'this is wrong!',
        }

        const addUserStub = sinon.stub(userDb, 'addUser')
        addUserStub.resolves({
            id: 42,
            username: correctBody.username,
        })

        await supertest(app).post('/api/users').send(correctBody).expect(201)
        assert(addUserStub.calledOnce)

        const getUserByUsernameStub = sinon.stub(userDb, 'getUserByUsername')
        getUserByUsernameStub.resolves({
            id: 42,
            username: correctBody.username,
            passwordHash: addUserStub.getCall(0).args[1],
            joinedDate: new Date(),
            isAdmin: false,
        })

        await supertest(app).post('/api/users/login').send(incorrectBody).expect(401)
    })
})
