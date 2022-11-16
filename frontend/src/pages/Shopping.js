import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    Checkbox,
    Container,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
} from '@mui/material'

import listService from '../services/lists'
import listItemService from '../services/listItems'
import storeService from '../services/stores'

const ShoppingPage = () => {
    const [list, setList] = useState(null)
    const [items, setItems] = useState([])
    const [stores, setStores] = useState([])

    const [selectedStoreId, setSelectedStoreId] = useState('')

    const { id } = useParams()
    const idInt = parseInt(id, 10)

    useEffect(() => {
        const fetchList = async (id) => {
            const result = await listService.getListById(id, true)
            if (result.success) {
                console.log('Fetched list', result.list)
                setList(result.list)
                setItems(result.list.items)

                const storePromises = result.list.stores.map((store) => storeService.getStoreById(store.id, true))
                const storeResults = await Promise.all(storePromises)
                if (storeResults.every((result) => result.success)) {
                    const stores = storeResults.map((result) => result.store)
                    console.log('Fetched stores', stores)
                    setStores(stores)
                    if (stores.length > 0) {
                        setSelectedStoreId(stores[0].id)
                    }
                } else {
                    console.error('Failed to fetch stores!')
                }
            } else {
                console.error('Failed to fetch list!')
            }
        }

        fetchList(idInt)
    }, [idInt])

    const handleToggleItem = async (toggledItem) => {
        const updatedItem = {
            ...toggledItem,
            pickedUp: !toggledItem.pickedUp,
        }

        const updatedItems = items.map((item) => (item.id === toggledItem.id ? updatedItem : item))
        setItems(updatedItems)

        const result = await listItemService.updateItem(idInt, { id: updatedItem.id, pickedUp: updatedItem.pickedUp })
        if (!result.success) {
            console.error('Failed to toggle item!', updatedItem)
        } else {
            console.log('Toggled item', updatedItem)
        }
    }

    const getAislesAndItemsForStore = (store) => {
        const unknownAisle = {
            id: -1,
            position: Number.MAX_VALUE,
            name: 'Unknown Aisle',
            sections: [],
            items: [],
        }

        let aislesAndItems = [unknownAisle]

        const itemsInStore = items.filter((item) => item.storeId === selectedStoreId)
        for (const item of itemsInStore) {
            const itemAisle = aislesAndItems.find((aisle) =>
                aisle.sections.some((section) => item.grocerysection === section)
            )
            if (itemAisle) {
                itemAisle.items = itemAisle.items.concat(item)
            } else {
                const storeAisle = store.aisles.find((aisle) =>
                    aisle.sections.some((section) => item.grocerysection === section)
                )

                if (storeAisle) {
                    const newItemAisle = {
                        id: storeAisle.id,
                        position: storeAisle.position,
                        name: storeAisle.name,
                        sections: storeAisle.sections,
                        items: [item],
                    }

                    aislesAndItems = aislesAndItems.concat(newItemAisle)
                } else {
                    unknownAisle.items = unknownAisle.items.concat(item)
                }
            }
        }

        aislesAndItems.sort((a, b) => a.position - b.position)
        return aislesAndItems
    }

    const selectedStore = stores.find((store) => store.id === selectedStoreId)
    const aislesAndItems = selectedStore ? getAislesAndItemsForStore(selectedStore) : []

    console.log('AislesAndItems', aislesAndItems)
    return (
        <Container maxWidth="sm">
            <Typography variant="h1">Shopping</Typography>
            <Typography variant="h2">{list ? list.name : ''}</Typography>
            <Stack direction="row">
                <Select
                    value={selectedStoreId}
                    label="Store"
                    onChange={(e) => {
                        console.log('Selected Store', e.target)
                        setSelectedStoreId(e.target.value)
                    }}
                >
                    {stores.map((store) => (
                        <MenuItem key={store.id} value={store.id}>
                            {store.name}
                        </MenuItem>
                    ))}
                </Select>
            </Stack>
            <Paper>
                <List subheader={<li />}>
                    {aislesAndItems
                        .filter((aisle) => aisle.items.length > 0)
                        .map((aisle) => (
                            <li key={aisle.id}>
                                <ul>
                                    <ListSubheader>{aisle.name}</ListSubheader>
                                    {aisle.items.map((item) => (
                                        <ListItem key={item.id}>
                                            <ListItemButton onClick={() => handleToggleItem(item)}>
                                                <ListItemIcon>
                                                    <Checkbox
                                                        edge="start"
                                                        checked={item.pickedUp}
                                                        tabIndex={-1}
                                                        disableRipple
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={`${item.groceryname} x ${item.amount} ${item.unit}`}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </ul>
                            </li>
                        ))}
                </List>
            </Paper>
        </Container>
    )
}

export default ShoppingPage
