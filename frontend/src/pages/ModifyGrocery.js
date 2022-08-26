import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Autocomplete, Button, Chip, Container, Stack, TextField, Typography } from '@mui/material'
import PopUp from '../components/PopUp'
import groceryService from '../services/groceries'

const ModifyGrocery = ({ isEdit }) => {
    const [name, setName] = useState('')
    const [aliases, setAliases] = useState([])
    const [sections, setSections] = useState([])
    const [units, setUnits] = useState('')

    const [sectionsError, setSectionsError] = useState('')

    const popup = useRef()
    const navigate = useNavigate()
    const { id } = useParams()

    if (isEdit && !id) {
        console.error('Missing id when modifying a grocery!!!')
    }

    const title = isEdit ? 'Modify a Grocery' : 'Add a Grocery'
    const buttonVerb = isEdit ? 'Edit' : 'Add'

    useEffect(() => {
        const fetchGrocery = async (id) => {
            const result = await groceryService.getGroceryById(id)
            if (result.success) {
                setName(result.grocery.name)
                if (result.grocery.aliases) setAliases(result.grocery.aliases)
                if (result.grocery.sections) setSections(result.grocery.sections)
                if (result.grocery.units) setUnits(result.grocery.units)
            } else {
                popup.current.notify(`Failed to load grocery '${id}`, 'error', 5000)
            }
        }

        if (isEdit) {
            fetchGrocery(id)
        }
    }, [isEdit, id])

    const handleAliasAutocompleteChange = (e, newAliases, reason) => {
        const newAliasesLowercase = newAliases.map((alias) => alias.toLowerCase())
        setAliases(newAliasesLowercase)
    }

    const handleSectionAutocompleteChange = (e, newSections, reason) => {
        const newSectionsLowercase = newSections.map((section) => section.toLowerCase())
        setSections(newSectionsLowercase)

        if (newSectionsLowercase.length === 0) {
            setSectionsError('Grocery must have at least one section')
        } else {
            setSectionsError('')
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (sections.length === 0) {
            setSectionsError('Grocery must have at least one section')
            return
        } else {
            setSectionsError('')
        }

        const grocery = {
            name,
            aliases,
            sections,
            units,
        }

        let result = {}
        if (isEdit) {
            const updatedGrocery = {
                id,
                ...grocery,
            }
            console.log('Updating grocery', updatedGrocery)
            result = await groceryService.updateGrocery(updatedGrocery)
        } else {
            console.log('Adding grocery', grocery)
            result = await groceryService.addGrocery(grocery)
            if (!result.success) {
                popup.current.notify('Uh oh! Adding grocery failed!', 'error', 5000)
            }
        }

        if (result.success) {
            navigate('/groceries')
        } else {
            popup.current.notify('Uh oh! Editing grocery failed!', 'error', 5000)
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
                    multiple
                    freeSolo
                    clearOnBlur
                    value={aliases}
                    options={[]}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField {...params} variant="standard" label="Aliases" placeholder="Alias" />
                    )}
                    onChange={handleAliasAutocompleteChange}
                    isOptionEqualToValue={(option, value) => option.toLowerCase() === value.toLowerCase()}
                />
                <Autocomplete
                    multiple
                    freeSolo
                    clearOnBlur
                    value={sections}
                    options={[]}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            label="Aisle Sections"
                            placeholder="Section"
                            error={!!sectionsError}
                            helperText={sectionsError}
                        />
                    )}
                    onChange={handleSectionAutocompleteChange}
                    isOptionEqualToValue={(option, value) => option.toLowerCase() === value.toLowerCase()}
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
