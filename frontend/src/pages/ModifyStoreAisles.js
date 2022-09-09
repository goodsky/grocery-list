import { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
    Button,
    Container,
    IconButton,
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

const ModifyStoreAisles = ({ dispatch, isEdit, store, submitChanges }) => {
    const popup = useRef()

    const title = isEdit ? 'Modify a Store' : 'Add a Store'
    const buttonVerb = isEdit ? 'Edit' : 'Add'

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
                </Paper>
                <PopUp ref={popup} />
                <Button type="submit" color="primary" variant="contained">
                    {buttonVerb}
                </Button>
                <Button component={Link} to="/stores" color="secondary" variant="contained">
                    Cancel
                </Button>
            </Stack>
        </Container>
    )
}

export default ModifyStoreAisles
