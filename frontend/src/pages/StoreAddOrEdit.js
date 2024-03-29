import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Alert,
    Button,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PopUp from '../components/PopUp'
import DraggableList from '../components/DraggableList'

const StoreAddOrEdit = ({ dispatch, isEdit, store, submitChanges, unsetSections }) => {
    const [showUnsetSections, setShowUnsetSections] = useState(false)

    const popup = useRef()

    const title = isEdit ? 'Update Store' : 'Add a Store'
    const buttonVerb = isEdit ? 'Update' : 'Add'

    const handleAisleReorder = (result) => {
        if (!result.destination) {
            return
        }

        const sourceIndex = result.source.index
        const destinationIndex = result.destination.index
        if (sourceIndex === destinationIndex) {
            return
        }

        const sourceAisle = store.aisles[sourceIndex]
        let aislesReorder = store.aisles.slice(0)
        for (let i = sourceIndex; i < destinationIndex; i++) {
            aislesReorder[i] = aislesReorder[i + 1]
        }
        for (let i = sourceIndex; i > destinationIndex; i--) {
            aislesReorder[i] = aislesReorder[i - 1]
        }
        aislesReorder[destinationIndex] = sourceAisle

        dispatch({ type: 'updateAllAisles', aisles: aislesReorder })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        await submitChanges()
    }

    return (
        <Container maxWidth="sm">
            <Typography variant="h2">{title}</Typography>
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
                <TextField
                    autoFocus
                    required
                    label="Name"
                    value={store.name}
                    variant="standard"
                    onChange={(event) => dispatch({ type: 'updateName', name: event.target.value })}
                />
                <TextField
                    required
                    label="Address"
                    value={store.address}
                    variant="standard"
                    onChange={(event) => dispatch({ type: 'updateAddress', address: event.target.value })}
                />
                <Paper sx={{ p: 1 }}>
                    <Stack>
                        <Typography sx={{ m: 1 }}>{store.aisles.length} Aisles</Typography>
                        <Button
                            sx={{ m: 1 }}
                            color="primary"
                            variant="contained"
                            onClick={() => dispatch({ type: 'modifyNewAisle' })}
                        >
                            Add Aisle
                        </Button>
                    </Stack>
                    <DraggableList
                        items={store.aisles}
                        itemToKey={(aisle) => aisle.id.toString()}
                        itemToElement={(aisle, index) => (
                            <>
                                <ListItemIcon>
                                    <DragHandleIcon />
                                </ListItemIcon>
                                <ListItemText primary={aisle.name} />
                                <ListItemSecondaryAction>
                                    <IconButton onClick={() => dispatch({ type: 'modifyExistingAisle', index })}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => dispatch({ type: 'deleteAisle', index })}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </>
                        )}
                        onDragEnd={handleAisleReorder}
                    />
                    {unsetSections.length > 0 ? (
                        <Alert
                            severity="warning"
                            action={
                                <Button color="inherit" size="small" onClick={() => setShowUnsetSections(true)}>
                                    DETAILS
                                </Button>
                            }
                        >
                            This store is missing {unsetSections.length} sections.
                        </Alert>
                    ) : null}
                </Paper>
                <PopUp ref={popup} />
                <Button type="submit" color="primary" variant="contained">
                    {buttonVerb}
                </Button>
                <Button component={Link} to="/stores" color="secondary" variant="contained">
                    Cancel
                </Button>
            </Stack>
            <Dialog
                maxWidth={'xs'}
                fullWidth={true}
                open={showUnsetSections}
                onClose={() => setShowUnsetSections(false)}
            >
                <DialogTitle>Unused Sections in {store.name}</DialogTitle>
                <DialogContent>
                    <List sx={{ maxHeight: 200 }}>
                        {unsetSections.map((section) => (
                            <ListItem key={section}>
                                <ListItemText primary={section} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>
        </Container>
    )
}

export default StoreAddOrEdit
