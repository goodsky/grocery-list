import { useReducer, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Container, List, Paper, Stack, TextField, Typography } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import dayjs from 'dayjs'

import ModifyListItem from './ModifyListItem'
import PopUp from '../components/PopUp'

const initialState = {
    list: {
        name: 'Shopping List',
        shoppingDate: dayjs(),
        items: [],
    },
    item: null,
    itemIndex: null,
}

const initialItem = {
    storeId: null,
    groceryId: null,
    amount: 1,
    unit: null,
    note: null,
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'updateName':
            return { ...state, list: { ...state.list, name: action.name } }

        case 'updateShoppingDate':
            return { ...state, list: { ...state.list, shoppingDate: action.date } }

        case 'initModifyItem':
            return { ...state, item: { ...initialItem } }

        case 'clearModifyItem':
            return { ...state, item: null }

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
    const buttonVerb = isEdit ? 'Edit' : 'Add'

    const handleSubmit = (event) => {
        event.preventDefault()

        const dayJsDate = state.list.shoppingDate
        const shoppingDate = dayJsDate ? new Date(dayJsDate.year(), dayJsDate.month(), dayJsDate.date()) : null

        const list = {
            name: state.list.name,
            shoppingDate,
        }

        console.log('Submit List', list)
    }

    const getPageContent = () => {
        if (!state.item) {
            return (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Stack component="form" onSubmit={handleSubmit} spacing={2} sx={{ m: 2 }}>
                        <Typography variant="h2">{title}</Typography>
                        <TextField
                            autoFocus
                            required
                            label="Name"
                            value={state.list.name}
                            variant="standard"
                            onChange={(event) => dispatch({ type: 'updateName', name: event.target.value })}
                        />
                        <MobileDatePicker
                            label="Shopping Date"
                            inputFormat="MM/DD/YYYY"
                            value={state.list.date}
                            onChange={(newValue) => dispatch({ type: 'updateShoppingDate', date: newValue })}
                            renderInput={(params) => <TextField {...params} variant="standard" />}
                        />
                        <Paper sx={{ p: 1 }}>
                            <Stack>
                                <Typography sx={{ m: 1 }}>{state.list.items.length} Items</Typography>
                                <Button
                                    sx={{ m: 1 }}
                                    color="primary"
                                    variant="contained"
                                    onClick={() => dispatch({ type: 'initModifyItem' })}
                                >
                                    Add Item
                                </Button>
                            </Stack>
                            <List></List>
                        </Paper>

                        <Button type="submit" color="primary" variant="contained">
                            {buttonVerb}
                        </Button>
                        <Button component={Link} to="/" color="secondary" variant="contained">
                            Cancel
                        </Button>
                    </Stack>
                </LocalizationProvider>
            )
        } else {
            const isEditItem = Number.isInteger(state.itemIndex)
            const item = state.list.items[state.itemIndex]

            if (isEditItem && !item) {
                console.error('Attempting to modify unknown aisle index', state.aisleIndex)
                dispatch({ type: 'error', message: 'Ooops! Something bad happened.' })
                return null
            }

            return <ModifyListItem dispatch={dispatch} isEdit={isEditItem} />
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
