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
import EditIcon from '@mui/icons-material/Edit'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'

import TabPanelList from '../components/TabPanelList'
import listService from '../services/lists'
import listItemService from '../services/listItems'

const ModifyList = ({ dispatch, isEdit, list, storeIndex, stores }) => {
    const [storeDialogOpen, setStoreDialogOpen] = useState(false)
    const [storeDialogSelection, setStoreDialogSelection] = useState(null)

    const title = isEdit ? 'Modify List' : 'Add a List'

    const unusedStores = stores.filter((store) => !list.stores.some((usedStore) => usedStore.id === store.id))

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

    const deleteListItem = async (id) => {
        dispatch({ type: 'deleteItem', id })
        await listItemService.deleteItem(list.id, id)
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
                    <Button
                        sx={{ m: 1 }}
                        color="primary"
                        variant="contained"
                        disabled={!list.stores || list.stores.length === 0}
                        onClick={() => dispatch({ type: 'setMode', mode: 'item' })}
                    >
                        Add Item
                    </Button>
                    <Button
                        sx={{ m: 1 }}
                        color="secondary"
                        variant="contained"
                        onClick={() => setStoreDialogOpen(true)}
                    >
                        Add Store
                    </Button>
                </Stack>
                <Paper>
                    <TabPanelList
                        value={storeIndex}
                        updateIndex={(index) => dispatch({ type: 'setStoreIndex', index })}
                        tabs={list.stores}
                        options={list.items}
                        optionInTab={(option, tab) => option.storeId === tab.id}
                        optionToElement={(item) => {
                            return (
                                <ListItem key={item.id}>
                                    <ListItemText
                                        primary={`${item.groceryname} \tx ${item.amount} ${item.unit ? item.unit : ''}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            onClick={() => dispatch({ type: 'setMode', mode: 'item', itemId: item.id })}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => deleteListItem(item.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            )
                        }}
                    />
                </Paper>
                <Button component={Link} to="/" color="secondary" variant="contained">
                    Done
                </Button>
            </Stack>
            <Dialog maxWidth="xs" fullWidth onClose={() => setStoreDialogOpen(false)} open={storeDialogOpen}>
                <DialogTitle>Add a store</DialogTitle>
                <Stack spacing={2} sx={{ m: 2 }}>
                    <Autocomplete
                        autoHighlight
                        options={unusedStores}
                        onChange={(event, newValue) => setStoreDialogSelection(newValue)}
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
                    <Button
                        onClick={() => {
                            if (storeDialogSelection) {
                                dispatch({ type: 'addStore', store: storeDialogSelection })
                                setStoreDialogSelection(null)
                                setStoreDialogOpen(false)
                            }
                        }}
                        color="primary"
                        variant="contained"
                    >
                        Add
                    </Button>
                    <Button onClick={() => setStoreDialogOpen(false)} color="secondary" variant="contained">
                        Cancel
                    </Button>
                </Stack>
            </Dialog>
        </LocalizationProvider>
    )
}

export default ModifyList
