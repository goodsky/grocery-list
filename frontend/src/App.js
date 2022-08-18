import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Grid, Paper, Typography } from '@mui/material'
import Home from './pages/Home'
import Login from './pages/Login'
import ManageLists from './pages/ManageLists'
import NavBar from './components/NavBar'
import NotFound from './pages/NotFound'
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

    const navigate = useNavigate()

    const logIn = (token) => {
        window.localStorage.setItem(jwtKey, JSON.stringify(token))
        setToken(token)
    }

    const logOut = () => {
        window.localStorage.removeItem(jwtKey)
        setToken(null)
        navigate('/')
    }

    if (!token) {
        return (
            <>
                <Grid container direction="column" alignItems="center">
                    <Typography variant="h1">Grocery List</Typography>
                    <Paper style={{ width: '100%', maxWidth: 500, padding: 20 }}>
                        <Routes>
                            <Route path="*" element={<NotFound />} />
                            <Route path="/" element={<Login setToken={logIn} />} />
                            <Route path="/register" element={<Register setToken={logIn} />} />
                        </Routes>
                    </Paper>
                </Grid>
            </>
        )
    }

    return (
        <>
            <NavBar userToken={token} logOut={logOut} />
            <Typography variant="h1">Grocery List</Typography>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/lists" element={<ManageLists />} />
            </Routes>
        </>
    )
}

export default App
