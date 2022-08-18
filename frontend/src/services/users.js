import axios from 'axios'
const baseUrl = '/api/users'

const login = async (username, password) => {
    const response = await axios.post(`${baseUrl}/login`, { username, password })
    return response.data
}

const register = async (username, password) => {
    await axios.post(baseUrl, { username, password })
    // todo: adding a new user could return the jwt automatically?
    return await login(username, password)
}

const usersService = { login, register }
export default usersService
