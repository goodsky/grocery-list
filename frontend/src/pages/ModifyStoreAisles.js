import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import EditIcon from '@mui/icons-material/Edit'
import PopUp from '../components/PopUp'
import storeService from '../services/stores'
import DraggableList from '../components/DraggableList'

const ModifyStoreAisles = ({
    id,
    isEdit,
    name,
    setName,
    address,
    setAddress,
    aisles,
    setAisles,
    addAisle,
    updateAisle,
}) => {
    const popup = useRef()
    const navigate = useNavigate()

    const title = isEdit ? 'Modify a Store' : 'Add a Store'
    const buttonVerb = isEdit ? 'Edit' : 'Add'

    const handleSubmit = async (event) => {
        event.preventDefault()

        const store = {
            name,
            address,
        }

        let result = {}
        if (isEdit) {
            const updatedStore = {
                id,
                ...store,
            }
            console.log('Updating store', updatedStore)
            result = await storeService.updateStore(updatedStore)
        } else {
            console.log('Adding store', store)
            result = await storeService.addStore(store)
        }

        if (result.success) {
            navigate('/stores')
        } else {
            popup.current.notify(`Uh oh! Failed to ${isEdit ? 'modify' : 'add'} store!`, 'error', 5000)
        }
    }

    const handleAisleReorder = (result) => {
        if (!result.destination) {
            return
        }

        const sourceIndex = result.source.index
        const destinationIndex = result.destination.index
        if (sourceIndex === destinationIndex) {
            return
        }

        const sourceAisle = aisles[sourceIndex]
        let aislesReorder = aisles.slice(0)
        for (let i = sourceIndex; i < destinationIndex; i++) {
            aislesReorder[i] = aislesReorder[i + 1]
        }
        for (let i = sourceIndex; i > destinationIndex; i--) {
            aislesReorder[i] = aislesReorder[i - 1]
        }
        aislesReorder[destinationIndex] = sourceAisle

        setAisles(aislesReorder)
    }

    return (
        <Container maxWidth="sm">
            <Typography variant="h2">{title}</Typography>
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
                <TextField
                    autoFocus
                    required
                    label="Name"
                    value={name}
                    variant="standard"
                    onChange={(event) => setName(event.target.value)}
                />
                <TextField
                    required
                    label="Address"
                    value={address}
                    variant="standard"
                    onChange={(event) => setAddress(event.target.value)}
                />
                <Paper sx={{ p: 1 }}>
                    <Stack>
                        <Typography sx={{ m: 1 }}>{aisles.length} Aisles</Typography>
                        <Button sx={{ m: 1 }} color="primary" variant="contained" onClick={() => addAisle()}>
                            Add Aisle
                        </Button>
                    </Stack>
                    <DraggableList
                        items={aisles}
                        itemToKey={(aisle) => aisle.id.toString()}
                        itemToElement={(aisle, index) => (
                            <>
                                <ListItemIcon>
                                    <DragHandleIcon />
                                </ListItemIcon>
                                <ListItemText primary={aisle.name} />
                                <ListItemSecondaryAction>
                                    <IconButton onClick={() => updateAisle(index)}>
                                        <EditIcon />
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
