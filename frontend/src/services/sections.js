import axios from 'axios'
import tokenService from './token'
const baseUrl = '/api/sections'

const getAllSections = async () => {
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
        console.log('Get all sections failed', error)
        return {
            success: false,
        }
    }
}

const sectionsService = { getAllSections }
export default sectionsService
