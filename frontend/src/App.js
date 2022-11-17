import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Container, Paper, Typography } from '@mui/material'
import Login from './pages/Login'
import ManageGroceries from './pages/ManageGroceries'
import ManageLists from './pages/ManageLists'
import ManageStores from './pages/ManageStores'
import ModifyListIndex from './pages/ModifyListIndex'
import ModifyStore from './pages/ModifyStore'
import Shopping from './pages/Shopping'
import NavBar from './components/NavBar'
import NotFound from './pages/NotFound'
import Register from './pages/Register'
import tokenService from './services/token'

const jwtKey = 'userJwt'

const getUserToken = () => {
    const jwtJson = window.localStorage.getItem(jwtKey)
    if (jwtJson) {
        const jwt = JSON.parse(jwtJson)
        tokenService.setToken(jwt.token)
        return jwt
    }

    return null
}

function App() {
    const [token, setToken] = useState(getUserToken())

    const navigate = useNavigate()

    const logIn = (token) => {
        window.localStorage.setItem(jwtKey, JSON.stringify(token))
        tokenService.setToken(token.token)
        setToken(token)
    }

    const logOut = () => {
        window.localStorage.removeItem(jwtKey)
        tokenService.setToken(null)
        setToken(null)
        navigate('/')
    }

    useEffect(() => {
        if (token && (token.expiresDate === undefined || token.expiresDate < new Date())) {
            console.warn('User token expired! Logging out.')
            logOut()
        }
    })

    if (!token) {
        return (
            <Container maxWidth="sm">
                <Typography variant="h1">Grocery List</Typography>
                <Paper sx={{ padding: 2, margin: 1 }}>
                    <Routes>
                        <Route path="*" element={<NotFound />} />
                        <Route path="/" element={<Login setToken={logIn} />} />
                        <Route path="/register" element={<Register setToken={logIn} />} />
                    </Routes>
                </Paper>
            </Container>
        )
    }

    return (
        <Container>
            <NavBar userToken={token} logOut={logOut} />
            <Routes>
                <Route path="*" element={<NotFound />} />
                <Route path="/" element={<ManageLists />} />
                <Route path="/groceries" element={<ManageGroceries />} />
                <Route path="/lists" element={<ManageLists />} />
                <Route path="/lists/add" element={<ModifyListIndex isEdit={false} />} />
                <Route path="/lists/edit/:id" element={<ModifyListIndex isEdit={true} />} />
                <Route path="/lists/shop/:id" element={<Shopping isEdit={true} />} />
                <Route path="/stores" element={<ManageStores />} />
                <Route path="/stores/add" element={<ModifyStore isEdit={false} />} />
                <Route path="/stores/edit/:id" element={<ModifyStore isEdit={true} />} />
            </Routes>
        </Container>
    )
}

export default App
