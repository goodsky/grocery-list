import {
    Button,
    Checkbox,
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
} from '@mui/material'
import ConfirmDialog from './ConfirmDialog'

const ListStoreDialog = ({ dispatch, list, stores, dialogState }) => {
    const isStoreUsed = (store) => list.stores.some((usedStore) => usedStore.id === store.id)
    const itemsInStore = (store) => list.items.filter((item) => item.storeId === store?.id).length

    const closeDialog = () => {
        dispatch({ type: 'closeStoreDialog' })
    }

    const handleToggle = (store) => () => {
        if (isStoreUsed(store)) {
            if (itemsInStore(store) > 0) {
                dispatch({ type: 'setPendingRemoveStore', store })
            } else {
                dispatch({ type: 'removeStore', store })
            }
        } else {
            dispatch({ type: 'addStore', store })
        }
    }

    return (
        <>
            <Dialog maxWidth="xs" fullWidth onClose={closeDialog} open={dialogState.isOpen}>
                <DialogTitle>Select stores</DialogTitle>
                <Stack spacing={2} sx={{ m: 2 }}>
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {stores.map((store) => (
                            <ListItem key={store.id}>
                                <ListItemButton onClick={handleToggle(store)}>
                                    <ListItemIcon>
                                        <Checkbox checked={isStoreUsed(store)} disableRipple />
                                    </ListItemIcon>
                                    <ListItemText primary={store.name} secondary={store.address} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    <Button onClick={closeDialog} color="secondary" variant="contained">
                        Done
                    </Button>
                </Stack>
            </Dialog>
            <ConfirmDialog
                title="Confirm"
                prompt={`Unchecking store "${dialogState.pendingRemoveStore?.name}" will remove ${itemsInStore(
                    dialogState.pendingRemoveStore
                )} items from your list. Continue?`}
                isOpen={!!dialogState.pendingRemoveStore}
                close={() => dispatch({ type: 'setPendingRemoveStore', store: null })}
                onConfirm={() => dispatch({ type: 'removeStore', store: dialogState.pendingRemoveStore })}
            />
        </>
    )
}

export default ListStoreDialog
