import { useState, useEffect } from 'react'
import useApi from '../../../hooks/useApi'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function Chart() {
    const { apiGet } = useApi()
    const [watchlist, setWatchlist] = useState()

    useEffect(() => {

    })

    useEffect(() => {
        var payload = {}

        apiGet(`v1/watchlist`, payload).then( response => {
            if(response.data){
                setWatchlist(response.data)
            }
            else{
                console.log(response)
                //Handle errors
            }
        })
    }, [])

    function handleOnDragEnd(event) {
        if(!event.destination) return
        const items = Array.from(watchlist)
        const [reorderedItem] = items.splice(event.source.index, 1)
        items.splice(event.destination.index, 0, reorderedItem)

        setWatchlist(items)
    }

    return (
        <div className="bg-white">
            {watchlist && <>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="stocks">
                        {(provided) =>(
                            <ul {...provided.droppableProps} ref={provided.innerRef} className='max-w-md border border-black'>
                                {watchlist.map((stock, index) => 
                                    <Draggable className="bg-black" key={stock.stock_id} draggableId={stock.stock_id} index={index}>
                                        {(provided) => (
                                            <li 
                                            {...provided.draggableProps} 
                                            {...provided.dragHandleProps}
                                            ref={provided.innerRef}
                                            className={`list-none px-3 py-2 border-t border-black ${index === 0 ? "border-none" : ""}`}
                                            >
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