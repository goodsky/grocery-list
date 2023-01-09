import { useEffect, useState } from 'react'
import { Autocomplete, Button, Stack, TextField, Typography } from '@mui/material'

import listItemService from '../services/listItems'

const ModifyListItem = ({ dispatch, isEdit, list, item, groceries, store }) => {
    const [groceryName, setGroceryName] = useState('')
    const [selectedGrocery, setSelectedGrocery] = useState(null)

    const [amount, setAmount] = useState('')
    const [unit, setUnit] = useState('')
    const [note, setNote] = useState('')

    const title = isEdit ? 'Update List Item' : 'Add an Item'
    const buttonVerb = isEdit ? 'Update' : 'Add'

    useEffect(() => {
        const fetchExistingItem = async (listId, itemId) => {
            const result = await listItemService.getItem(listId, itemId)
            if (result.success) {
                const grocery = {
                    id: result.item.groceryid,
                    name: result.item.groceryname,
                    section: result.item.grocerysection,
                }

                setGroceryName(grocery.name)
                setSelectedGrocery(grocery)

                console.log('Fetched list item', grocery)

                setAmount(result.item.amount)
                setUnit(result.item.unit ?? '')
                setNote(result.item.note ?? '')
            } else {
                console.error('Failed to fetch item')
            }
        }
        if (isEdit) {
            fetchExistingItem(list.id, item.id)
        }
    }, [isEdit, list, item])

    const handleSubmit = async (event) => {
        event.preventDefault()
        const currentItem = {
            groceryId: selectedGrocery.id,
            storeId: store.id,
            amount,
            unit,
            note,
        }

        console.log(currentItem)

        if (isEdit) {
            const updatedItem = { ...currentItem, id: item.id }
            // TODO: this should return back the modified item in its populated form
            const result = await listItemService.updateItem(list.id, updatedItem)

            console.log('Updated item', result)
            if (result.success) {
                dispatch({ type: 'updateItem', item: updatedItem })
                return
            }
        } else {
            const result = await listItemService.addItem(list.id, currentItem)

            console.log('Added item', result)
            if (result.success) {
                dispatch({ type: 'addItem', item: result.item })
                return
            }
        }

        dispatch({ type: 'setMode', mode: 'list' })
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
        setSelectedGrocery(newValue)
        setUnit(newValue.units)
    }

    const handleGroceryInputChange = (event, newValue) => {
        setGroceryName(newValue)

        if (selectedGrocery && selectedGrocery.name !== newValue) {
            // clear the selection if we've changed the previous value
            setSelectedGrocery(null)
        }
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
                renderInput={(params) => (
                    <TextField {...params} required autoFocus label="Grocery" variant="standard" />
                )}
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
                    label="Units"
                    value={unit}
                    variant="standard"
                    onChange={(event) => setUnit(event.target.value)}
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
            <Button onClick={() => dispatch({ type: 'setMode', mode: 'list' })} color="secondary" variant="contained">
                Cancel
            </Button>
        </Stack>
    )
}

export default ModifyListItem
