import axios from 'axios'
const baseUrl = '/api/users'

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
        return {
            registered: true,
            jwt: response.data,
        }
    } catch (error) {
        console.log('Register failed', error.response)
        return {
            registered: false,
        }
    }
}

const usersService = { login, register }
export default usersService
