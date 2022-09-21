import { useEffect, useReducer, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Container, List, Paper, Stack, TextField, Typography } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import dayjs from 'dayjs'

import ModifyListItem from './ModifyListItem'
import PopUp from '../components/PopUp'

import groceryService from '../services/groceries'
import listService from '../services/lists'
import storeService from '../services/stores'

const initialState = {
    list: {
        name: 'Shopping List',
        shoppingDate: dayjs(),
        items: [],
        isChanged: false,
    },
    mode: 'list',
    itemIndex: null,
    groceries: [],
    stores: [],
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'updateName':
            const nameChanged = state.list.name !== action.name
            return {
                ...state,
                list: { ...state.list, name: action.name, isChanged: state.list.isChanged || nameChanged },
            }

        case 'updateShoppingDate':
            const shoppingDateChanged = state.list.shoppingDate !== action.shoppingDate
            console.log('New Shopping Date', action.shoppingDate, shoppingDateChanged)
            return {
                ...state,
                list: {
                    ...state.list,
                    shoppingDate: action.shoppingDate,
                    isChanged: state.list.isChanged || shoppingDateChanged,
                },
            }

        case 'resetIsChanged':
            return { ...state, list: { ...state.list, isChanged: false } }

        case 'setMode':
            return { ...state, mode: action.mode, itemIndex: action.itemIndex }

        case 'setGroceries':
            return { ...state, groceries: action.groceries }

        case 'setStores':
            return { ...state, stores: action.stores }

        default:
            throw new Error(`Unknown action type ${action.type} in ModifyList`)
    }
}

const ModifyList = ({ isEdit }) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const popup = useRef()
    const { id } = useParams()
    const idInt = parseInt(id, 10)

    if (isEdit) {
        if (!id) {
            console.error('Missing id while modifying a store!')
        } else if (!idInt) {
            console.error('Invalid id while modifying a store!')
        }
    }

    const title = isEdit ? 'Modify List' : 'Add a List'

    useEffect(() => {
        // TODO: fetch list defaults

        const fetchGroceries = async () => {
            const result = await groceryService.getGroceries()
            if (result.success) {
                // The list item autocomplete expects groceries to be sorted by section
                const sortedGroceries = result.groceries
                    .map((grocery) => (grocery.section ? grocery : { ...grocery, section: 'Unknown' }))
                    .sort((a, b) => ('' + a.section).localeCompare(b.section))

                console.log('loaded groceries', sortedGroceries)
                dispatch({ type: 'setGroceries', groceries: sortedGroceries })
            } else {
                console.error('Failed to load groceries')
            }
        }

        const fetchStores = async () => {
            const result = await storeService.getStores()
            if (result.success) {
                const sortedStores = result.stores.sort((a, b) => ('' + a.name).localeCompare(b.name))

                console.log('loaded stores', sortedStores)
                dispatch({ type: 'setStores', groceries: sortedStores })
            } else {
                console.error('Failed to load stores')
            }
        }

        fetchGroceries()
        fetchStores()
    }, [])

    const updateNameOrDate = async () => {
        if (state.list.isChanged) {
            dispatch({ type: 'resetIsChanged' })
            const updatedList = {
                id: state.list.id,
                name: state.list.name,
                shoppingDate: state.list.shoppingDate.format('YYYY-MM-DD'),
            }
            await listService.updateList(updatedList)
            console.log('Updated list', state.list.name, state.list.shoppingDate)
        }
    }

    const getPageContent = () => {
        switch (state.mode) {
            case 'list':
                return (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Stack spacing={2} sx={{ m: 2 }}>
                            <Typography variant="h2">{title}</Typography>
                            <TextField
                                autoFocus
                                required
                                label="Name"
                                value={state.list.name}
                                variant="standard"
                                onChange={(event) => dispatch({ type: 'updateName', name: event.target.value })}
                                onBlur={(event) => updateNameOrDate()}
                            />
                            <MobileDatePicker
                                label="Shopping Date"
                                inputFormat="MM/DD/YYYY"
                                value={state.list.shoppingDate}
                                onChange={(newValue) =>
                                    dispatch({ type: 'updateShoppingDate', shoppingDate: newValue })
                                }
                                renderInput={(params) => <TextField {...params} variant="standard" />}
                                onAccept={(event) => updateNameOrDate()}
                            />
                            <Paper sx={{ p: 1 }}>
                                <Stack>
                                    <Typography sx={{ m: 1 }}>{state.list.items.length} Items</Typography>
                                    <Button
                                        sx={{ m: 1 }}
                                        color="primary"
                                        variant="contained"
                                        onClick={() => dispatch({ type: 'setMode', mode: 'item' })}
                                    >
                                        Add Item
                                    </Button>
                                </Stack>
                                <List>{/*TODO: render stores as a list with tabs for each available store*/}</List>
                            </Paper>
                            <Button component={Link} to="/" color="secondary" variant="contained">
                                Done
                            </Button>
                        </Stack>
                    </LocalizationProvider>
                )

            case 'item':
                const isEditItem = Number.isInteger(state.itemIndex)
                const item = state.list.items[state.itemIndex]

                if (isEditItem && !item) {
                    console.error('Attempting to modify unknown aisle index', state.aisleIndex)
                    dispatch({ type: 'error', message: 'Ooops! Something bad happened.' })
                    return null
                }

                return (
                    <ModifyListItem
                        dispatch={dispatch}
                        isEdit={isEditItem}
                        groceries={state.groceries}
                        stores={state.stores}
                    />
                )

            default:
                console.error('Unknown page mode', state.mode)
        }
    }

    return (
        <Container maxWidth="sm">
            <Stack>
                <PopUp ref={popup} />
                {getPageContent()}
            </Stack>
        </Container>
    )
}

export default ModifyList
