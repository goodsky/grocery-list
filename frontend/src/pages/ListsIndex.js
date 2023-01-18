import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Button,
    CircularProgress,
    Container,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    Stack,
    Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import dayjs from 'dayjs'

import listService from '../services/lists'
import ConfirmDialog from '../components/ConfirmDialog'
import PopUp from '../components/PopUp'
import { useOutsideAlerter } from '../components/Utils'

const ListsIndex = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [lists, setLists] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [pendingDeleteList, setPendingDeleteList] = useState(null)

    const navigate = useNavigate()
    const popup = useRef()

    const listRef = useRef()
    useOutsideAlerter(listRef, () => setSelectedId(null))

    useEffect(() => {
        const initializeLists = async () => {
            const result = await listService.getLists()
            if (result.success) {
                setLists(result.lists)
            }

            setIsLoading(false)
        }

        initializeLists()
    }, [])

    const deleteList = async (id) => {
        const result = await listService.deleteList(id)
        if (!result.success) {
            popup.current.notify('Failed to delete list.', 'error')
            return
        }

        const updatedLists = lists.filter((list) => list.id !== id)
        setLists(updatedLists)
    }

    const formatSubtitle = (list) => {
        const shoppingDate = dayjs(list.shoppingDate).format('YYYY/MM/DD')
        // TODO: we don't have items or stores in our data at this point
        return shoppingDate
    }

    const content = isLoading ? (
        <Stack alignItems="center">
            <CircularProgress sx={{ m: 3 }} />
        </Stack>
    ) : (
        <List>
            {lists.length === 0 ? (
                <ListItem key={0}>
                    <i>You have no lists! Click Add+ to get started.</i>
                </ListItem>
            ) : (
                lists.map((list) => (
                    <ListItem key={list.id} selected={selectedId === list.id} onClick={() => setSelectedId(list.id)}>
                        <ListItemText primary={list.name} secondary={formatSubtitle(list)} />
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => navigate(`/lists/edit/${list.id}`)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => navigate(`/lists/shop/${list.id}`)}>
                                <ShoppingCartIcon />
                            </IconButton>
                            <IconButton onClick={() => setPendingDeleteList(list)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))
            )}
        </List>
    )

    return (
        <Container maxWidth="sm">
            <Typography variant="h1">Your Lists</Typography>
            <PopUp ref={popup} />
            <div ref={listRef}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Button
                        variant="contained"
                        sx={{ width: 100 }}
                        endIcon={<AddIcon />}
                        component={Link}
                        to="/lists/add"
                    >
                        Add
                    </Button>
                </Stack>
                <Paper>{content}</Paper>
            </div>
            <ConfirmDialog
                title="Confirm"
                prompt={`Are you sure you want to delete list "${pendingDeleteList?.name}"?`}
                isOpen={pendingDeleteList !== null}
                close={() => setPendingDeleteList(null)}
                onConfirm={() => deleteList(pendingDeleteList.id)}
            />
        </Container>
    )
}

export default ListsIndex
