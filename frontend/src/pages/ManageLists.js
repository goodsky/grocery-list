import { useEffect, useState } from 'react'
import { CircularProgress, List, ListItem, ListItemText, Paper, Typography } from '@mui/material'

import listService from '../services/lists'

const ManageLists = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [lists, setLists] = useState([])

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

    const content = isLoading ? (
        <CircularProgress />
    ) : (
        <List>
            {lists.map((list) => (
                <ListItem key={list.id}>
                    <ListItemText>{list.name}</ListItemText>
                </ListItem>
            ))}
        </List>
    )

    return (
        <>
            <Typography variant="h1">Your Lists</Typography>
            <Paper>{content}</Paper>
        </>
    )
}

export default ManageLists
