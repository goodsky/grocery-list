import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Container, Stack, TextField, Typography } from '@mui/material'
import PopUp from '../components/PopUp'
import storeService from '../services/stores'

const ModifyStoreAisles = ({ isEdit }) => {
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')

    const popup = useRef()
    const navigate = useNavigate()
    const { id } = useParams()
    const idInt = parseInt(id, 10)

    if (isEdit) {
        if (!id) {
            console.error('Missing id while modifying a store!')
        } else if (!idInt) {
            console.error('Invalid id while modifying a store!')
        }
    }

    const title = isEdit ? 'Modify a Store' : 'Add a Store'
    const buttonVerb = isEdit ? 'Edit' : 'Add'

    useEffect(() => {
        const fetchStore = async (id) => {
            const result = await storeService.getStoreById(id)
            if (result.success) {
                setName(result.store.name)
                setAddress(result.store.address)
            } else {
                popup.current.notify(`Failed to load store '${id}`, 'error', 5000)
            }
        }

        if (isEdit) {
            fetchStore(id)
        }
    }, [isEdit, id])

    const handleSubmit = async (event) => {
        event.preventDefault()

        const store = {
            name,
            address,
        }

        let result = {}
        if (isEdit) {
            const updatedStore = {
                id: idInt,
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
                <TextField
                    required
                    label="Address"
                    value={address}
                    variant="standard"
                    onChange={(event) => setAddress(event.target.value)}
                />
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
