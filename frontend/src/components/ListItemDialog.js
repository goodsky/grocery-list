import { useRef } from 'react'
import { Autocomplete, Button, Dialog, DialogTitle, Stack, TextField } from '@mui/material'
import PopUp from './PopUp'
import groceryService from '../services/groceries'
import listItemService from '../services/listItems'

const ListItemDialog = ({ dispatch, list, storeTabIndex, groceries, sections, dialogState }) => {
    const isEdit = Number.isInteger(dialogState.existingItemId)
    const item = isEdit ? list.items.find((item) => item.id === dialogState.existingItemId) : null

    const popup = useRef()

    if (isEdit && !item) {
        console.error('Attempting to update unknown list item index', dialogState.existingItemId)
        dispatch({ type: 'error', message: 'Ooops! Something bad happened.' })
        return null
    }

    const activeStore = list.stores.length > storeTabIndex ? list.stores[storeTabIndex] : null

    const title = isEdit ? 'Update List Item' : 'Add an Item'
    const buttonVerb = isEdit ? 'Update' : 'Add'

    const isUnknownGrocery = !dialogState.grocerySelection

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
        let newUnits = newValue ? newValue.units : ''
        dispatch({ type: 'updateItemDialog', grocerySelection: newValue, unit: newUnits })
    }

    const handleGroceryInputChange = (event, newValue) => {
        const selectionChanged = dialogState.grocerySelection && dialogState.grocerySelection.name !== newValue
        dispatch({
            type: 'updateItemDialog',
            groceryName: newValue,
            grocerySelection: selectionChanged ? null : dialogState.grocerySelection,
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        console.log('Add/Update list item', dialogState)

        let groceryId = dialogState.grocerySelection?.id
        if (isUnknownGrocery) {
            const grocery = {
                name: dialogState.groceryName,
                section: dialogState.section,
                units: dialogState.unit,
            }

            console.log('Adding grocery', grocery)
            const result = await groceryService.addGrocery(grocery)
            if (!result.success) {
                popup.current.notify(
                    `Uh oh! Failed to add '${grocery.name}' to database. Try again later!`,
                    'error',
                    5000
                )
                return
            }

            groceryId = result.grocery.id
        }

        const currentItem = {
            groceryId,
            storeId: activeStore.id,
            amount: dialogState.amount,
            unit: dialogState.unit,
            note: dialogState.note,
        }

        if (isEdit) {
            const updatedItem = { ...currentItem, id: item.id, groceryname: dialogState.groceryName }
            // TODO: this should return back the modified item in its populated form
            const result = await listItemService.updateItem(list.id, updatedItem)

            console.log('Updated item', result, updatedItem)
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

    const setSection = (value) => {
        dispatch({ type: 'updateItemDialog', section: value })
    }

    return (
        <Dialog maxWidth="xs" fullWidth onClose={closeDialog} open={dialogState.isOpen}>
            <DialogTitle>{title}</DialogTitle>
            <Stack component="form" spacing={2} sx={{ m: 2 }} onSubmit={handleSubmit}>
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
                {isUnknownGrocery ? (
                    <Autocomplete
                        freeSolo
                        options={sections}
                        value={dialogState.section}
                        onChange={(event, newValue) => setSection(newValue)}
                        onInputChange={(event, newValue) => setSection(newValue)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                e.target.blur()
                            }
                        }}
                        renderInput={(params) => <TextField {...params} required label="Section" variant="standard" />}
                        sx={{ flexGrow: 1 }}
                    />
                ) : null}
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
                <PopUp ref={popup} />
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
