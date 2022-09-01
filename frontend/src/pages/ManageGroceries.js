import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import { DataGrid } from '@mui/x-data-grid'
import groceryService from '../services/groceries'

const ManageGroceries = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [groceries, setGroceries] = useState([])
    const [selectedId, setSelectedId] = useState('')

    useEffect(() => {
        const initializeGroceries = async () => {
            const result = await groceryService.getGroceries()
            if (result.success) {
                setGroceries(result.groceries)
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
        { field: 'section', headerName: 'Section', minWidth: 200, flex: 1 },
        { field: 'units', headerName: 'Units', width: 100 },
    ]

    // https://mui.com/x/react-data-grid/
    return (
        <>
            <Typography variant="h1">Grocery Catalog</Typography>
            <Box sx={{ height: 400 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Button
                        variant="contained"
                        sx={{ width: 100 }}
                        endIcon={<AddIcon />}
                        component={Link}
                        to="/groceries/add"
                    >
                        Add
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ width: 100 }}
                        endIcon={<EditIcon />}
                        component={Link}
                        to={`/groceries/edit/${selectedId}`}
                        disabled={!selectedId}
                    >
                        Edit
                    </Button>
                </Stack>
                <DataGrid
                    loading={isLoading}
                    columns={columns}
                    rows={groceries}
                    pageSize={25}
                    rowsPerPageOptions={[25]}
                    hideFooterSelectedRowCount
                    onSelectionModelChange={handleSelectionUpdate}
                />
            </Box>
        </>
    )
}

export default ManageGroceries
