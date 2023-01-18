import { useEffect, useReducer, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Stack } from '@mui/material'
import dayjs from 'dayjs'

import ListAddOrEdit from './ListAddOrEdit'
import PopUp from '../components/PopUp'

import groceryService from '../services/groceries'
import listService from '../services/lists'
import sectionsService from '../services/sections'
import storeService from '../services/stores'

const initialState = {
    groceries: [],
    itemDialogState: {
        isOpen: false,
        existingItemId: null,
        groceryName: '',
        grocerySelection: null,
        amount: 1,
        unit: '',
        note: '',
        section: '',
    },
    list: {
        name: 'Shopping List',
        shoppingDate: dayjs(),
        items: [],
        stores: [],
        isChanged: false, // client only field
    },
    storeTabIndex: 0,
    storeDialogState: {
        isOpen: false,
        pendingRemoveStore: null,
    },
    sections: [],
    stores: [],
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'addItem':
            const itemsWithAdded = state.list.items.concat(action.item)
            return { ...state, list: { ...state.list, items: itemsWithAdded } }

        case 'addStore':
            const storesWithAdded = state.list.stores.concat(action.store)
            return { ...state, list: { ...state.list, stores: storesWithAdded } }

        case 'closeItemDialog':
            return { ...state, itemDialogState: initialState.itemDialogState }

        case 'closeStoreDialog':
            return { ...state, storeDialogState: initialState.storeDialogState }

        case 'deleteItem':
            const itemsWithoutRemoved = state.list.items.filter((item) => item.id !== action.id)
            return { ...state, list: { ...state.list, items: itemsWithoutRemoved } }

        case 'openItemDialog':
            if (action.item) {
                const selectedGrocery = state.groceries.find((grocery) => grocery.id === action.item.groceryId)

                if (!selectedGrocery) {
                    console.error('Trying to edit item but grocery could not be found!')
                    return state
                }

                return {
                    ...state,
                    itemDialogState: {
                        ...initialState.itemDialogState,
                        isOpen: true,
                        existingItemId: action.item.id,
                        groceryName: selectedGrocery.name,
                        grocerySelection: selectedGrocery,
                        amount: action.item.amount,
                        unit: action.item.unit,
                        note: action.item.note,
                    },
                }
            } else {
                return {
                    ...state,
                    itemDialogState: {
                        ...initialState.itemDialogState,
                        isOpen: true,
                    },
                }
            }

        case 'openStoreDialog':
            return {
                ...state,
                storeDialogState: { ...initialState.storeDialogState, isOpen: true, pendingRemoveStore: null },
            }

        case 'removeStore':
            const storesMinusRemoved = state.list.stores.filter((store) => store.id !== action.store.id)
            const itemsMinusStore = state.list.items.filter((item) => item.storeId !== action.store.id)
            return {
                ...state,
                list: { ...state.list, stores: storesMinusRemoved, items: itemsMinusStore },
                storeDialogState: { ...state.storeDialogState, pendingRemoveStore: null },
            }

        case 'resetIsChanged':
            return { ...state, list: { ...state.list, isChanged: false } }

        case 'setGroceries':
            return { ...state, groceries: action.groceries }

        case 'setList':
            return { ...state, list: { ...action.list, isChanged: false } }

        case 'setPendingRemoveStore':
            return { ...state, storeDialogState: { ...state.storeDialogState, pendingRemoveStore: action.store } }

        case 'setStoreTabIndex':
            return { ...state, storeTabIndex: action.index }

        case 'setSections':
            return { ...state, sections: action.sections }

        case 'setStores':
            return { ...state, stores: action.stores }

        case 'updateItem':
            const itemsWithUpdated = state.list.items.map((item) => (item.id === action.item.id ? action.item : item))
            return { ...state, list: { ...state.list, items: itemsWithUpdated } }

        case 'updateItemDialog':
            const updatedItemDialogState = {
                ...state.itemDialogState,
            }

            if (action.groceryName !== undefined) {
                updatedItemDialogState.groceryName = action.groceryName
            }

            if (action.grocerySelection !== undefined) {
                updatedItemDialogState.grocerySelection = action.grocerySelection
            }

            if (action.amount !== undefined) {
                updatedItemDialogState.amount = action.amount
            }

            if (action.unit !== undefined) {
                updatedItemDialogState.unit = action.unit
            }

            if (action.note !== undefined) {
                updatedItemDialogState.note = action.note
            }

            if (action.section !== undefined) {
                updatedItemDialogState.section = action.section
            }

            return { ...state, itemDialogState: updatedItemDialogState }

        case 'updateName':
            const nameChanged = state.list.name !== action.name
            return {
                ...state,
                list: { ...state.list, name: action.name, isChanged: state.list.isChanged || nameChanged },
            }

        case 'updateShoppingDate':
            const shoppingDateChanged = state.list.shoppingDate !== action.shoppingDate
            return {
                ...state,
                list: {
                    ...state.list,
                    shoppingDate: action.shoppingDate,
                    isChanged: state.list.isChanged || shoppingDateChanged,
                },
            }

        default:
            throw new Error(`Unknown action type ${action.type} in ModifyList`)
    }
}

const ListContainer = ({ isEdit }) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const popup = useRef()
    const { id } = useParams()
    const idInt = parseInt(id, 10)

    if (isEdit) {
        if (!id) {
            console.error('Missing id while modifying a list!')
        } else if (!idInt) {
            console.error('Invalid id while modifying a list!')
        }
    }

    useEffect(() => {
        const fetchOrCreateList = async () => {
            if (isEdit) {
                const result = await listService.getListById(id, true)
                if (result.success) {
                    const list = {
                        id: result.list.id,
                        name: result.list.name,
                        shoppingDate: dayjs(result.list.shoppingDate),
                        items: result.list.items,
                        stores: result.list.stores,
                    }
                    console.log('Fetched list', list)
                    dispatch({ type: 'setList', list })

                    // Automatically open store dialog if there are no stores
                    if (!list.stores?.length) {
                        dispatch({ type: 'openStoreDialog' })
                    }
                } else {
                    console.error('Failed to fetch list', result)
                }
            } else {
                const result = await listService.addList({
                    name: state.list.name,
                    shoppingDate: state.list.shoppingDate.format('YYYY-MM-DD'),
                })
                if (result.success) {
                    console.log('Added list', result.list)
                    dispatch({ type: 'setList', list: result.list })

                    // Automatically open store dialog for new lists
                    dispatch({ type: 'openStoreDialog' })
                } else {
                    console.error('Failed to initialize list', result)
                }
            }
        }

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

        const fetchSections = async () => {
            const result = await sectionsService.getAllSections()
            if (result.success) {
                dispatch({ type: 'setSections', sections: result.sections })
            } else {
                console.warn('Failed to load store sections')
            }
        }

        const fetchStores = async () => {
            const result = await storeService.getStores()
            if (result.success) {
                const sortedStores = result.stores.sort((a, b) => ('' + a.name).localeCompare(b.name))

                console.log('loaded stores', sortedStores)
                dispatch({ type: 'setStores', stores: sortedStores })
            } else {
                console.error('Failed to load stores')
            }
        }

        fetchOrCreateList()
        fetchGroceries()
        fetchSections()
        fetchStores()
        // I want this to happen once... but I may be making a mistake by removing this warning
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Container maxWidth="sm">
            <Stack>
                <PopUp ref={popup} />
                <ListAddOrEdit
                    dispatch={dispatch}
                    isEdit={isEdit}
                    list={state.list}
                    storeTabIndex={state.storeTabIndex}
                    stores={state.stores}
                    sections={state.sections}
                    groceries={state.groceries}
                    itemDialogState={state.itemDialogState}
                    storeDialogState={state.storeDialogState}
                />
            </Stack>
        </Container>
    )
}

export default ListContainer
