import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Autocomplete,
    Button,
    Dialog,
    DialogTitle,
    IconButton,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'

import TabPanelList from '../components/TabPanelList'
import listService from '../services/lists'

const ModifyList = ({ dispatch, isEdit, list, storeIndex, stores }) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogStore, setDialogStore] = useState(null)

    const title = isEdit ? 'Modify List' : 'Add a List'

    const updateNameOrDate = async () => {
        if (list.isChanged) {
            dispatch({ type: 'resetIsChanged' })
            const updatedList = {
                id: list.id,
                name: list.name,
                shoppingDate: list.shoppingDate.format('YYYY-MM-DD'),
            }
            await listService.updateList(updatedList)
            console.log('Updated list', list.name, list.shoppingDate)
        }
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={2} sx={{ m: 2 }}>
                <Typography variant="h2">{title}</Typography>
                <TextField
                    autoFocus
                    required
                    label="Name"
                    value={list.name}
                    variant="standard"
                    onChange={(event) => dispatch({ type: 'updateName', name: event.target.value })}
                    onBlur={(event) => updateNameOrDate()}
                />
                <MobileDatePicker
                    label="Shopping Date"
                    inputFormat="MM/DD/YYYY"
                    value={list.shoppingDate}
                    onChange={(newValue) => dispatch({ type: 'updateShoppingDate', shoppingDate: newValue })}
                    renderInput={(params) => <TextField {...params} variant="standard" />}
                    onAccept={(event) => updateNameOrDate()}
                />
                <Stack direction="row">
                    <Button sx={{ m: 1 }} color="primary" variant="contained" onClick={() => setDialogOpen(true)}>
                        Add Store
                    </Button>
                    <Button
                        sx={{ m: 1 }}
                        color="secondary"
                        variant="contained"
                        disabled={!list.stores || list.stores.length === 0}
                        onClick={() => dispatch({ type: 'setMode', mode: 'item' })}
                    >
                        Add Item
                    </Button>
                </Stack>
                <Paper>
                    <TabPanelList
                        value={storeIndex}
                        updateIndex={(index) => dispatch({ type: 'setStoreIndex', index })}
                        tabs={list.stores}
                        options={list.items}
                        optionInTab={(option, tab) => option.storeId === tab.id}
                        optionToElement={(item) => (
                            <ListItem key={item.id}>
                                <ListItemText primary={item.groceryName} />
                                <ListItemSecondaryAction>
                                    <IconButton onClick={() => dispatch({ type: 'deleteItem', id: item.id })}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        )}
                    />
                </Paper>
                <Button component={Link} to="/" color="secondary" variant="contained">
                    Done
                </Button>
            </Stack>
            <Dialog maxWidth="xs" fullWidth onClose={() => setDialogOpen(false)} open={dialogOpen}>
                <DialogTitle>Add a store</DialogTitle>
                <Stack spacing={2} sx={{ m: 2 }}>
                    <Autocomplete
                        autoHighlight
                        options={stores}
                        onChange={(event, newValue) => setDialogStore(newValue)}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.name === value.name}
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
                    <Button
                        onClick={() => {
                            if (dialogStore) {
                                dispatch({ type: 'addStore', store: dialogStore })
                                setDialogStore(null)
                                setDialogOpen(false)
                            }
                        }}
                        color="primary"
                        variant="contained"
                    >
                        Add
                    </Button>
                    <Button onClick={() => setDialogOpen(false)} color="secondary" variant="contained">
                        Cancel
                    </Button>
                </Stack>
            </Dialog>
        </LocalizationProvider>
    )
}

export default ModifyList
