import React, { useState, useEffect } from 'react'
import GridLayout from '../shared/GridLayout'

const InteractiveDesktop = () => {
    const [gridApi, setGridApi] = useState(null);

    // Initialize with demo windows
    useEffect(() => {
        if (gridApi) {
            // Add demo windows
            gridApi.addWindow({
                title: 'AAPL Chart',
                color: 'bg-blue-500',
                gridX: 1,
                gridY: 2,
                gridWidth: 8,
                gridHeight: 6
            });

            gridApi.addWindow({
                title: 'TSLA Data',
                color: 'bg-green-500',
                gridX: 10,
                gridY: 3,
                gridWidth: 8,
                gridHeight: 5
            });

            gridApi.addWindow({
                title: 'Portfolio',
                color: 'bg-purple-500',
                gridX: 4,
                gridY: 9,
                gridWidth: 8,
                gridHeight: 5
            });

            gridApi.addWindow({
                title: 'News',
                color: 'bg-orange-500',
                gridX: 13,
                gridY: 9,
                gridWidth: 6,
                gridHeight: 5
            });
        }
    }, [gridApi]);

    return (
        <div className="w-full h-full">
            <GridLayout
                gridSize={20}
                minWindowWidth={4}
                minWindowHeight={3}
                maxWindowWidth={20}
                maxWindowHeight={15}
                gap={4}
            >
                {(api) => {
                    if (!gridApi) setGridApi(api);
                    return null;
                }}
            </GridLayout>
            
            {/* Instructions */}
            <div className="absolute bottom-2 left-2 text-xs text-gray-600 font-gothic bg-white/80 px-2 py-1 rounded">
                Drag windows - they'll snap to grid and never overlap
            </div>
        </div>
    );
};

export default InteractiveDesktop;