import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Autocomplete, Button, Container, Stack, TextField, Typography } from '@mui/material'
import PopUp from '../components/PopUp'
import groceryService from '../services/groceries'
import sectionsService from '../services/sections'

const ModifyGrocery = ({ isEdit }) => {
    const [name, setName] = useState('')
    const [section, setSection] = useState('')
    const [units, setUnits] = useState('')
    const [sectionAutocomplete, setSectionAutocomplete] = useState([])

    const popup = useRef()
    const navigate = useNavigate()
    const { id } = useParams()
    const idInt = parseInt(id, 10)

    if (isEdit) {
        if (!id) {
            console.error('Missing id while modifying a grocery!')
        } else if (!idInt) {
            console.error('Invalid id while modifying a grocery!')
        }
    }

    const title = isEdit ? 'Modify a Grocery' : 'Add a Grocery'
    const buttonVerb = isEdit ? 'Edit' : 'Add'

    useEffect(() => {
        const fetchGrocery = async (id) => {
            const result = await groceryService.getGroceryById(id)
            if (result.success) {
                setName(result.grocery.name)
                setSection(result.grocery.section)
                if (result.grocery.units) setUnits(result.grocery.units)
            } else {
                popup.current.notify(`Failed to load grocery '${id}`, 'error', 5000)
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

        if (isEdit) {
            fetchGrocery(id)
        }

        fetchSections()
    }, [isEdit, id])

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
                id: idInt,
                ...grocery,
            }
            console.log('Updating grocery', updatedGrocery)
            result = await groceryService.updateGrocery(updatedGrocery)
        } else {
            console.log('Adding grocery', grocery)
            result = await groceryService.addGrocery(grocery)
        }

        if (result.success) {
            navigate('/groceries')
        } else {
            popup.current.notify(`Uh oh! Failed to ${isEdit ? 'modify' : 'add'} grocery!`, 'error', 5000)
        }
    }

    return (
        <Container maxWidth="sm">
            <Typography variant="h2">{title}</Typography>
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
                <TextField
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
                <Button component={Link} to="/groceries" color="secondary" variant="contained">
                    Cancel
                </Button>
            </Stack>
        </Container>
    )
}

export default ModifyGrocery
