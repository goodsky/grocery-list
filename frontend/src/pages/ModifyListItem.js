import { useEffect, useState } from 'react'
import { Autocomplete, Button, Stack, TextField, Typography } from '@mui/material'

const ModifyListItem = ({ dispatch, isEdit, item, groceries, stores }) => {
    const [groceryName, setGroceryName] = useState('')
    const [selectedGrocery, setSelectedGrocery] = useState(null)

    const [selectedStore, setSelectedStore] = useState(null)

    const [amount, setAmount] = useState('')
    const [units, setUnits] = useState('')
    const [note, setNote] = useState('')

    const title = isEdit ? 'Modify List Item' : 'Add an Item'
    const buttonVerb = isEdit ? 'Edit' : 'Add'

    useEffect(() => {
        // TODO: set selected grocery/store/etc based off of a passed in item if we are editing
    }, [])

    const handleSubmit = (event) => {
        event.preventDefault()

        // TODO: Add the item to the list
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
        setUnits(newValue.units)
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
        /* nop */
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
                onChange={handleStoreChange}
                onInputChange={handleStoreInputChange}
                isOptionEqualToValue={(option, value) => option.name === value.name}
                onKeyPress={preventSubmit}
                renderOption={(props, option) => (
                    <Stack component="li" {...props} sx={{ display: 'flex' }}>
                        <Typography variant="body2" sx={{ alignSelf: 'start' }}>
                            {option.name}
                        </Typography>
                        <Typography variant="caption" sx={{ alignSelf: 'start' }}>
                            {option.address}
                        </Typography>
                    </Stack>
                )}
                renderInput={(params) => <TextField {...params} required label="Store" variant="standard" />}
            />
            <Stack direction="row">
                <TextField
                    required
                    label="Amount"
                    type="number"
                    value={amount}
                    variant="standard"
                    onChange={(event) => setAmount(event.target.value)}
                    sx={{ flexGrow: 1 }}
                />
                <TextField
                    required
                    label="Units"
                    value={units}
                    variant="standard"
                    onChange={(event) => setUnits(event.target.value)}
                />
            </Stack>
            <TextField
                label="Note"
                multiline
                rows={3}
                value={note}
                variant="standard"
                onChange={(event) => setNote(event.target.value)}
            />
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
