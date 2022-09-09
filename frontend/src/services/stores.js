import axios from 'axios'
import tokenService from './token'
const baseUrl = '/api/stores'

const addStore = async ({ name, address }) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.post(baseUrl, { name, address }, { headers: { Authorization: `Bearer ${token}` } })
        return {
            success: true,
            store: response.data,
        }
    } catch (error) {
        console.log('Add store failed', error)
        return {
            success: false,
        }
    }
}

const deleteStore = async (id) => {
    try {
        const token = tokenService.getToken()
        await axios.delete(`${baseUrl}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        return {
            success: true,
        }
    } catch (error) {
        console.log('Delete store failed', error)
        return {
            success: false,
        }
    }
}

const getStores = async () => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(baseUrl, { headers: { Authorization: `Bearer ${token}` } })
        return {
            success: true,
            stores: response.data,
        }
    } catch (error) {
        console.log('Get stores failed', error)
        return {
            success: false,
        }
    }
}

const getStoreById = async (id, all = false) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(`${baseUrl}/${id}?all=${all}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return {
            success: true,
            store: response.data,
        }
    } catch (error) {
        console.log('Get store failed', error)
        return {
            success: false,
        }
    }
}

const updateStore = async ({ id, name, address }) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.put(
            `${baseUrl}/${id}`,
            { id, name, address },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return {
            success: true,
            store: response.data,
        }
    } catch (error) {
        console.log('Update store failed', error)
        return {
            success: false,
        }
    }
}

const storesService = { addStore, deleteStore, getStores, getStoreById, updateStore }
export default storesService
