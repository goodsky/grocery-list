import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, Stack, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'

import storeService from '../services/stores'

const StoresIndex = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [stores, setStores] = useState([])
    const [selectedId, setSelectedId] = useState('')

    useEffect(() => {
        const initializeGroceries = async () => {
            const result = await storeService.getStores()
            if (result.success) {
                setStores(result.stores)
            }

            setIsLoading(false)
        }

        initializeGroceries()
    }, [])

    const handleSelectionUpdate = (ids) => {
        if (ids.length > 0) {
            setSelectedId(ids[0])
        } else {
            setSelectedId('')
        }
    }

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: 'Name', minWidth: 200, flex: 1 },
        { field: 'address', headerName: 'Address', minWidth: 200, flex: 1 },
    ]

    return (
        <>
            <Typography variant="h1">Store Catalog</Typography>
            <Box sx={{ height: 400 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Button
                        variant="contained"
                        sx={{ width: 100 }}
                        endIcon={<AddIcon />}
                        component={Link}
                        to="/stores/add"
                    >
                        Add
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ width: 100 }}
                        endIcon={<EditIcon />}
                        component={Link}
                        to={`/stores/edit/${selectedId}`}
                        disabled={!selectedId}
                    >
                        Edit
                    </Button>
                </Stack>
                <DataGrid
                    loading={isLoading}
                    columns={columns}
                    rows={stores}
                    pageSize={25}
                    rowsPerPageOptions={[25]}
                    hideFooterSelectedRowCount
                    onSelectionModelChange={handleSelectionUpdate}
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
        </>
    )
}

export default StoresIndex
