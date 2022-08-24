import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Container, Stack, TextField, Typography } from '@mui/material'
import PopUp from '../components/PopUp'

const ModifyGrocery = ({ type }) => {
    const [name, setName] = useState('')

    const popup = useRef()
    const { id } = useParams()

    if (type !== 'add' && !id) {
        console.error('Missing id when modifying a grocery!!!')
    }

    console.log('Grocery id', id)

    const title = type === 'add' ? 'Add a Grocery' : 'Modify a Grocery'
    const buttonVerb = type === 'add' ? 'Add' : 'Edit'

    const handleSubmit = async (event) => {
        event.preventDefault()

        console.log('Adding grocery...')
    }

    return (
        <Container maxWidth="sm">
            <Typography variant="h2">{title}</Typography>
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
                <TextField
                    required
                    label="Grocery Name"
                    value={name}
                    variant="standard"
                    onChange={(event) => setName(event.target.value)}
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
