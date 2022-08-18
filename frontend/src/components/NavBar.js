import { Link } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Box, Button, Typography } from '@mui/material'

const NavBar = ({ userToken, logOut }) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu"></IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Button color="inherit" component={Link} to="/">
                        blogs
                    </Button>
                    <Button color="inherit" component={Link} to="/users">
                        users
                    </Button>
                </Box>
                <Typography color="inherit">Hello {userToken.username}!</Typography>
                <Button color="inherit" onClick={logOut}>
                    log out
                </Button>
            </Toolbar>
        </AppBar>
    )
}

export default NavBar
