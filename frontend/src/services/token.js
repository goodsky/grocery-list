let myToken = ''

const getToken = () => {
    if (!myToken) {
        throw Error('Token not set')
    }

    return myToken
}

const setToken = (token) => {
    myToken = token
}

const tokenService = { getToken, setToken }
export default tokenService
