import axios from 'axios'
import tokenService from './token'
const baseUrl = '/api/stores'

const addAisle = async (storeId, { name, position }) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.post(
            `baseUrl/${storeId}/aisles`,
            { name, position },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return {
            success: true,
            aisle: response.data,
        }
    } catch (error) {
        console.log('Add aisle failed', error)
        return {
            success: false,
        }
    }
}

const deleteAisle = async (storeId, id) => {
    try {
        const token = tokenService.getToken()
        await axios.delete(`${baseUrl}/${storeId}/aisles/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        return {
            success: true,
        }
    } catch (error) {
        console.log('Delete aisle failed', error)
        return {
            success: false,
        }
    }
}

const getAisles = async (storeId) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(`baseUrl/${storeId}/aisles`, { headers: { Authorization: `Bearer ${token}` } })
        return {
            success: true,
            aisles: response.data,
        }
    } catch (error) {
        console.log('Get aisles failed', error)
        return {
            success: false,
        }
    }
}

const reorderAisles = async (storeId, order) => {
    try {
        const token = tokenService.getToken()
        await axios.put(`baseUrl/${storeId}/aisles`, { order }, { headers: { Authorization: `Bearer ${token}` } })
        return {
            success: true,
        }
    } catch (error) {
        console.log('Reorder aisles failed', error)
        return {
            success: false,
        }
    }
}

const updateAisle = async (storeId, { id, name, position }) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.put(
            `${baseUrl}/${storeId}/aisles/${id}`,
            { id, name, position },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return {
            success: true,
            aisle: response.data,
        }
    } catch (error) {
        console.log('Update aisle failed', error)
        return {
            success: false,
        }
    }
}

const aislesService = { addAisle, deleteAisle, getAisles, reorderAisles, updateAisle }
export default aislesService
