import { Link } from 'react-router-dom'
import { Button, Stack, Typography } from '@mui/material'

const NotFound = () => {
    return (
        <Stack direction="column" alignItems="center" spacing={2}>
            <Typography variant="h2">Ooop!</Typography>
            <Typography variant="body1">This page does not exist.</Typography>
            <Button variant="contained" component={Link} to="/">
                Back to Home
            </Button>
        </Stack>
    )
}

export default NotFound
