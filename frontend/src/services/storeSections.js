import axios from 'axios'
import tokenService from './token'
const baseUrl = '/api/stores'

const addSection = async (storeId, aisleId, name) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.post(
            `baseUrl/${storeId}/aisles/${aisleId}/sections`,
            { name },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return {
            success: true,
            section: response.data,
        }
    } catch (error) {
        console.log('Add section failed', error)
        return {
            success: false,
        }
    }
}

const deleteSection = async (storeId, aisleId, name) => {
    try {
        const token = tokenService.getToken()
        await axios.delete(`${baseUrl}/${storeId}/aisles/${aisleId}/sections/${name}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return {
            success: true,
        }
    } catch (error) {
        console.log('Delete section failed', error)
        return {
            success: false,
        }
    }
}

const getSections = async (storeId, aisleId) => {
    try {
        const token = tokenService.getToken()
        const response = await axios.get(`baseUrl/${storeId}/aisles/${aisleId}/sections`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return {
            success: true,
            sections: response.data,
        }
    } catch (error) {
        console.log('Get sections failed', error)
        return {
            success: false,
        }
    }
}

const setAllSections = async (storeId, aisleId, sections) => {
    try {
        const token = tokenService.getToken()
        await axios.put(
            `baseUrl/${storeId}/aisles/${aisleId}/sections`,
            { sections },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return {
            success: true,
        }
    } catch (error) {
        console.log('Set all sections failed', error)
        return {
            success: false,
        }
    }
}

const sectionsService = { addSection, deleteSection, getSections, setAllSections }
export default sectionsService
