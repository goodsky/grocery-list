import { forwardRef, useImperativeHandle, useState } from 'react'
import { Alert } from '@mui/material'

const PopUp = forwardRef((props, ref) => {
    const [notification, setNotification] = useState('')
    const [severity, setSeverity] = useState('info')
    const [timerId, setTimerId] = useState()

    const notify = (message, level = 'info', timeoutMs = 3000) => {
        setNotification(message)
        setSeverity(level)

        if (timerId) {
            clearTimeout(timerId)
        }

        const newTimerId = setTimeout(() => {
            setNotification('')
            setTimerId(null)
        }, timeoutMs)

        setTimerId(newTimerId)
    }

    // Everything I have read said this is an anti-pattern.
    // So clearly I'm doing something wrong, but I'll leave it until I understand.
    useImperativeHandle(ref, () => ({
        notify,
    }))

    if (!notification) {
        return null
    }

    return <Alert severity={severity}>{notification}</Alert>
})

export default PopUp
