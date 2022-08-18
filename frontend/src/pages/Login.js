import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Stack, TextField, Typography } from '@mui/material'
import usersService from '../services/users'

const LogIn = ({ setToken }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async (event) => {
        event.preventDefault()
        try {
            const jwt = await usersService.login(username, password)
            setToken(jwt)
            setUsername('')
            setPassword('')
        } catch (error) {
            console.error('Failed to log in', error.message, error.response.data)
            setPassword('')
        }
    }

    return (
        <>
            <Typography variant="h2">Log In</Typography>
            <Stack component="form" spacing={2} onSubmit={handleLogin}>
                <TextField
                    required
                    label="Username"
                    value={username}
                    variant="standard"
                    onChange={(event) => setUsername(event.target.value)}
                />
                <TextField
                    required
                    type="password"
                    label="Password"
                    value={password}
                    variant="standard"
                    onChange={(event) => setPassword(event.target.value)}
                />
                <Button type="submit" color="primary" variant="contained">
                    Login
                </Button>
                <Button component={Link} to="/register" color="secondary" variant="contained">
                    Register
                </Button>
            </Stack>
        </>
    )
}

export default LogIn
