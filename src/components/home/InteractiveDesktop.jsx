import React, { useState, useEffect, useRef } from 'react'
import BinPackingLayout from '../shared/binpacking/BinPackingLayout'
import WindowMenu from '../shared/binpacking/WindowMenu'

const InteractiveDesktop = () => {
    const apiRef = useRef(null);
    const [windows, setWindows] = useState(() => [
        {
            id: 'win1',
            title: 'Bin Packing Window 1',
            color: '#3b82f6',
            x: 0,
            y: 0,
            width: 8,
            height: 6,
            minWidth: 5,
            minHeight: 4,
            content: <div className="font-gothic font-medium text-md p-2 mb-10 text-neutral-500">Hello World</div>
        },
        {
            id: 'win2',
            title: 'Bin Packing Window 2',
            color: '#22c55e',
            x: 10,
            y: 0,
            width: 6,
            height: 4,
            minWidth: 5,
            minHeight: 4
        },
        {
            id: 'win3',
            title: 'Bin Packing Edge Test',
            color: '#ef4444',
            x: 0,
            y: 8,
            width: 5,
            height: 4,
            minWidth: 5,
            minHeight: 4
        }
    ]);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="p-2 border-b border-neutral-200 bg-white/70 backdrop-blur">
                <WindowMenu />
            </div>
            <div className="flex-1">
                <BinPackingLayout
                    ref={apiRef}
                    cellSize={20}
                    minGridWidth={4}
                    minGridHeight={3}
                    windows={windows}
                    onWindowsChange={setWindows}
                />
            </div>
            <div className="text-sm text-gray-600 font-gothic font-xl px-2 rounded m-2 text-center">
                Bin Packing Layout - Drag windows, they'll pack efficiently without overlaps
            </div>
        </div>
    );
};

export default InteractiveDesktop;