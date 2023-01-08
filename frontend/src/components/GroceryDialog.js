import { useEffect, useRef, useState } from 'react'
import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import PopUp from './PopUp'
import groceryService from '../services/groceries'
import sectionsService from '../services/sections'

const GroceryDialog = (props) => {
    const { isEdit, groceryId, isOpen, close } = props

    const [name, setName] = useState('')
    const [section, setSection] = useState('')
    const [units, setUnits] = useState('')
    const [sectionAutocomplete, setSectionAutocomplete] = useState([])

    const popup = useRef()

    const title = isEdit ? 'Modify a Grocery' : 'Add a Grocery'
    const buttonVerb = isEdit ? 'Edit' : 'Add'

    useEffect(() => {
        const fetchGrocery = async (groceryId) => {
            const result = await groceryService.getGroceryById(groceryId)
            if (result.success) {
                setName(result.grocery.name)
                setSection(result.grocery.section)
                if (result.grocery.units) setUnits(result.grocery.units)
            } else {
                popup.current.notify(`Failed to load grocery '${groceryId}`, 'error', 5000)
            }
        }

        const fetchSections = async () => {
            const result = await sectionsService.getAllSections()
            if (result.success) {
                setSectionAutocomplete(result.sections)
            } else {
                console.warn('Failed to populate autocomplete for sections')
            }
        }

        setName('')
        setSection('')
        setUnits('')

        if (isEdit) {
            fetchGrocery(groceryId)
        }

        fetchSections()
    }, [isEdit, groceryId])

    const handleSubmit = async (event) => {
        event.preventDefault()

        const grocery = {
            name,
            section,
            units,
        }

        let result = {}
        if (isEdit) {
            const updatedGrocery = {
                id: groceryId,
                ...grocery,
            }
            console.log('Updating grocery', updatedGrocery)
            result = await groceryService.updateGrocery(updatedGrocery)
        } else {
            console.log('Adding grocery', grocery)
            result = await groceryService.addGrocery(grocery)
        }

        if (result.success) {
            close()
        } else {
            popup.current.notify(`Uh oh! Failed to ${isEdit ? 'modify' : 'add'} grocery!`, 'error', 5000)
        }
    }

    return (
        <Dialog maxWidth={'sm'} fullWidth={true} open={isOpen} onClose={() => close()}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Stack component="form" spacing={2} onSubmit={handleSubmit}>
                    <TextField
                        autoFocus
                        required
                        label="Name"
                        value={name}
                        variant="standard"
                        onChange={(event) => setName(event.target.value)}
                    />
                    <Autocomplete
                        freeSolo
                        options={sectionAutocomplete}
                        value={section}
                        onChange={(event, newValue) => setSection(newValue)}
                        onInputChange={(event, newValue) => setSection(newValue)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                e.target.blur()
                            }
                        }}
                        renderInput={(params) => <TextField {...params} required label="Section" variant="standard" />}
                    />
                    <TextField
                        label="Units"
                        value={units}
                        variant="standard"
                        onChange={(event) => setUnits(event.target.value)}
                    />
                    <PopUp ref={popup} />
                    <Button type="submit" color="primary" variant="contained">
                        {buttonVerb}
                    </Button>
                    <Button onClick={() => close()} color="secondary" variant="contained">
                        Cancel
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    )
}

export default GroceryDialog
