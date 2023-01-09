import { Autocomplete, Button, Dialog, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import listItemService from '../services/listItems'

const ListItemDialog = ({ dispatch, list, storeTabIndex, groceries, dialogState }) => {
    const isEdit = Number.isInteger(dialogState.existingItemId)
    const item = isEdit ? list.items.find((item) => item.id === dialogState.existingItemId) : null

    if (isEdit && !item) {
        console.error('Attempting to update unknown list item index', dialogState.existingItemId)
        dispatch({ type: 'error', message: 'Ooops! Something bad happened.' })
        return null
    }

    const activeStore = list.stores.length > storeTabIndex ? list.stores[storeTabIndex] : null

    const title = isEdit ? 'Update List Item' : 'Add an Item'
    const buttonVerb = isEdit ? 'Update' : 'Add'

    const closeDialog = () => {
        dispatch({ type: 'closeItemDialog' })
    }

    const getOptionName = (option) => {
        if (option && option.name) {
            return option.name
        } else {
            return option
        }
    }

    const handleGroceryChange = (event, newValue) => {
        dispatch({ type: 'updateItemDialog', grocerySelection: newValue, unit: newValue.units })
    }

    const handleGroceryInputChange = (event, newValue) => {
        const selectionChanged = dialogState.grocerySelection && dialogState.grocerySelection.name !== newValue
        console.log('GroceryInputChange', newValue, dialogState.grocerySelection, selectionChanged) // TODO: It looked like the selection was not getting cleared
        dispatch({
            type: 'updateItemDialog',
            groceryName: newValue,
            grocerySelection: selectionChanged ? null : dialogState.grocerySelection,
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        console.log(dialogState)
        const currentItem = {
            groceryId: dialogState.grocerySelection.id,
            storeId: activeStore.id,
            amount: dialogState.amount,
            unit: dialogState.unit,
            note: dialogState.note,
        }

        console.log(currentItem)

        if (isEdit) {
            const updatedItem = { ...currentItem, id: item.id }
            // TODO: this should return back the modified item in its populated form
            const result = await listItemService.updateItem(list.id, updatedItem)

            console.log('Updated item', result)
            if (result.success) {
                dispatch({ type: 'updateItem', item: updatedItem })
            }
        } else {
            const result = await listItemService.addItem(list.id, currentItem)

            console.log('Added item', result)
            if (result.success) {
                dispatch({ type: 'addItem', item: result.item })
            }
        }

        dispatch({ type: 'closeItemDialog' })
    }

    const preventSubmit = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            event.target.blur()
        }
    }

    const setAmount = (value) => {
        dispatch({ type: 'updateItemDialog', amount: value })
    }

    const setUnit = (value) => {
        dispatch({ type: 'updateItemDialog', unit: value })
    }

    const setNote = (value) => {
        dispatch({ type: 'updateItemDialog', note: value })
    }

    return (
        <Dialog maxWidth="xs" fullWidth onClose={closeDialog} open={dialogState.isOpen}>
            <DialogTitle>{title}</DialogTitle>
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
                <Typography variant="h2">{title}</Typography>
                <Autocomplete
                    freeSolo
                    autoHighlight
                    options={groceries}
                    groupBy={(option) => option.section}
                    getOptionLabel={getOptionName}
                    value={dialogState.groceryName}
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
                        value={dialogState.amount}
                        variant="standard"
                        onChange={(event) => setAmount(event.target.value)}
                        sx={{ flexGrow: 1 }}
                    />
                    <TextField
                        label="Units"
                        value={dialogState.unit}
                        variant="standard"
                        onChange={(event) => setUnit(event.target.value)}
                    />
                </Stack>
                <TextField
                    label="Note"
                    multiline
                    rows={3}
                    value={dialogState.note}
                    variant="standard"
                    onChange={(event) => setNote(event.target.value)}
                />
                <Button type="submit" color="primary" variant="contained">
                    {buttonVerb}
                </Button>
                <Button onClick={closeDialog} color="secondary" variant="contained">
                    Cancel
                </Button>
            </Stack>
        </Dialog>
    )
}

export default ListItemDialog
