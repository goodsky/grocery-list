import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Stack, TextField, Typography } from '@mui/material'
import usersService from '../services/users'
import PopUp from '../components/PopUp'

const LogIn = ({ setToken }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const popup = useRef()

    const handleLogin = async (event) => {
        event.preventDefault()

        const result = await usersService.login(username, password)
        if (result.loggedIn) {
            setToken(result.jwt)
            setUsername('')
            setPassword('')
        } else {
            popup.current.notify('Log in failed. Double check your username or password', 'error', 10000)
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
                <PopUp ref={popup} />
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
