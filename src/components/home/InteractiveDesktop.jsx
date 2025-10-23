import React, { useState, useEffect, useRef, Children } from 'react'
import BinPackingLayout from '../shared/BinPackingLayout'

const InteractiveDesktop = () => {
    const binPackingApiRef = useRef(null);
    const [windowsAdded, setWindowsAdded] = useState(false);
    const [apiReady, setApiReady] = useState(false);

    // Initialize with 3 demo windows for testing
    useEffect(() => {
        const api = binPackingApiRef.current;
        console.log('InteractiveDesktop useEffect triggered:', {
            binPackingApi: !!api,
            gridCols: api?.gridCols,
            gridRows: api?.gridRows,
            isGridInitialized: api?.isGridInitialized,
            windowsAdded,
            apiReady
        });
        
        if (api && api.isGridInitialized && !windowsAdded) {
            console.log('Grid is initialized, adding windows:', {
                gridCols: api.gridCols,
                gridRows: api.gridRows
            });
                // Add first demo window
                api.addWindow({
                    title: 'Bin Packing Window 1',
                    color: 'bg-blue-500',
                    gridX: 0,
                    gridY: 0,
                    gridWidth: 8,
                    gridHeight: 6,
                    children: <div className="font-gothic font-medium text-md p-2 mb-10 text-neutral-500">Hello World</div>
                });
                
                // Add second demo window for collision testing
                api.addWindow({
                    title: 'Bin Packing Window 2',
                    color: 'bg-green-500',
                    gridX: 10,
                    gridY: 0,
                    gridWidth: 6,
                    gridHeight: 4
                });
                
            // Add third demo window for edge testing
            api.addWindow({
                title: 'Bin Packing Edge Test',
                color: 'bg-red-500',
                gridX: 0,
                gridY: 8,
                gridWidth: 5,
                gridHeight: 3
            });
            
            setWindowsAdded(true);
        }
    }, [windowsAdded, apiReady]);

    return (
        <div className="w-full h-full">
            <BinPackingLayout
                cellSize={20}
                minWindowWidth={4}
                minWindowHeight={3}
            >
                {(api) => {
                    // Store the API in ref to avoid infinite loops
                    binPackingApiRef.current = api;
                    // Trigger re-check when API is updated
                    if (api && api.isGridInitialized && !apiReady) {
                        setApiReady(true);
                    }
                    return null;
                }}
            </BinPackingLayout>
            
            {/* Instructions */}
            <div className="absolute bottom-2 left-2 text-sm text-gray-600 font-gothic font-xl bg-white/80 px-2 py-1 rounded">
                Bin Packing Layout - Drag windows, they'll pack efficiently without overlaps
            </div>
        </div>
    );
};

export default InteractiveDesktop;