import { useState, useEffect } from 'react'
import useApi from '../../../hooks/useApi'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function Chart() {
    const { apiGet, apiPut } = useApi()
    const [watchlist, setWatchlist] = useState()

    useEffect(() => {
        apiGet(`v1/watchlist/3468aa7c-75d2-4c74-a907-94e8a49d518e`, {}).then( response => {
            if(response.data){
                setWatchlist(response.data)
            }
            else{
                console.log(response)
                //Handle errors
            }
        })
    }, [])

    function saveWatchlistReorder(event){
        let params = {
            "stock_id": event.draggableId,
            "current_index": event.source.index,
            "destination_index": event.destination.index,
            "watchlist_id": event.source.droppableId
        }

        apiPut('v1/watchlist/stock', params).then( response => {
            if(response.data){
                // setWatchlist(response.data)
            }
            else{
                console.log(response)
                //Handle errors
            }
        })
    }

    function handleOnDragEnd(event) {

        if(!event.destination) return
        if(event.destination.index === event.source.index) return

        const items = Array.from(watchlist)
        const [reorderedItem] = items.splice(event.source.index, 1)
        items.splice(event.destination.index, 0, reorderedItem)

        setWatchlist(items)
        saveWatchlistReorder(event)

    }

    function handleStockClicked(event){
        event.preventDefault();
        console.log(event.currentTarget.id)
    }

    return (
        <div className="bg-white">
            {watchlist && <>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="3468aa7c-75d2-4c74-a907-94e8a49d518e"
                    renderClone={(provided, snapshot, rubric) => (
                        <li 
                        {...provided.draggableProps} 
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        className = "list-none p-1">
                            <div className='p-1 hover:bg-secondary hover:cursor-pointer border rounded-lg border-black'>
                                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-md text-black truncate">
                                            {watchlist[rubric["source"]["index"]].ticker_symbol.toUpperCase()}
                                        </p>
                                        <p className="text-sm text-black truncate">
                                            {watchlist[rubric["source"]["index"]].company}
                                        </p>
                                    </div>
                                    <div className="inline-flex items-center text-base font-semibold text-black">
                                        $320
                                    </div>
                                </div>
                            </div>
                        </li>
                        )}>
                        {(provided) =>(
                            <ul {...provided.droppableProps} ref={provided.innerRef} className='max-w-md'>
                                {watchlist.map((stock, index) => 
                                    <Draggable className="bg-black" key={stock.stock_id} draggableId={stock.stock_id} index={index}>
                                        {(provided) => (
                                            <li 
                                            id = {stock.ticker_symbol}
                                            {...provided.draggableProps} 
                                            {...provided.dragHandleProps}
                                            ref={provided.innerRef}
                                            className="list-none p-1"
                                            onClick={(event) => {handleStockClicked(event)}}>
                                                <div className='p-1 hover:bg-secondary hover:cursor-pointer border rounded-lg border-black'>
                                                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                                        {/* <div className="flex-shrink-0">
                                                            <img className="w-8 h-8 rounded-full" src="/docs/images/people/profile-picture-1.jpg" alt="Neil image">
                                                        </div> */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-md text-black truncate">
                                                                {stock.ticker_symbol.toUpperCase()}
                                                            </p>
                                                            <p className="text-sm text-black truncate">
                                                                {stock.company}
                                                            </p>
                                                        </div>
                                                        <div className="inline-flex items-center text-base font-semibold text-black">
                                                            $320
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        )}
                                    </Draggable>
                                )}
                            {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>
            </>}
        </div>
    );
}