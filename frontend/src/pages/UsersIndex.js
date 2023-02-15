import { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SecurityIcon from '@mui/icons-material/Security'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'

import ConfirmDialog from '../components/ConfirmDialog'
import usersService from '../services/users'

const UsersIndex = () => {
    const [users, setUsers] = useState([])
    const [toggleAdminUser, setToggleAdminUser] = useState(null)
    const [deleteAccountUser, setDeleteAccountUser] = useState(null)

    useEffect(() => {
        const loadUsers = async () => {
            const response = await usersService.getUsers()
            if (response.success) {
                console.log(`Loaded users`, response.users)

                setUsers(response.users)
            } else {
                console.error('Failed to load users')
            }
        }
        loadUsers()
    }, [])

    const toggleIsAdmin = async (user) => {
        if (user.username === 'admin') {
            console.warn('Cannot toggle admin user')
            return
        }

        const newIsAdmin = !user.isAdmin
        await usersService.updateUser({ id: user.id, isAdmin: newIsAdmin })
        setUsers(users.map((x) => (x.id === user.id ? { ...user, isAdmin: newIsAdmin } : x)))
    }

    const deleteAccount = (user) => {}

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'username', headerName: 'Username', minWidth: 200, flex: 1 },
        { field: 'joinedDate', headerName: 'Joined Date', minWidth: 120, flex: 1 },
        {
            field: 'isAdmin',
            headerName: 'Is Admin',
            type: 'boolean',
            minWidth: 90,
        },
        {
            field: 'actions',
            type: 'actions',
            minWidth: 90,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<SecurityIcon />}
                    label="Toggle Admin"
                    onClick={() => setToggleAdminUser(params.row)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete Account"
                    onClick={() => setDeleteAccountUser(params.row)}
                    showInMenu
                />,
            ],
        },
    ]

    return (
        <>
            <Typography variant="h1">Store Catalog</Typography>
            <Box sx={{ height: 400 }}>
                <DataGrid
                    loading={users.length === 0}
                    columns={columns}
                    rows={users}
                    pageSize={25}
                    rowsPerPageOptions={[25]}
                    hideFooterSelectedRowCount
                    initialState={{
                        sorting: {
                            sortModel: [
                                {
                                    field: 'id',
                                    sort: 'asc',
                                },
                            ],
                        },
                    }}
                />
            </Box>
            <ConfirmDialog
                title={toggleAdminUser?.isAdmin ? 'Revoking Admin' : 'Promoting Admin'}
                prompt={`Are you sure you want to modify the admin status of account "${toggleAdminUser?.username}"?`}
                isOpen={!!toggleAdminUser}
                close={() => setToggleAdminUser(null)}
                onConfirm={() => toggleIsAdmin(toggleAdminUser)}
            />
            <ConfirmDialog
                title={'Confirm Delete'}
                prompt={`Are you sure you want to delete account "${deleteAccountUser?.username}"?`}
                isOpen={!!deleteAccountUser}
                close={() => setDeleteAccountUser(null)}
                onConfirm={() => deleteAccount(deleteAccountUser)}
            />
        </>
    )
}

export default UsersIndex
