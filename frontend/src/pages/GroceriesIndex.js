import { useEffect, useState } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import { DataGrid } from '@mui/x-data-grid'
import groceryService from '../services/groceries'

import GroceryDialog from '../components/GroceryDialog'

const GroceriesIndex = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [groceries, setGroceries] = useState([])
    const [selectedId, setSelectedId] = useState('')

    const [isDialogOpen, setDialogOpen] = useState('')

    useEffect(() => {
        const initializeGroceries = async () => {
            const result = await groceryService.getGroceries()
            if (result.success) {
                setGroceries(result.groceries)
            }

            setIsLoading(false)
        }

        if (!isDialogOpen) {
            initializeGroceries()
        }
    }, [isDialogOpen])

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
                        onClick={() => setDialogOpen('add')}
                    >
                        Add
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ width: 100 }}
                        endIcon={<EditIcon />}
                        disabled={!selectedId}
                        onClick={() => setDialogOpen('edit')}
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
            <GroceryDialog
                isEdit={isDialogOpen === 'edit'}
                groceryId={selectedId}
                isOpen={!!isDialogOpen}
                close={() => {
                    // NB: This refreshes the grocery list effect
                    setDialogOpen('')
                }}
            />
        </>
    )
}

export default GroceriesIndex
