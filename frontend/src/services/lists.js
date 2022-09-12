import axios from 'axios'
import tokenService from './token'
const baseUrl = '/api/lists'

const addList = async ({ name, shoppingDate }) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.post(
            baseUrl,
            { name, shoppingDate },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return {
            success: true,
            list: response.data,
        }
    } catch (error) {
        console.log('Add list failed', error)
        return { success: false }
    }
}

const deleteList = async (id) => {
    try {
        const token = tokenService.getToken()
        await axios.delete(`${baseUrl}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        return {
            success: true,
        }
    } catch (error) {
        console.log('Delete list failed', error)
        return { success: false }
    }
}

const getLists = async (all = false) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(`${baseUrl}${all ? '?all=true' : ''}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return {
            success: true,
            lists: response.data,
        }
    } catch (error) {
        console.log('Get lists failed', error)
        return { success: false }
    }
}

const getListById = async (id) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(`${baseUrl}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        return {
            success: true,
            list: response.data,
        }
    } catch (error) {
        console.log('Get list by id failed', error)
        return { success: false }
    }
}

const updateList = async ({ id, name, shoppingDate }) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.put(
            `${baseUrl}/${id}`,
            { name, shoppingDate },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return {
            success: true,
            list: response.data,
        }
    } catch (error) {
        console.log('Update list failed', error)
        return { success: false }
    }
}

const listService = {
    addList,
    deleteList,
    getLists,
    getListById,
    updateList,
}

export default listService
