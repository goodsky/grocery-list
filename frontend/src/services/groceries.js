import axios from 'axios'
import tokenService from './token'
const baseUrl = '/api/groceries'

const addGrocery = async ({ name, section, units }) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.post(
            baseUrl,
            { name, section, units },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return {
            success: true,
            grocery: response.data,
        }
    } catch (error) {
        console.log('Add grocery failed', error)
        return {
            success: false,
        }
    }
}

const deleteGrocery = async (id) => {
    try {
        const token = tokenService.getToken()
        await axios.delete(`${baseUrl}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        return {
            success: true,
        }
    } catch (error) {
        console.log('Delete grocery failed', error)
        return {
            success: false,
        }
    }
}

const getGroceries = async () => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(baseUrl, { headers: { Authorization: `Bearer ${token}` } })
        return {
            success: true,
            groceries: response.data,
        }
    } catch (error) {
        console.log('Get groceries failed', error)
        return {
            success: false,
        }
    }
}

const getGroceryById = async (id) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(`${baseUrl}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        return {
            success: true,
            grocery: response.data,
        }
    } catch (error) {
        console.log('Get grocery failed', error)
        return {
            success: false,
        }
    }
}

const updateGrocery = async ({ id, name, section, units }) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.put(
            `${baseUrl}/${id}`,
            { id, name, section, units },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return {
            success: true,
            grocery: response.data,
        }
    } catch (error) {
        console.log('Update grocery failed', error)
        return {
            success: false,
        }
    }
}

const groceriesService = { addGrocery, deleteGrocery, getGroceries, getGroceryById, updateGrocery }
export default groceriesService
