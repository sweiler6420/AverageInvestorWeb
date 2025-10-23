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
        // Snap to grid
        const { gridX: targetX, gridY: targetY } = pixelToGrid(pixelX, pixelY);
        
        // Clamp to valid bounds
        const clampedX = Math.max(0, Math.min(targetX, gridCols - gridWidth));
        const clampedY = Math.max(0, Math.min(targetY, gridRows - gridHeight));
        
        // Check if this position is valid
        if (!checkCollision(clampedX, clampedY, gridWidth, gridHeight, windowId)) {
            return { gridX: clampedX, gridY: clampedY };
        }
        
        // Bin packing: Find nearest valid position using spiral search
        for (let radius = 1; radius <= 10; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const testX = clampedX + dx;
                        const testY = clampedY + dy;
                        
                        if (!checkCollision(testX, testY, gridWidth, gridHeight, windowId)) {
                            return { gridX: testX, gridY: testY };
                        }
                    }
                }
            }
        }
        
        // Fallback to original position
        return { gridX: clampedX, gridY: clampedY };
    }, [pixelToGrid, checkCollision, gridCols, gridRows]);

    // Add window with bin packing placement
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

        // Use bin packing to find valid position - start from top-left and search systematically
        let bestPosition = { gridX: 0, gridY: 0 };
        let foundValidPosition = false;

        // First try the requested position
        if (!checkCollision(newWindow.gridX, newWindow.gridY, newWindow.gridWidth, newWindow.gridHeight, newWindow.id)) {
            bestPosition = { gridX: newWindow.gridX, gridY: newWindow.gridY };
            foundValidPosition = true;
            console.log(`Window ${newWindow.title} placed at requested position: grid(${newWindow.gridX}, ${newWindow.gridY})`);
        } else {
            console.log(`Window ${newWindow.title} requested position grid(${newWindow.gridX}, ${newWindow.gridY}) has collision, searching for alternative`);
            // If requested position is invalid, search systematically from top-left
            for (let y = 0; y <= gridRows - newWindow.gridHeight && !foundValidPosition; y++) {
                for (let x = 0; x <= gridCols - newWindow.gridWidth && !foundValidPosition; x++) {
                    if (!checkCollision(x, y, newWindow.gridWidth, newWindow.gridHeight, newWindow.id)) {
                        bestPosition = { gridX: x, gridY: y };
                        foundValidPosition = true;
                        console.log(`Window ${newWindow.title} placed at alternative position: grid(${x}, ${y})`);
                    }
                }
            }
        }
        
        newWindow.gridX = bestPosition.gridX;
        newWindow.gridY = bestPosition.gridY;

        setWindows(prev => [...prev, newWindow]);
        return newWindow.id;
    }, [checkCollision, minWindowWidth, minWindowHeight, gridCols, gridRows]);

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
            
            const windowElement = document.querySelector(`[data-window-id="${resizingWindow}"]`);
            if (windowElement) {
                const rect = windowElement.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                const currentX = rect.left - containerRect.left;
                const currentY = rect.top - containerRect.top;
                
                const { gridWidth, gridHeight } = pixelToGrid(newWidth, newHeight);
                const currentWindow = windows.find(w => w.id === resizingWindow);
                
                // Only allow resize if it doesn't create collision
                if (!checkCollision(currentWindow.gridX, currentWindow.gridY, gridWidth, gridHeight, resizingWindow)) {
                    windowElement.style.width = `${newWidth}px`;
                    windowElement.style.height = `${newHeight}px`;
                    windowElement.style.zIndex = '10';
                }
            }
        }
    }, [draggedWindow, resizingWindow, dragOffset, resizeStart, windows, findBestPosition, gridToPixel, pixelToGrid, checkCollision, minWindowWidth, minWindowHeight, cellSize]);

    const handleMouseUp = useCallback(() => {
        if (draggedWindow) {
            const windowElement = document.querySelector(`[data-window-id="${draggedWindow}"]`);
            if (windowElement) {
                // Get the current DOM position
                const rect = windowElement.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                const pixelX = rect.left - containerRect.left;
                const pixelY = rect.top - containerRect.top;
                
                // Get current window state
                const currentWindow = windows.find(w => w.id === draggedWindow);
                
                // Use bin packing to find final position
                const { gridX: finalGridX, gridY: finalGridY } = findBestPosition(
                    draggedWindow,
                    pixelX,
                    pixelY,
                    currentWindow.gridWidth,
                    currentWindow.gridHeight
                );
                
                setWindows(prev => prev.map(w => 
                    w.id === draggedWindow 
                        ? { ...w, gridX: finalGridX, gridY: finalGridY }
                        : w
                ));
                
                // Clear inline styles
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
                
                const { gridWidth, gridHeight } = pixelToGrid(rect.width, rect.height);
                
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
