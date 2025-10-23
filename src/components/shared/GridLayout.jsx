import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
    XMarkIcon, 
    MinusIcon, 
    ArrowsPointingOutIcon,
    ChevronDoubleRightIcon 
} from '@heroicons/react/24/outline'

// Window component with minimize, maximize, close buttons
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
        console.log('Window handleMouseDown for window:', id);
        console.log('Target element:', e.target);
        console.log('Target classes:', e.target.className);
        
        // Check if clicking directly on buttons or resize handle (not the title)
        const isButtonClick = e.target.tagName === 'BUTTON' || 
            e.target.classList.contains('resize-handle') ||
            e.target.closest('.resize-handle');
            
        if (isButtonClick) {
            console.log('Clicked on button or resize handle, not dragging');
            console.log('Target tag:', e.target.tagName);
            console.log('Target parent:', e.target.parentElement?.className);
            return; // Don't drag if clicking buttons or resize handle
        }
        
        console.log('Starting drag for window:', id);
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
                            console.log('Close button clicked for window:', id);
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

// Main GridLayout component
const GridLayout = ({ 
    children, 
    className = "",
    gridSize = 20,
    minWindowWidth = 4,
    minWindowHeight = 3,
    maxWindowWidth = 20,
    maxWindowHeight = 15,
    gap = 4
}) => {
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [windows, setWindows] = useState([]);
    const [draggedWindow, setDraggedWindow] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizingWindow, setResizingWindow] = useState(null);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Calculate grid dimensions
    const GRID_COLS = Math.floor(containerSize.width / gridSize);
    const GRID_ROWS = Math.floor(containerSize.height / gridSize);

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

    // Convert grid coordinates to pixels
    const gridToPixel = useCallback((gridX, gridY, gridWidth, gridHeight) => {
        return {
            x: gridX * gridSize + gap,
            y: gridY * gridSize + gap,
            width: gridWidth * gridSize - (gap * 2),
            height: gridHeight * gridSize - (gap * 2)
        };
    }, [gridSize, gap]);

    // Convert pixels to grid coordinates
    const pixelToGrid = useCallback((x, y, width, height) => {
        return {
            gridX: Math.round((x - gap) / gridSize),
            gridY: Math.round((y - gap) / gridSize),
            gridWidth: Math.round((width + gap * 2) / gridSize),
            gridHeight: Math.round((height + gap * 2) / gridSize)
        };
    }, [gridSize, gap]);

    // Check if position is valid - STRICT OVERLAP PREVENTION
    const isValidPosition = useCallback((windowId, gridX, gridY, gridWidth, gridHeight) => {
        // Check boundaries
        if (gridX < 0 || gridY < 0 || 
            gridX + gridWidth > GRID_COLS || 
            gridY + gridHeight > GRID_ROWS) {
            return false;
        }

        // Check size constraints
        if (gridWidth < minWindowWidth || gridHeight < minWindowHeight ||
            gridWidth > maxWindowWidth || gridHeight > maxWindowHeight) {
            return false;
        }

        // STRICT overlap check - no windows can overlap
        return !windows.some(window => {
            if (window.id === windowId) return false;
            
            // Check if rectangles overlap (strict no-overlap policy)
            const overlap = !(gridX >= window.gridX + window.gridWidth ||
                            gridX + gridWidth <= window.gridX ||
                            gridY >= window.gridY + window.gridHeight ||
                            gridY + gridHeight <= window.gridY);
            
            return overlap;
        });
    }, [windows, GRID_COLS, GRID_ROWS, minWindowWidth, minWindowHeight, maxWindowWidth, maxWindowHeight]);

    // Find best position with expanded search for no-overlap guarantee
    const findBestPosition = useCallback((windowId, pixelX, pixelY, gridWidth, gridHeight) => {
        const clampedX = Math.max(0, Math.min(pixelX, containerSize.width - (gridWidth * gridSize)));
        const clampedY = Math.max(0, Math.min(pixelY, containerSize.height - (gridHeight * gridSize)));
        
        const gridX = Math.round(clampedX / gridSize);
        const gridY = Math.round(clampedY / gridSize);

        // Try exact position first
        if (isValidPosition(windowId, gridX, gridY, gridWidth, gridHeight)) {
            return { gridX, gridY };
        }

        // Expanded search pattern for guaranteed no-overlap
        for (let radius = 1; radius <= 10; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const testX = gridX + dx;
                        const testY = gridY + dy;
                        if (isValidPosition(windowId, testX, testY, gridWidth, gridHeight)) {
                            return { gridX: testX, gridY: testY };
                        }
                    }
                }
            }
        }

        // If no valid position found, return original position
        const originalWindow = windows.find(w => w.id === windowId);
        return { gridX: originalWindow?.gridX || 0, gridY: originalWindow?.gridY || 0 };
    }, [isValidPosition, containerSize, gridSize, windows]);

    // Add window with guaranteed no-overlap placement
    const addWindow = useCallback((windowConfig) => {
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

        // Find valid position by checking against existing windows
        let bestPosition = { gridX: newWindow.gridX, gridY: newWindow.gridY };
        
        // If the requested position is invalid, find a new one
        if (!isValidPosition(newWindow.id, newWindow.gridX, newWindow.gridY, newWindow.gridWidth, newWindow.gridHeight)) {
            // Try positions in a systematic way
            for (let y = 0; y < GRID_ROWS - newWindow.gridHeight + 1; y++) {
                for (let x = 0; x < GRID_COLS - newWindow.gridWidth + 1; x++) {
                    if (isValidPosition(newWindow.id, x, y, newWindow.gridWidth, newWindow.gridHeight)) {
                        bestPosition = { gridX: x, gridY: y };
                        break;
                    }
                }
                if (bestPosition.gridX !== newWindow.gridX || bestPosition.gridY !== newWindow.gridY) {
                    break;
                }
            }
        }
        
        newWindow.gridX = bestPosition.gridX;
        newWindow.gridY = bestPosition.gridY;

        setWindows(prev => [...prev, newWindow]);
        return newWindow.id;
    }, [isValidPosition, minWindowWidth, minWindowHeight, GRID_COLS, GRID_ROWS]);

    // Remove window
    const removeWindow = useCallback((windowId) => {
        console.log('Removing window:', windowId);
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

    // Drag handlers with strict no-overlap enforcement
    const handleDragStart = useCallback((e, windowId) => {
        console.log('Drag start:', windowId);
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setDraggedWindow(windowId);
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }, []);

    const handleResizeStart = useCallback((e, windowId) => {
        console.log('Resize start:', windowId);
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
            const pixelX = e.clientX - containerRect.left - dragOffset.x;
            const pixelY = e.clientY - containerRect.top - dragOffset.y;
            
            const window = windows.find(w => w.id === draggedWindow);
            
            // ALWAYS snap to valid position to prevent overlaps
            const { gridX, gridY } = findBestPosition(draggedWindow, pixelX, pixelY, window.gridWidth, window.gridHeight);
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
            
            const newWidth = Math.max(resizeStart.width + deltaX, minWindowWidth * gridSize);
            const newHeight = Math.max(resizeStart.height + deltaY, minWindowHeight * gridSize);
            
            const windowElement = document.querySelector(`[data-window-id="${resizingWindow}"]`);
            if (windowElement) {
                const rect = windowElement.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                const currentX = rect.left - containerRect.left;
                const currentY = rect.top - containerRect.top;
                
                const { gridWidth, gridHeight } = pixelToGrid(currentX, currentY, newWidth, newHeight);
                const currentWindow = windows.find(w => w.id === resizingWindow);
                
                // Only allow resize if it doesn't create overlap
                if (isValidPosition(resizingWindow, currentWindow.gridX, currentWindow.gridY, gridWidth, gridHeight)) {
                    windowElement.style.width = `${newWidth}px`;
                    windowElement.style.height = `${newHeight}px`;
                    windowElement.style.zIndex = '10';
                }
                // If resize would create overlap, don't resize
            }
        }
    }, [draggedWindow, resizingWindow, dragOffset, resizeStart, windows, findBestPosition, gridToPixel, pixelToGrid, isValidPosition, minWindowWidth, minWindowHeight, gridSize]);

    const handleMouseUp = useCallback(() => {
        console.log('Mouse up - draggedWindow:', draggedWindow, 'resizingWindow:', resizingWindow);
        if (draggedWindow) {
            const windowElement = document.querySelector(`[data-window-id="${draggedWindow}"]`);
            if (windowElement) {
                const rect = windowElement.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                const pixelX = rect.left - containerRect.left;
                const pixelY = rect.top - containerRect.top;
                
                const window = windows.find(w => w.id === draggedWindow);
                const { gridX, gridY } = findBestPosition(draggedWindow, pixelX, pixelY, window.gridWidth, window.gridHeight);
                
                setWindows(prev => prev.map(w => 
                    w.id === draggedWindow 
                        ? { ...w, gridX, gridY }
                        : w
                ));
                
                windowElement.style.left = '';
                windowElement.style.top = '';
                windowElement.style.zIndex = '';
            }
        } else if (resizingWindow) {
            const windowElement = document.querySelector(`[data-window-id="${resizingWindow}"]`);
            if (windowElement) {
                const rect = windowElement.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                const pixelX = rect.left - containerRect.left;
                const pixelY = rect.top - containerRect.top;
                
                const { gridWidth, gridHeight } = pixelToGrid(pixelX, pixelY, rect.width, rect.height);
                
                setWindows(prev => prev.map(w => 
                    w.id === resizingWindow 
                        ? { ...w, gridWidth, gridHeight }
                        : w
                ));
                
                windowElement.style.width = '';
                windowElement.style.height = '';
                windowElement.style.zIndex = '';
            }
        }
        
        console.log('Resetting drag/resize state');
        setDraggedWindow(null);
        setDragOffset({ x: 0, y: 0 });
        setResizingWindow(null);
        setResizeStart({ x: 0, y: 0, width: 0, height: 0 });
    }, [draggedWindow, resizingWindow, windows, findBestPosition, pixelToGrid]);

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
        <div ref={containerRef} className={`grid-layout w-full h-full relative ${className}`}>
            {/* Grid background */}
            {containerSize.width > 0 && containerSize.height > 0 && (
                <div className="absolute inset-0 opacity-10">
                    <div className="grid h-full" style={{
                        gridTemplateColumns: `repeat(${GRID_COLS}, ${gridSize}px)`,
                        gridTemplateRows: `repeat(${GRID_ROWS}, ${gridSize}px)`
                    }}>
                        {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => (
                            <div key={i} className="border border-gray-300"></div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Windows */}
            {windows.map(window => {
                const { x, y, width, height } = gridToPixel(window.gridX, window.gridY, window.gridWidth, window.gridHeight);
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
                {GRID_COLS} × {GRID_ROWS} grid
            </div>
        </div>
    );
};

export default GridLayout;
