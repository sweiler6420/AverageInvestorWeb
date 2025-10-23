import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
    XMarkIcon, 
    MinusIcon, 
    ArrowsPointingOutIcon,
    ChevronDoubleRightIcon 
} from '@heroicons/react/24/outline'

// Window component (reused from original)
const Window = ({ 
    id, 
    title, 
    color, 
    children, 
    isMinimized, 
    isMaximized, 
    onMinimize, 
    onMaximize, 
    onClose,
    onDragStart,
    onResizeStart,
    style,
    className = "",
    ...props
}) => {
    const handleMouseDown = (e) => {
        // Check if clicking directly on buttons or resize handle (not the title)
        const isButtonClick = e.target.tagName === 'BUTTON' || 
            e.target.classList.contains('resize-handle') ||
            e.target.closest('.resize-handle');
            
        if (isButtonClick) {
            return; // Don't drag if clicking buttons or resize handle
        }
        
        onDragStart(e, id);
    };

    return (
        <div
            className={`absolute ${color} rounded-lg shadow-lg border border-white/20 cursor-move select-none ${className}`}
            style={style}
            onMouseDown={handleMouseDown}
            {...props}
        >
            {/* Window header */}
            <div className="bg-black/20 text-white text-sm px-3 py-2 rounded-t-lg flex justify-between items-center window-controls">
                <span className="font-gothic font-medium truncate">{title}</span>
                <div className="flex space-x-1">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onMinimize(id);
                        }}
                        className="w-3 h-3 bg-yellow-400 rounded-full hover:bg-yellow-300 transition-colors"
                        title="Minimize"
                    />
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onMaximize(id);
                        }}
                        className="w-3 h-3 bg-green-400 rounded-full hover:bg-green-300 transition-colors"
                        title="Maximize"
                    />
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose(id);
                        }}
                        className="w-3 h-3 bg-red-400 rounded-full hover:bg-red-300 transition-colors"
                        title="Close"
                    />
                </div>
            </div>
            
            {/* Window content */}
            {!isMinimized && (
                <div className="p-2 text-white text-xs flex flex-col overflow-hidden h-full" style={{ height: 'calc(100% - 40px)' }}>
                    <div className="bg-white/10 rounded p-1 mb-1 flex-1 min-h-0 w-full">
                        {children || (
                            <>
                                <div className="h-1 bg-white/30 rounded mb-1 w-full"></div>
                                <div className="h-1 bg-white/20 rounded mb-1 w-full"></div>
                                <div className="h-1 bg-white/15 rounded w-full"></div>
                            </>
                        )}
                    </div>
                </div>
            )}
            
            {/* Resize handle */}
            <div 
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-60 hover:opacity-100 transition-opacity duration-200 resize-handle"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onResizeStart(e, id);
                }}
            >
                <ChevronDoubleRightIcon className="w-full h-full text-white transform rotate-45" />
            </div>
        </div>
    );
};

// Bin Packing Layout Component
const BinPackingLayout = ({ 
    children, 
    className = "",
    cellSize = 20,
    minWindowWidth = 4,
    minWindowHeight = 3,
    maxWindowWidth = 20,
    maxWindowHeight = 15
}) => {
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [windows, setWindows] = useState([]);
    const [draggedWindow, setDraggedWindow] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const finalDragPositionRef = useRef({ gridX: 0, gridY: 0 });
    const [resizingWindow, setResizingWindow] = useState(null);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Calculate grid dimensions
    const gridCols = Math.floor(containerSize.width / cellSize);
    const gridRows = Math.floor(containerSize.height / cellSize);

    // Update container size
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize({ width: rect.width, height: rect.height });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Convert grid coordinates to pixel coordinates
    const gridToPixel = useCallback((gridX, gridY, gridWidth, gridHeight) => {
        return {
            x: gridX * cellSize,
            y: gridY * cellSize,
            width: gridWidth * cellSize,
            height: gridHeight * cellSize
        };
    }, [cellSize]);

    // Convert pixel coordinates to grid coordinates
    const pixelToGrid = useCallback((pixelX, pixelY) => {
        return {
            gridX: Math.floor(pixelX / cellSize),
            gridY: Math.floor(pixelY / cellSize)
        };
    }, [cellSize]);

    // AABB Collision Detection
    const checkCollision = useCallback((gridX, gridY, gridWidth, gridHeight, excludeWindowId = null) => {
        // Check bounds
        if (gridX < 0 || gridY < 0 || 
            gridX + gridWidth > gridCols || 
            gridY + gridHeight > gridRows) {
            return true; // Out of bounds
        }

        // Check collision with other windows
        return windows.some(window => {
            if (window.id === excludeWindowId) return false;
            
            // AABB collision detection
            return !(gridX >= window.gridX + window.gridWidth ||
                    gridX + gridWidth <= window.gridX ||
                    gridY >= window.gridY + window.gridHeight ||
                    gridY + gridHeight <= window.gridY);
        });
    }, [windows, gridCols, gridRows]);

    // Bin Packing Algorithm - Find best position
    const findBestPosition = useCallback((windowId, pixelX, pixelY, gridWidth, gridHeight) => {
        console.log(`findBestPosition called for ${windowId}:`);
        console.log(`  Input: pixel(${pixelX}, ${pixelY}) size(${gridWidth}x${gridHeight})`);
        console.log(`  Grid bounds: ${gridCols}x${gridRows}`);

        // Snap to grid
        const { gridX: targetX, gridY: targetY } = pixelToGrid(pixelX, pixelY);
        console.log(`  Converted to grid: (${targetX}, ${targetY})`);
        
        // Clamp to valid bounds
        const clampedX = Math.max(0, Math.min(targetX, gridCols - gridWidth));
        const clampedY = Math.max(0, Math.min(targetY, gridRows - gridHeight));
        console.log(`  Clamped to: (${clampedX}, ${clampedY})`);
        
        // Check if this position is valid
        const hasCollision = checkCollision(clampedX, clampedY, gridWidth, gridHeight, windowId);
        console.log(`  Clamped position collision check: ${hasCollision}`);
        
        if (!hasCollision) {
            console.log(`  Returning clamped position: (${clampedX}, ${clampedY})`);
            return { gridX: clampedX, gridY: clampedY };
        }
        
        console.log(`  Searching for alternative position...`);
        
        // Bin packing: Find nearest valid position using spiral search
        for (let radius = 1; radius <= 10; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const testX = clampedX + dx;
                        const testY = clampedY + dy;
                        
                        if (!checkCollision(testX, testY, gridWidth, gridHeight, windowId)) {
                            console.log(`  Found alternative position: (${testX}, ${testY})`);
                            return { gridX: testX, gridY: testY };
                        }
                    }
                }
            }
        }
        
        console.log(`  No alternative found, returning clamped position: (${clampedX}, ${clampedY})`);
        // Fallback to original position
        return { gridX: clampedX, gridY: clampedY };
    }, [pixelToGrid, checkCollision, gridCols, gridRows]);

    // Add window with bin packing placement
    const addWindow = useCallback((windowConfig) => {
        console.log(`=== ADDING WINDOW: ${windowConfig.title} ===`);
        console.log(`Requested position: grid(${windowConfig.gridX || 0}, ${windowConfig.gridY || 0})`);
        console.log(`Grid dimensions: ${gridCols}x${gridRows}`);
        console.log(`Current windows count: ${windows.length}`);
        
        const newWindow = {
            id: `window_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: windowConfig.title || 'New Window',
            color: windowConfig.color || 'bg-blue-500',
            gridX: windowConfig.gridX || 0,
            gridY: windowConfig.gridY || 0,
            gridWidth: Math.max(windowConfig.gridWidth || minWindowWidth, minWindowWidth),
            gridHeight: Math.max(windowConfig.gridHeight || minWindowHeight, minWindowHeight),
            isMinimized: false,
            isMaximized: false,
            children: windowConfig.children || null
        };

        console.log(`Window config: grid(${newWindow.gridX}, ${newWindow.gridY}) size(${newWindow.gridWidth}x${newWindow.gridHeight})`);

        // Use findBestPosition to get the optimal placement
        const { x: pixelX, y: pixelY } = gridToPixel(newWindow.gridX, newWindow.gridY, newWindow.gridWidth, newWindow.gridHeight);
        console.log(`Converted to pixel: (${pixelX}, ${pixelY})`);
        
        const { gridX: finalGridX, gridY: finalGridY } = findBestPosition(
            newWindow.id,
            pixelX,
            pixelY,
            newWindow.gridWidth,
            newWindow.gridHeight
        );
        
        console.log(`findBestPosition returned: grid(${finalGridX}, ${finalGridY})`);

        // Update the window with the final position
        newWindow.gridX = finalGridX;
        newWindow.gridY = finalGridY;

        console.log(`Final window position: grid(${newWindow.gridX}, ${newWindow.gridY})`);

        // Add to state
        setWindows(prev => {
            console.log(`Adding window to state. Previous count: ${prev.length}`);
            return [...prev, newWindow];
        });

        // Set position directly in DOM after a brief delay to ensure the element exists
        setTimeout(() => {
            const windowElement = document.querySelector(`[data-window-id="${newWindow.id}"]`);
            if (windowElement) {
                const { x: finalPixelX, y: finalPixelY } = gridToPixel(finalGridX, finalGridY, newWindow.gridWidth, newWindow.gridHeight);
                console.log(`Setting DOM position: pixel(${finalPixelX}, ${finalPixelY})`);
                windowElement.style.left = `${finalPixelX}px`;
                windowElement.style.top = `${finalPixelY}px`;
            } else {
                console.log(`Window element not found for ID: ${newWindow.id}`);
            }
        }, 0);

        return newWindow.id;
    }, [findBestPosition, gridToPixel, minWindowWidth, minWindowHeight, gridCols, gridRows, windows.length]);

    // Remove window
    const removeWindow = useCallback((windowId) => {
        setWindows(prev => prev.filter(w => w.id !== windowId));
    }, []);

    // Minimize window
    const minimizeWindow = useCallback((windowId) => {
        setWindows(prev => prev.map(w => 
            w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
        ));
    }, []);

    // Maximize window
    const maximizeWindow = useCallback((windowId) => {
        setWindows(prev => prev.map(w => 
            w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
        ));
    }, []);

    // Drag handlers
    const handleDragStart = useCallback((e, windowId) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setDraggedWindow(windowId);
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        // Reset final drag position
        finalDragPositionRef.current = { gridX: 0, gridY: 0 };
    }, []);

    const handleResizeStart = useCallback((e, windowId) => {
        e.preventDefault();
        e.stopPropagation();
        const windowElement = document.querySelector(`[data-window-id="${windowId}"]`);
        if (windowElement) {
            const rect = windowElement.getBoundingClientRect();
            setResizingWindow(windowId);
            setResizeStart({
                x: e.clientX,
                y: e.clientY,
                width: rect.width,
                height: rect.height
            });
        }
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!containerRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        
        if (draggedWindow) {
            // Calculate pixel position relative to container
            const pixelX = e.clientX - containerRect.left - dragOffset.x;
            const pixelY = e.clientY - containerRect.top - dragOffset.y;
            
            const window = windows.find(w => w.id === draggedWindow);
            
            // Use bin packing algorithm to find best position
            const { gridX, gridY } = findBestPosition(
                draggedWindow, 
                pixelX, 
                pixelY, 
                window.gridWidth, 
                window.gridHeight
            );
            
            // Store the final calculated position for use in handleMouseUp
            finalDragPositionRef.current = { gridX, gridY };
            
            const { x, y } = gridToPixel(gridX, gridY, window.gridWidth, window.gridHeight);
            
            const windowElement = document.querySelector(`[data-window-id="${draggedWindow}"]`);
            if (windowElement) {
                windowElement.style.left = `${x}px`;
                windowElement.style.top = `${y}px`;
                windowElement.style.zIndex = '10';
            }
        } else if (resizingWindow) {
            const deltaX = e.clientX - resizeStart.x;
            const deltaY = e.clientY - resizeStart.y;
            
            const newWidth = Math.max(resizeStart.width + deltaX, minWindowWidth * cellSize);
            const newHeight = Math.max(resizeStart.height + deltaY, minWindowHeight * cellSize);
            
            // Snap to grid boundaries
            const snappedWidth = Math.round(newWidth / cellSize) * cellSize;
            const snappedHeight = Math.round(newHeight / cellSize) * cellSize;
            
            // Ensure minimum size
            const finalWidth = Math.max(snappedWidth, minWindowWidth * cellSize);
            const finalHeight = Math.max(snappedHeight, minWindowHeight * cellSize);
            
            const windowElement = document.querySelector(`[data-window-id="${resizingWindow}"]`);
            if (windowElement) {
                // Convert to grid dimensions for collision checking
                const gridWidth = Math.round(finalWidth / cellSize);
                const gridHeight = Math.round(finalHeight / cellSize);
                const currentWindow = windows.find(w => w.id === resizingWindow);
                
                // Only allow resize if it doesn't create collision
                if (!checkCollision(currentWindow.gridX, currentWindow.gridY, gridWidth, gridHeight, resizingWindow)) {
                    windowElement.style.width = `${finalWidth}px`;
                    windowElement.style.height = `${finalHeight}px`;
                    windowElement.style.zIndex = '10';
                }
            }
        }
    }, [draggedWindow, resizingWindow, dragOffset, resizeStart, windows, findBestPosition, gridToPixel, pixelToGrid, checkCollision, minWindowWidth, minWindowHeight, cellSize]);

    const handleMouseUp = useCallback(() => {
        if (draggedWindow) {
            const windowElement = document.querySelector(`[data-window-id="${draggedWindow}"]`);
            if (windowElement) {
                // Capture the final position values before state update
                const finalX = finalDragPositionRef.current.gridX;
                const finalY = finalDragPositionRef.current.gridY;
                
                // Calculate the final pixel position
                const currentWindow = windows.find(w => w.id === draggedWindow);
                const { x: finalPixelX, y: finalPixelY } = gridToPixel(finalX, finalY, currentWindow.gridWidth, currentWindow.gridHeight);
                
                // Set the final position directly in the DOM
                windowElement.style.left = `${finalPixelX}px`;
                windowElement.style.top = `${finalPixelY}px`;
                windowElement.style.zIndex = '';
                
                // Update state to match
                setWindows(prev => {
                    const updated = prev.map(w => 
                        w.id === draggedWindow 
                            ? { ...w, gridX: finalX, gridY: finalY }
                            : w
                    );
                    return updated;
                });
            }
        } else if (resizingWindow) {
            const windowElement = document.querySelector(`[data-window-id="${resizingWindow}"]`);
            if (windowElement) {
                const rect = windowElement.getBoundingClientRect();
                
                // Convert pixel dimensions to grid dimensions
                const gridWidth = Math.round(rect.width / cellSize);
                const gridHeight = Math.round(rect.height / cellSize);
                
                // Ensure minimum size
                const finalGridWidth = Math.max(gridWidth, minWindowWidth);
                const finalGridHeight = Math.max(gridHeight, minWindowHeight);
                
                // Calculate final pixel dimensions
                const finalWidth = finalGridWidth * cellSize;
                const finalHeight = finalGridHeight * cellSize;
                
                // Set the final size directly in the DOM
                windowElement.style.width = `${finalWidth}px`;
                windowElement.style.height = `${finalHeight}px`;
                windowElement.style.zIndex = '';
                
                // Update state to match
                setWindows(prev => prev.map(w => 
                    w.id === resizingWindow 
                        ? { ...w, gridWidth: finalGridWidth, gridHeight: finalGridHeight }
                        : w
                ));
            }
        }
        
        setDraggedWindow(null);
        setDragOffset({ x: 0, y: 0 });
        finalDragPositionRef.current = { gridX: 0, gridY: 0 };
        setResizingWindow(null);
        setResizeStart({ x: 0, y: 0, width: 0, height: 0 });
    }, [draggedWindow, resizingWindow, windows, pixelToGrid, gridToPixel]);

    // Event listeners
    useEffect(() => {
        if (draggedWindow || resizingWindow) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggedWindow, resizingWindow, handleMouseMove, handleMouseUp]);

    // Expose methods to parent
    useEffect(() => {
        if (children && typeof children === 'function') {
            children({
                addWindow,
                removeWindow,
                minimizeWindow,
                maximizeWindow,
                windows
            });
        }
    }, [children, addWindow, removeWindow, minimizeWindow, maximizeWindow, windows]);

    return (
        <div ref={containerRef} className={`bin-packing-layout w-full h-full relative ${className}`}>
            {/* Grid background */}
            {containerSize.width > 0 && containerSize.height > 0 && (
                <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%">
                        {/* Vertical grid lines */}
                        {Array.from({ length: gridCols + 1 }).map((_, i) => (
                            <line key={`v-${i}`} x1={i * cellSize} y1={0} x2={i * cellSize} y2={containerSize.height} stroke="#ccc" strokeWidth="1" />
                        ))}
                        {/* Horizontal grid lines */}
                        {Array.from({ length: gridRows + 1 }).map((_, i) => (
                            <line key={`h-${i}`} x1={0} y1={i * cellSize} x2={containerSize.width} y2={i * cellSize} stroke="#ccc" strokeWidth="1" />
                        ))}
                    </svg>
                </div>
            )}
            
            {/* Windows */}
            {windows.map(window => {
                const { x, y, width, height } = gridToPixel(window.gridX, window.gridY, window.gridWidth, window.gridHeight);
                console.log(`Rendering window ${window.title}: grid(${window.gridX}, ${window.gridY}) -> pixel(${x}, ${y})`);
                return (
                    <Window
                        key={window.id}
                        id={window.id}
                        title={window.title}
                        color={window.color}
                        isMinimized={window.isMinimized}
                        isMaximized={window.isMaximized}
                        onMinimize={minimizeWindow}
                        onMaximize={maximizeWindow}
                        onClose={removeWindow}
                        onDragStart={handleDragStart}
                        onResizeStart={handleResizeStart}
                        style={{
                            left: x,
                            top: y,
                            width: width,
                            height: height,
                            zIndex: draggedWindow === window.id ? 10 : 1
                        }}
                        {...{ 'data-window-id': window.id }}
                    >
                        {window.children}
                    </Window>
                );
            })}
            
            {/* Scale indicator */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-600 font-gothic bg-white/80 px-2 py-1 rounded">
                {gridCols} × {gridRows} grid | Bin Packing Layout
            </div>
        </div>
    );
};

export default BinPackingLayout;
