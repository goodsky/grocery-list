import { List, ListItem } from '@mui/material'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

const DraggableList = ({ items, itemToKey, itemToElement, onDragEnd }) => {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="aisles">
                {(provided) => (
                    <List ref={provided.innerRef} sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {items.map((item, index) => (
                            <DraggableListItem
                                item={item}
                                index={index}
                                itemToKey={itemToKey}
                                itemToElement={itemToElement}
                                key={itemToKey(item)}
                            />
                        ))}
                        {provided.placeholder}
                    </List>
                )}
            </Droppable>
        </DragDropContext>
    )
}

const DraggableListItem = ({ item, index, itemToKey, itemToElement }) => {
    const getStyle = (isDragging, draggableStyle) => ({
        ...draggableStyle,
        ...(isDragging && {
            background: 'rgb(235,235,235)',
        }),
    })

    return (
        <Draggable draggableId={itemToKey(item)} index={index}>
            {(provided, snapshot) => (
                <ListItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getStyle(snapshot.isDragging, provided.draggableProps.style)}
                >
                    {itemToElement(item, index)}
                </ListItem>
            )}
        </Draggable>
    )
}

export default DraggableList
