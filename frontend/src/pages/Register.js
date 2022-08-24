import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Stack, TextField, Typography } from '@mui/material'
import usersService from '../services/users'
import PopUp from '../components/PopUp'

const Register = ({ setToken }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [passwordError, setPasswordError] = useState('')
    const [confirmPasswordError, setConfirmPasswordError] = useState('')

    const navigate = useNavigate()
    const popup = useRef()

    const handlePasswordValidation = (event) => {
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters')
        } else {
            setPasswordError('')
        }
    }

    const handleConfirmPasswordValidation = (event) => {
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords must match')
        } else {
            setConfirmPasswordError('')
        }
    }

    const handleRegister = async (event) => {
        event.preventDefault()

        if (passwordError || confirmPasswordError) {
            popup.current.notify('Please fix the problems before attempting to register', 'warning', 5000)
            return
        }

        const result = await usersService.register(username, password)

        if (result.registered) {
            setToken(result.jwt)
            setUsername('')
            setPassword('')
            setConfirmPassword('')
            navigate('/')
        } else {
            if (result.userConflict) {
                popup.current.notify('Username already exists.', 'error', 10000)
            } else {
                popup.current.notify('Registration failed. Please try again.', 'error', 10000)
            }
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
                    onBlur={handlePasswordValidation}
                    error={!!passwordError}
                    helperText={passwordError}
                />
                <TextField
                    required
                    type="password"
                    label="Confirm Password"
                    value={confirmPassword}
                    variant="standard"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    onBlur={handleConfirmPasswordValidation}
                    error={!!confirmPasswordError}
                    helperText={confirmPasswordError}
                />
                <PopUp ref={popup} />
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
