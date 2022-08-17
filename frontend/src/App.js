import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Button, Typography } from '@mui/material'
import Home from './pages/Home'
import Login from './pages/Login'
import ManageLists from './pages/ManageLists'
import Register from './pages/Register'

const jwtKey = 'userJwt'

const getUserToken = () => {
    const jwtJson = window.localStorage.getItem(jwtKey)
    if (jwtJson) {
        const jwt = JSON.parse(jwtJson)
        console.log('Found cached user', jwt.username)
        return jwt
    }

    return null
}

function App() {
    const [token, setToken] = useState(getUserToken())

    const logIn = (token) => {
        window.localStorage.setItem(jwtKey, JSON.stringify(token))
        setToken(token)
    }

    const logOut = () => {
        window.localStorage.removeItem(jwtKey)
        setToken(null)
    }

    if (!token) {
        return <Login setToken={logIn} />
    }

    return (
        <div>
            <Typography variant="h1">Super List</Typography>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/lists" element={<ManageLists />} />
                <Route path="/register" element={<Register />} />
            </Routes>
            <Button variant="outlined" onClick={logOut}>
                Log Out
            </Button>
        </div>
    )
}

export default App
