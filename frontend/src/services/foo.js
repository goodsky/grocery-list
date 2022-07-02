import axios from 'axios'
const baseUrl = '/api/foo'

const getFoo = async () => {
  const response = await axios.get(baseUrl)
  const body = response.data
  return body.message
}

const fooService = { getFoo }
export default fooService
