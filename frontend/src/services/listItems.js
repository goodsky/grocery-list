import axios from 'axios'
import tokenService from './token'
const baseUrl = '/api/lists'

const addItem = async (listId, { groceryId, storeId, amount, unit, note }) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.post(
            `${baseUrl}/${listId}/items`,
            { groceryId, storeId, amount, unit, note },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return {
            success: true,
            item: response.data,
        }
    } catch (error) {
        console.log('Add items failed', error)
        return { success: false }
    }
}

const deleteItem = async (listId, id) => {
    try {
        const token = tokenService.getToken()
        await axios.delete(`${baseUrl}/${listId}/items/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        return { success: true }
    } catch (error) {
        console.log('Delete item failed', error)
        return { success: false }
    }
}

const getItemsByListId = async (listId) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(`${baseUrl}/${listId}/items`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return {
            success: true,
            items: response.data,
        }
    } catch (error) {
        console.log('Get items failed', error)
        return { success: false }
    }
}

const getItem = async (listId, id) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(`${baseUrl}/${listId}/items/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return {
            success: true,
            item: response.data,
        }
    } catch (error) {
        console.log('Get item failed', error)
        return { success: false }
    }
}

const updateItem = async (listId, { id, groceryId, storeId, amount, unit, note, pickedUp }) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.put(
            `${baseUrl}/${listId}/items/${id}`,
            { id, groceryId, storeId, amount, unit, note, pickedUp },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return {
            success: true,
            item: response.data,
        }
    } catch (error) {
        console.log('Update item failed', error)
        return { success: false }
    }
}

const listService = {
    addItem,
    deleteItem,
    getItemsByListId,
    getItem,
    updateItem,
}

export default listService
