import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'

const ConfirmDialog = (props) => {
    const { isOpen, close, onConfirm, title, prompt } = props

    const handleConfirm = () => {
        handleClose()
        onConfirm()
    }

    const handleClose = () => {
        close()
    }

    return (
        <Dialog open={isOpen} onClose={handleClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{prompt}</DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary" autoFocus>
                    No
                </Button>
                <Button onClick={handleConfirm}>Yes</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmDialog
