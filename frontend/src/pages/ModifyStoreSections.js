import { useRef, useState } from 'react'
import {
    Button,
    Container,
    List,
    IconButton,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PopUp from '../components/PopUp'

const ModifyStoreSections = ({ aisle, isEdit, addAisle, updateAisle, navigateBack }) => {
    const [name, setName] = useState(isEdit ? aisle.name : '')
    const [sections, setSections] = useState(isEdit ? aisle.sections : [])
    const [newSection, setNewSection] = useState('')

    const popup = useRef()

    const title = isEdit ? 'Modify an Aisle' : 'Add an Aisle'
    const buttonVerb = isEdit ? 'Edit' : 'Add'

    const handleAddSection = () => {
        if (!newSection) {
            return
        }

        if (sections.some((section) => section.toLowerCase() === newSection.toLowerCase())) {
            popup.current.notify(`A section already exists named '${newSection}'`, 'warning', 3000)
            return
        }

        const newSections = sections.concat(newSection)
        setSections(newSections)

        setNewSection('')
    }

    const handleDeleteSection = (index) => {
        const updatedSections = sections.slice(0, index).concat(sections.slice(index + 1))
        setSections(updatedSections)
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        const newAisle = {
            name,
            sections,
        }

        if (isEdit) {
            const updatedAisle = {
                id: aisle.id,
                ...newAisle,
            }
            console.log('Updating aisle', updatedAisle)
            updateAisle(updatedAisle)
        } else {
            console.log('Adding aisle', newAisle)
            addAisle(newAisle)
        }

        navigateBack()
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
                <Paper sx={{ p: 1 }}>
                    <Stack>
                        <Typography>{sections.length} Aisles</Typography>
                        <Stack direction="row">
                            <TextField
                                label="Section"
                                value={newSection}
                                variant="standard"
                                onChange={(event) => setNewSection(event.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddSection()
                                    }
                                }}
                                sx={{ flex: 1 }}
                            />
                            <Button
                                sx={{ m: 1 }}
                                color="primary"
                                variant="contained"
                                onClick={() => handleAddSection()}
                            >
                                Add Aisle
                            </Button>
                        </Stack>
                        <List sx={{ maxHeight: 210, overflow: 'auto' }}>
                            {sections.map((section, index) => (
                                <ListItem key={section}>
                                    <ListItemText primary={section} />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleDeleteSection(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Stack>
                </Paper>
                <PopUp ref={popup} />
                <Button type="submit" color="primary" variant="contained">
                    {buttonVerb}
                </Button>
                <Button color="secondary" variant="contained" onClick={() => navigateBack()}>
                    Cancel
                </Button>
            </Stack>
        </Container>
    )
}

export default ModifyStoreSections
