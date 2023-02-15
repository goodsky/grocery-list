import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Box, Button, Menu, MenuItem, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

const navButtons = [
    { label: 'lists', url: '/' },
    { label: 'groceries', url: '/groceries' },
    { label: 'stores', url: '/stores' },
    { label: 'users', url: '/users' },
]

const NavBar = ({ userToken, logOut }) => {
    const [menuAnchor, setMenuAnchor] = useState(null)

    const handleOpenMenu = (event) => {
        setMenuAnchor(event.currentTarget)
    }

    const handleCloseMenu = () => {
        setMenuAnchor(null)
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexGrow: 1 }}>
                    <IconButton size="large" color="inherit" onClick={handleOpenMenu} aria-label="menu">
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchor}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        keepMounted
                        onClose={handleCloseMenu}
                        open={!!menuAnchor}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    >
                        {navButtons.map((button) => (
                            <MenuItem key={button.label} onClick={handleCloseMenu} component={Link} to={button.url}>
                                {button.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexGrow: 1 }}>
                    {navButtons.map((button) => (
                        <Button key={button.label} color="inherit" component={Link} to={button.url}>
                            {button.label}
                        </Button>
                    ))}
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
