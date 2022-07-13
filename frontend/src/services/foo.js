import axios from 'axios'
const baseUrl = '/api/foo'

const getFoo = async () => {
  const response = await axios.get(baseUrl)
  const body = response.data
  console.log('Foo', body.foo)
  return body.message
}

const fooService = { getFoo }
export default fooService
