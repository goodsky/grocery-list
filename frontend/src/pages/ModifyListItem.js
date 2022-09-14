import { Button, Stack, Typography } from '@mui/material'

const ModifyListItem = ({ dispatch, isEdit, item }) => {
    const title = isEdit ? 'Modify List Item' : 'Add an Item'
    const buttonVerb = isEdit ? 'Edit' : 'Add'

    const handleSubmit = (event) => {
        event.preventDefault()
    }

    return (
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <Typography variant="h2">{title}</Typography>
            <Button type="submit" color="primary" variant="contained">
                {buttonVerb}
            </Button>
            <Button onClick={() => dispatch({ type: 'clearModifyItem' })} color="secondary" variant="contained">
                Cancel
            </Button>
        </Stack>
    )
}

export default ModifyListItem
