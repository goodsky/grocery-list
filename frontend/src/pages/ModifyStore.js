import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, AlertTitle, Button, Container, Stack } from '@mui/material'
import storeService from '../services/stores'
import ModifyStoreAisles from './ModifyStoreAisles'
import ModifyStoreSections from './ModifyStoreSections'

const ModifyStore = ({ isEdit }) => {
    const [mode, setMode] = useState('Aisles')
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [aisles, setAisles] = useState([])
    const [aisleIndex, setAisleIndex] = useState()

    const { id } = useParams()
    const idInt = parseInt(id, 10)

    if (isEdit) {
        if (!id) {
            console.error('Missing id while modifying a store!')
        } else if (!idInt) {
            console.error('Invalid id while modifying a store!')
        }
    }

    useEffect(() => {
        const fetchStore = async (id) => {
            const result = await storeService.getStoreById(id, true)
            if (result.success) {
                setName(result.store.name)
                setAddress(result.store.address)
                setAisles(result.store.aisles)
            } else {
                switchModeToError()
            }
        }

        if (isEdit) {
            fetchStore(id)
        }
    }, [isEdit, id])

    const switchModeToAisle = () => {
        setAisleIndex(null)
        setMode('Aisles')
    }

    const switchModeToSections = (aisleId) => {
        setAisleIndex(aisleId)
        setMode('Sections')
    }

    const switchModeToError = () => {
        setMode('Error')
    }

    const addAisle = (aisle) => {
        let fakeId = undefined
        do {
            fakeId = parseInt(Math.random() * Number.MAX_SAFE_INTEGER, 10)
            // eslint-disable-next-line no-loop-func
        } while (aisles.some((x) => x.id === fakeId))

        aisle.id = fakeId
        aisle.position = aisles.length
        const newAisles = aisles.concat(aisle)
        setAisles(newAisles)
    }

    const updateAisle = (aisle) => {
        const newAisles = aisles.map((x) => (x.id === aisle.id ? aisle : x))
        setAisles(newAisles)
    }

    switch (mode) {
        case 'Aisles':
            return (
                <ModifyStoreAisles
                    id={idInt}
                    isEdit={isEdit}
                    name={name}
                    setName={setName}
                    address={address}
                    setAddress={setAddress}
                    aisles={aisles}
                    setAisles={setAisles}
                    addAisle={() => switchModeToSections(null)}
                    updateAisle={(index) => switchModeToSections(index)}
                />
            )

        case 'Sections':
            const isEditAisle = Number.isInteger(aisleIndex)
            const aisle = aisles[aisleIndex]

            if (isEditAisle && !aisle) {
                console.error('Attempting to modify unknown aisle index', aisleIndex)
                switchModeToError()
                return null
            }

            return (
                <ModifyStoreSections
                    aisle={aisle}
                    isEdit={isEditAisle}
                    addAisle={addAisle}
                    updateAisle={updateAisle}
                    navigateBack={() => switchModeToAisle()}
                />
            )

        case 'Error':
            return (
                <Container maxWidth="sm">
                    <Stack spacing={2} sx={{ m: 2 }}>
                        <Alert severity="error">
                            <AlertTitle>Error</AlertTitle>
                            Something went wrong! Click back and try again.
                        </Alert>
                        <Button component={Link} to="/stores" color="secondary" variant="contained">
                            Go Back
                        </Button>
                    </Stack>
                </Container>
            )

        default:
            console.error('Unknown mode', mode)
            return null
    }
}

export default ModifyStore
