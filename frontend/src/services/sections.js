import axios from 'axios'
import tokenService from './token'
const baseUrl = '/api/sections'

const getAllSections = async () => {
    const allSections = [getGrocerySections(), getStoreSections()]
    const [groceryResponse, storeResponse] = await Promise.all(allSections)

    if (groceryResponse.success && storeResponse.success) {
        const sectionSet = new Set()
        groceryResponse.sections.forEach((section) => sectionSet.add(section))
        storeResponse.sections.forEach((section) => sectionSet.add(section))

        return {
            success: true,
            sections: Array.from(sectionSet),
        }
    }

    if (groceryResponse.success) {
        return groceryResponse
    }

    if (storeResponse.success) {
        return storeResponse
    }

    console.error('Get all sections failed')
    return { success: false }
}

const getGrocerySections = async () => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(`${baseUrl}/groceries`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return {
            success: true,
            sections: response.data,
        }
    } catch (error) {
        console.log('Get sections from groceries failed', error)
        return {
            success: false,
        }
    }
}

const getStoreSections = async () => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(baseUrl, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return {
            success: true,
            sections: response.data,
        }
    } catch (error) {
        console.log('Get sections from stores failed', error)
        return {
            success: false,
        }
    }
}

const getSectionsByStoreId = async (storeId) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(`/api/stores/${storeId}/sections`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return {
            success: true,
            sections: response.data,
        }
    } catch (error) {
        console.log('Get sections from store failed', error)
        return {
            success: false,
        }
    }
}

const sectionsService = { getAllSections, getGrocerySections, getSectionsByStoreId, getStoreSections }
export default sectionsService
