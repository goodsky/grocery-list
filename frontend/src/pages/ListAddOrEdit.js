import { Link } from 'react-router-dom'
import {
    Button,
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
import ListItemDialog from '../components/ListItemDialog'
import ListStoreDialog from '../components/ListStoreDialog'
import listService from '../services/lists'
import listItemService from '../services/listItems'

const ListAddOrEdit = ({
    dispatch,
    isEdit,
    list,
    storeTabIndex,
    stores,
    sections,
    groceries,
    itemDialogState,
    storeDialogState,
}) => {
    const title = isEdit ? 'Update List' : 'Add a List'

    const updateNameOrDate = async () => {
        if (list.isChanged) {
            console.log(`UpdateNameOrDate: ${list.shoppingDate}`)
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
                        sx={{ m: 1, flex: 1 }}
                        color="primary"
                        variant="contained"
                        disabled={!list.stores || list.stores.length === 0}
                        onClick={() => dispatch({ type: 'openItemDialog' })}
                        disableRipple
                    >
                        Add Item
                    </Button>
                    <Button
                        sx={{ m: 1 }}
                        color="secondary"
                        variant="contained"
                        onClick={() => dispatch({ type: 'openStoreDialog' })}
                        disableRipple
                    >
                        Change Stores
                    </Button>
                </Stack>
                <Paper>
                    <TabPanelList
                        value={storeTabIndex}
                        updateIndex={(index) => dispatch({ type: 'setStoreTabIndex', index })}
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
                                            onClick={() => dispatch({ type: 'openItemDialog', itemId: item.id })}
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
            <ListItemDialog
                dispatch={dispatch}
                list={list}
                storeTabIndex={storeTabIndex}
                groceries={groceries}
                sections={sections}
                dialogState={itemDialogState}
            />
            <ListStoreDialog dispatch={dispatch} list={list} stores={stores} dialogState={storeDialogState} />
        </LocalizationProvider>
    )
}

export default ListAddOrEdit
