import { useEffect, useReducer } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, AlertTitle, Button, Container, Stack } from '@mui/material'
import storeService from '../services/stores'
import storeServiceHelper from '../services/storeHelper'
import ModifyStoreAisles from './ModifyStoreAisles'
import ModifyStoreSections from './ModifyStoreSections'

const initialState = {
    store: { id: undefined, name: '', address: '', aisles: [] },
    editMode: 'Aisles',
    aisleIndex: null,
    errorMsg: null,
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'initialize':
            return { ...state, store: action.store }

        case 'updateName':
            return { ...state, store: { ...state.store, name: action.name } }

        case 'updateAddress':
            return { ...state, store: { ...state.store, address: action.address } }

        case 'modifyNewAisle':
            return { ...state, editMode: 'Sections', aisleIndex: null }

        case 'modifyExistingAisle':
            return { ...state, editMode: 'Sections', aisleIndex: action.index }

        case 'addAisle':
            const newAisle = { ...action.aisle }
            newAisle.id = generateUniqueId(state.store.aisles.map((aisle) => aisle.id))
            newAisle.position = state.store.aisles.length
            const newAisles = state.store.aisles.concat(newAisle)

            return { ...state, editMode: 'Aisles', store: { ...state.store, aisles: newAisles } }

        case 'updateAisle':
            const updatedAisles = state.store.aisles.map((x) => (x.id === action.aisle.id ? action.aisle : x))

            return { ...state, editMode: 'Aisles', store: { ...state.store, aisles: updatedAisles } }

        case 'deleteAisle':
            const fewerAisles = state.store.aisles.filter((x, index) => index !== action.index)

            return { ...state, store: { ...state.store, aisles: fewerAisles } }

        case 'cancelAisleUpdate':
            return { ...state, editMode: 'Aisles' }

        case 'updateAllAisles':
            return { ...state, store: { ...state.store, aisles: action.aisles } }

        case 'error':
            return { ...state, editMode: 'Error', errorMsg: action.message }

        default:
            throw new Error(`Unknown action type ${action.type} in ModifyStore`)
    }
}

const ModifyStore = ({ isEdit }) => {
    const [state, dispatch] = useReducer(reducer, initialState)

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

    useEffect(() => {
        const fetchStore = async (id) => {
            const result = await storeService.getStoreById(id, true)
            if (result.success) {
                dispatch({ type: 'initialize', store: result.store })
            } else {
                dispatch({ type: 'error', message: 'Failed to initialize store!' })
            }
        }

        if (isEdit) {
            fetchStore(id)
        }
    }, [isEdit, id])

    const submitChanges = async () => {
        const result = await storeServiceHelper.addOrUpdateFullStore(state.store, state.prevStore)

        if (result.success) {
            navigate('/stores')
        } else {
            dispatch({ type: 'error', message: 'Something went wrong writing the update!' })
        }
    }

    switch (state.editMode) {
        case 'Aisles':
            return (
                <ModifyStoreAisles
                    dispatch={dispatch}
                    isEdit={isEdit}
                    store={state.store}
                    submitChanges={submitChanges}
                />
            )

        case 'Sections':
            const isEditAisle = Number.isInteger(state.aisleIndex)
            const aisle = state.store.aisles[state.aisleIndex]

            if (isEditAisle && !aisle) {
                console.error('Attempting to modify unknown aisle index', state.aisleIndex)
                dispatch({ type: 'error', message: 'Ooops! Something bad happened.' })
                return null
            }

            return <ModifyStoreSections aisle={aisle} dispatch={dispatch} isEdit={isEditAisle} />

        case 'Error':
            return (
                <Container maxWidth="sm">
                    <Stack spacing={2} sx={{ m: 2 }}>
                        <Alert severity="error">
                            <AlertTitle>Error</AlertTitle>
                            {state.errorMsg}
                        </Alert>
                        <Button component={Link} to="/stores" color="secondary" variant="contained">
                            Go Back
                        </Button>
                    </Stack>
                </Container>
            )

        default:
            console.error('Unknown mode', state.editMode)
            dispatch({ type: 'error', message: 'Ooops! Something bad happened.' })
            return null
    }
}

const generateUniqueId = (existingIds) => {
    let fakeId
    do {
        fakeId = parseInt(Math.random() * Number.MAX_SAFE_INTEGER, 10)
        // eslint-disable-next-line no-loop-func
    } while (existingIds.some((id) => id === fakeId))

    return fakeId
}

export default ModifyStore
