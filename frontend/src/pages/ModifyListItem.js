import { useEffect, useState } from 'react'
import { Autocomplete, Button, Stack, TextField, Typography } from '@mui/material'

import groceryService from '../services/groceries'
import storeService from '../services/stores'

const ModifyListItem = ({ dispatch, isEdit, item }) => {
    const [groceryName, setGroceryName] = useState('')
    const [groceries, setGroceries] = useState([])
    const [selectedGrocery, setSelectedGrocery] = useState(null)

    const [storeName, setStoreName] = useState('')
    const [stores, setStores] = useState([])
    const [selectedStore, setSelectedStore] = useState(null)

    const [amount, setAmount] = useState('')

    const title = isEdit ? 'Modify List Item' : 'Add an Item'
    const buttonVerb = isEdit ? 'Edit' : 'Add'

    useEffect(() => {
        const fetchGroceries = async () => {
            const result = await groceryService.getGroceries()
            if (result.success) {
                const sortedGroceries = result.groceries
                    .map((grocery) => (grocery.section ? grocery : { ...grocery, section: 'Unknown' }))
                    .sort((a, b) => ('' + a.section).localeCompare(b.section))

                console.log('loaded groceries', sortedGroceries)
                setGroceries(sortedGroceries)
            } else {
                console.error('Failed to load groceries')
            }
        }

        const fetchStores = async () => {
            const result = await storeService.getStores()
            if (result.success) {
                const sortedStores = result.stores.sort((a, b) => ('' + a.name).localeCompare(b.name))

                console.log('loaded stores', sortedStores)
                setStores(sortedStores)
            } else {
                console.error('Failed to load stores')
            }
        }

        fetchGroceries()
        fetchStores()
    }, [])

    const handleSubmit = (event) => {
        event.preventDefault()
    }

    const preventSubmit = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            event.target.blur()
        }
    }

    const getOptionName = (option) => {
        if (option && option.name) {
            return option.name
        } else {
            return option
        }
    }

    const handleGroceryChange = (event, newValue) => {
        console.log('Selected Grocery', newValue)
        setSelectedGrocery(newValue)
    }

    const handleGroceryInputChange = (event, newValue) => {
        setGroceryName(newValue)
        setSelectedGrocery(null)
    }

    const handleStoreChange = (event, newValue) => {
        console.log('Selected Store', newValue)
        setSelectedStore(newValue)
    }

    const handleStoreInputChange = (event, newValue) => {
        setStoreName(newValue)
        setSelectedStore(null)
    }

    return (
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <Typography variant="h2">{title}</Typography>
            <Autocomplete
                freeSolo
                autoHighlight
                options={groceries}
                groupBy={(option) => option.section}
                getOptionLabel={getOptionName}
                value={groceryName}
                onChange={handleGroceryChange}
                onInputChange={handleGroceryInputChange}
                onKeyPress={preventSubmit}
                renderInput={(params) => <TextField {...params} required label="Grocery" variant="standard" />}
            />
            <Autocomplete
                autoHighlight
                options={stores}
                getOptionLabel={getOptionName}
                value={storeName}
                onChange={handleStoreChange}
                onInputChange={handleStoreInputChange}
                isOptionEqualToValue={(option, value) => option.name === value}
                onKeyPress={preventSubmit}
                renderOption={(props, option) => (
                    <Stack component="li" {...props} sx={{ alignItems: 'start' }}>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption">{option.address}</Typography>
                    </Stack>
                )}
                renderInput={(params) => <TextField {...params} required label="Store" variant="standard" />}
            />
            <Stack>
                <TextField
                    required
                    label="Amount"
                    type="number"
                    value={amount}
                    variant="standard"
                    onChange={(event) => setAmount(event.target.value)}
                />
            </Stack>
            <Button type="submit" color="primary" variant="contained">
                {buttonVerb}
            </Button>
            <Button onClick={() => dispatch({ type: 'clearModifyItem' })} color="secondary" variant="contained">
                Cancel
            </Button>
        </Stack>
    )
}

export default ModifyListItem
