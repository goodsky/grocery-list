import { useEffect, useReducer } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, AlertTitle, Button, Container, Stack } from '@mui/material'
import sectionsService from '../services/sections'
import storeService from '../services/stores'
import storeServiceHelper from '../services/storeHelper'
import StoreAddOrEdit from './StoreAddOrEdit'
import StoreAisleAddOrEdit from './StoreAisleAddOrEdit'

const initialState = {
    store: { id: undefined, name: '', address: '', aisles: [] },
    editMode: 'Aisles',
    aisleIndex: null,
    errorMsg: null,
    grocerySections: [],
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'addAisle':
            const newAisle = { ...action.aisle }
            newAisle.id = generateUniqueId(state.store.aisles.map((aisle) => aisle.id))
            newAisle.position = state.store.aisles.length
            const newAisles = state.store.aisles.concat(newAisle)

            return { ...state, editMode: 'Aisles', store: { ...state.store, aisles: newAisles } }

        case 'cancelAisleUpdate':
            return { ...state, editMode: 'Aisles' }

        case 'deleteAisle':
            const fewerAisles = state.store.aisles.filter((x, index) => index !== action.index)

            return { ...state, store: { ...state.store, aisles: fewerAisles } }

        case 'error':
            return { ...state, editMode: 'Error', errorMsg: action.message }

        case 'initialize':
            return { ...state, store: action.store }

        case 'modifyExistingAisle':
            return { ...state, editMode: 'Sections', aisleIndex: action.index }

        case 'modifyNewAisle':
            return { ...state, editMode: 'Sections', aisleIndex: null }

        case 'setGrocerySections':
            return { ...state, grocerySections: action.sections }

        case 'updateAddress':
            return { ...state, store: { ...state.store, address: action.address } }

        case 'updateAisle':
            const updatedAisles = state.store.aisles.map((x) => (x.id === action.aisle.id ? action.aisle : x))

            return { ...state, editMode: 'Aisles', store: { ...state.store, aisles: updatedAisles } }

        case 'updateAllAisles':
            return { ...state, store: { ...state.store, aisles: action.aisles } }

        case 'updateName':
            return { ...state, store: { ...state.store, name: action.name } }

        default:
            throw new Error(`Unknown action type ${action.type} in ModifyStore`)
    }
}

const StoreContainer = ({ isEdit }) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const navigate = useNavigate()
    const { id } = useParams()
    const idInt = parseInt(id, 10)

    const storeSections = new Set()
    state.store.aisles.forEach((aisle) => aisle.sections.forEach((section) => storeSections.add(section)))

    const unsetSections = state.grocerySections.filter((section) => !storeSections.has(section))

    if (isEdit) {
        if (!id) {
            console.error('Missing id while modifying a store!')
        } else if (!idInt) {
            console.error('Invalid id while modifying a store!')
        }
    }

    useEffect(() => {
        const fetchGrocerySections = async () => {
            const result = await sectionsService.getGrocerySections()
            if (result.success) {
                dispatch({ type: 'setGrocerySections', sections: result.sections })
            } else {
                dispatch({ type: 'error', message: 'Failed to load sections!' })
            }
        }

        const fetchStore = async (id) => {
            const result = await storeService.getStoreById(id, true)
            if (result.success) {
                dispatch({ type: 'initialize', store: result.store })
            } else {
                dispatch({ type: 'error', message: 'Failed to initialize store!' })
            }
        }

        fetchGrocerySections()

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
                <StoreAddOrEdit
                    dispatch={dispatch}
                    isEdit={isEdit}
                    store={state.store}
                    submitChanges={submitChanges}
                    unsetSections={unsetSections}
                />
            )

        case 'Sections':
            const isEditAisle = Number.isInteger(state.aisleIndex)
            const aisle = state.store.aisles[state.aisleIndex]

            if (isEditAisle && !aisle) {
                console.error('Attempting to update unknown aisle index', state.aisleIndex)
                dispatch({ type: 'error', message: 'Ooops! Something bad happened.' })
                return null
            }

            return (
                <StoreAisleAddOrEdit
                    aisle={aisle}
                    dispatch={dispatch}
                    isEdit={isEditAisle}
                    storeSections={storeSections}
                    unsetSections={unsetSections}
                />
            )

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

export default StoreContainer
