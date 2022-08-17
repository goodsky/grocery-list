import axios from 'axios'
const baseUrl = '/api/users'

const login = async (username, password) => {
    const response = await axios.post(`${baseUrl}/login`, { username, password })
    return response.data
}

const usersService = { login }
export default usersService
