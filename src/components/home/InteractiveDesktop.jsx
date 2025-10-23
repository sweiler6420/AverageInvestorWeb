import React, { useState, useEffect } from 'react'
import BinPackingLayout from '../shared/BinPackingLayout'

const InteractiveDesktop = () => {
    const [binPackingApi, setBinPackingApi] = useState(null);

    // Initialize with 3 demo windows for testing
    useEffect(() => {
        if (binPackingApi) {
            // Add first demo window
            binPackingApi.addWindow({
                title: 'Bin Packing Window 1',
                color: 'bg-blue-500',
                gridX: 0,
                gridY: 0,
                gridWidth: 8,
                gridHeight: 6
            });
            
            // Add second demo window for collision testing
            binPackingApi.addWindow({
                title: 'Bin Packing Window 2',
                color: 'bg-green-500',
                gridX: 10,
                gridY: 0,
                gridWidth: 6,
                gridHeight: 4
            });
            
            // Add third demo window for edge testing
            binPackingApi.addWindow({
                title: 'Bin Packing Edge Test',
                color: 'bg-red-500',
                gridX: 0,
                gridY: 8,
                gridWidth: 5,
                gridHeight: 3
            });
        }
    }, [binPackingApi]);

    return (
        <div className="w-full h-full">
            <BinPackingLayout
                cellSize={20}
                minWindowWidth={4}
                minWindowHeight={3}
                maxWindowWidth={20}
                maxWindowHeight={15}
            >
                {(api) => {
                    if (!binPackingApi) setBinPackingApi(api);
                    return null;
                }}
            </BinPackingLayout>
            
            {/* Instructions */}
            <div className="absolute bottom-2 left-2 text-xs text-gray-600 font-gothic bg-white/80 px-2 py-1 rounded">
                Bin Packing Layout - Drag windows, they'll pack efficiently without overlaps
            </div>
        </div>
    );
};

export default InteractiveDesktop;