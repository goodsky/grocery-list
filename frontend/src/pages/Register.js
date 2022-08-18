import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Stack, TextField, Typography } from '@mui/material'
import usersService from '../services/users'

const Register = ({ setToken }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const navigate = useNavigate()

    const handleRegister = async (event) => {
        event.preventDefault()
        try {
            const jwt = await usersService.register(username, password)
            setToken(jwt)
            setUsername('')
            setPassword('')
            setConfirmPassword('')
            navigate('/')
        } catch (error) {
            console.error('Failed to register', error.message, error.response.data)
            setPassword('')
            setConfirmPassword('')
        }
    }

    // todo: field validation
    return (
        <>
            <Typography variant="h2">Register</Typography>
            <Stack component="form" spacing={2} onSubmit={handleRegister}>
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
                <TextField
                    required
                    type="password"
                    label="Confirm Password"
                    value={confirmPassword}
                    variant="standard"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <Button type="submit" color="primary" variant="contained">
                    Register
                </Button>
                <Button component={Link} to="/" color="secondary" variant="contained">
                    Cancel
                </Button>
            </Stack>
        </>
    )
}

export default Register
