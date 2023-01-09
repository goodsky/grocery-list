import { Autocomplete, Button, Dialog, DialogTitle, Stack, TextField, Typography } from '@mui/material'

const ListStoreDialog = ({ dispatch, list, stores, dialogState }) => {
    const unusedStores = stores.filter((store) => !list.stores.some((usedStore) => usedStore.id === store.id))

    const addStore = () => {
        if (dialogState.selection) {
            dispatch({ type: 'addStore', store: dialogState.selection })
            dispatch({ type: 'closeStoreDialog' })
        }
    }

    const closeDialog = () => {
        dispatch({ type: 'closeStoreDialog' })
    }

    const updateSelection = (selection) => {
        dispatch({ type: 'setStoreDialogSelection', selection: selection })
    }

    return (
        <Dialog maxWidth="xs" fullWidth onClose={closeDialog} open={dialogState.isOpen}>
            <DialogTitle>Add a store</DialogTitle>
            <Stack spacing={2} sx={{ m: 2 }}>
                <Autocomplete
                    autoHighlight
                    options={unusedStores}
                    onChange={(event, newValue) => updateSelection(newValue)}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
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
                    renderInput={(params) => <TextField {...params} label="Store" variant="standard" />}
                />
                <Button onClick={addStore} color="primary" variant="contained">
                    Add
                </Button>
                <Button onClick={closeDialog} color="secondary" variant="contained">
                    Cancel
                </Button>
            </Stack>
        </Dialog>
    )
}

export default ListStoreDialog
