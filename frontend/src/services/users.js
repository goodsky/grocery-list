import axios from 'axios'
import tokenService from './token'
const baseUrl = '/api/users'

const getUsers = async () => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(baseUrl, { headers: { Authorization: `Bearer ${token}` } })
        return {
            success: true,
            users: response.data,
        }
    } catch (error) {
        console.log('Get users failed', error)
        return {
            success: false,
        }
    }
}

const login = async (username, password) => {
    try {
        const response = await axios.post(`${baseUrl}/login`, { username, password })
        return {
            loggedIn: true,
            jwt: response.data,
        }
    } catch (error) {
        console.log('Log in failed', error.response)
        return {
            loggedIn: false,
        }
    }
}

const register = async (username, password) => {
    try {
        await axios.post(baseUrl, { username, password })

        // todo: adding a new user could return the jwt automatically?
        const response = await login(username, password)
        if (response.loggedIn) {
            return {
                registered: true,
                jwt: response.jwt,
            }
        }

        throw Error('Log in failed')
    } catch (error) {
        console.log('Register failed', error.response)
        return {
            registered: false,
            userConflict: error.response.status === 409,
        }
    }
}

const updateUser = async ({ id, isAdmin }) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.put(
            `${baseUrl}/${id}`,
            { id, isAdmin },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return {
            success: true,
            grocery: response.data,
        }
    } catch (error) {
        console.log('Update user failed', error)
        return {
            success: false,
        }
    }
}

const usersService = { getUsers, login, register, updateUser }
export default usersService
