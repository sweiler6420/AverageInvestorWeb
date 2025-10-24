import React, { useState, useEffect, useRef } from 'react'
import BinPackingLayout from '../shared/binpacking/BinPackingLayout'
import WindowMenu from '../shared/binpacking/WindowMenu'
import CounterWidget from '../shared/widgets/CounterWidget'
import TextInputWidget from '../shared/widgets/TextInputWidget'
import StaticInfoWidget from '../shared/widgets/StaticInfoWidget'

const InteractiveDesktop = () => {
    const apiRef = useRef(null);
    const menuItems = [
        {
            name: 'Blue',
            color: '#3b82f6',
            window: {
                title: 'Bin Packing Window (Blue)',
                color: '#3b82f6',
                width: 10,
                height: 8,
                minWidth: 5,
                minHeight: 4,
                content: <CounterWidget />
            }
        },
        {
            name: 'Green',
            color: '#22c55e',
            window: {
                title: 'Bin Packing Window (Green)',
                color: '#22c55e',
                width: 10,
                height: 8,
                minWidth: 5,
                minHeight: 4,
                content: <TextInputWidget />
            }
        },
        {
            name: 'Red',
            color: '#ef4444',
            window: {
                title: 'Bin Packing Window (Red)',
                color: '#ef4444',
                width: 10,
                height: 8,
                minWidth: 5,
                minHeight: 4,
                content: <StaticInfoWidget />
            }
        }
    ];
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
            <div className="rounded-lg p-2 border border-neutral-500 bg-white/50 backdrop-blur">
                <WindowMenu items={menuItems} />
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
            <div className="font-gothic font-medium text-sm font-neutral-500 px-2 rounded m-2 text-center">
                Bin Packing Layout - Drag windows, they'll pack efficiently without overlaps
            </div>
        </div>
    );
};

export default InteractiveDesktop;