import React, { useState, useEffect, useContext, useRef } from 'react'
import { ChevronDoubleRightIcon } from '@heroicons/react/24/outline'

const InteractiveDesktop = () => {
    const GRID_SIZE = 20; // Grid cell size in pixels

    const [windows, setWindows] = useState([
        { id: 1, gridX: 1, gridY: 2, gridWidth: 8, gridHeight: 6, title: 'AAPL Chart', color: 'bg-blue-500' },
        { id: 2, gridX: 10, gridY: 3, gridWidth: 8, gridHeight: 5, title: 'TSLA Data', color: 'bg-green-500' },
        { id: 3, gridX: 4, gridY: 9, gridWidth: 8, gridHeight: 5, title: 'Portfolio', color: 'bg-purple-500' },
        { id: 4, gridX: 13, gridY: 9, gridWidth: 6, gridHeight: 5, title: 'News', color: 'bg-orange-500' }
    ]);

    const [draggedWindow, setDraggedWindow] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizingWindow, setResizingWindow] = useState(null);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);

    // Calculate grid dimensions based on container size
    const GRID_COLS = Math.floor(containerSize.width / GRID_SIZE);
    const GRID_ROWS = Math.floor(containerSize.height / GRID_SIZE);

    // Update container size when component mounts or resizes
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

    // Convert grid coordinates to pixel coordinates with gap
    const gridToPixel = (gridX, gridY, gridWidth, gridHeight) => {
        const GAP = 4; // 4px gap between windows
        return {
            x: gridX * GRID_SIZE + GAP,
            y: gridY * GRID_SIZE + GAP,
            width: gridWidth * GRID_SIZE - (GAP * 2),
            height: gridHeight * GRID_SIZE - (GAP * 2)
        };
    };

    // Check if a position is valid (no overlaps)
    const isValidPosition = (windowId, newGridX, newGridY, gridWidth, gridHeight) => {
        // Check boundaries with proper grid calculations
        if (newGridX < 0 || newGridY < 0 || 
            newGridX + gridWidth > GRID_COLS || 
            newGridY + gridHeight > GRID_ROWS) {
            return false;
        }

        // Check for overlaps with other windows (excluding the current window)
        return !windows.some(window => {
            if (window.id === windowId) return false;
            
            // Check if rectangles overlap
            const overlap = !(newGridX >= window.gridX + window.gridWidth ||
                            newGridX + gridWidth <= window.gridX ||
                            newGridY >= window.gridY + window.gridHeight ||
                            newGridY + gridHeight <= window.gridY);
            
            return overlap;
        });
    };

    // Check if a DOM position collides with other windows
    const checkDOMCollision = (windowId, x, y, width, height) => {
        const currentWindow = windows.find(w => w.id === windowId);
        if (!currentWindow) return false;
        
        return windows.some(window => {
            if (window.id === windowId) return false;
            
            const { x: otherX, y: otherY, width: otherWidth, height: otherHeight } = 
                gridToPixel(window.gridX, window.gridY, window.gridWidth, window.gridHeight);
            
            // Check if rectangles overlap
            return !(x >= otherX + otherWidth ||
                    x + width <= otherX ||
                    y >= otherY + otherHeight ||
                    y + height <= otherY);
        });
    };

    // Find the best position for a window (snap to grid)
    const findBestPosition = (windowId, pixelX, pixelY, gridWidth, gridHeight) => {
        // Clamp to container boundaries first
        const clampedX = Math.max(0, Math.min(pixelX, containerSize.width - (gridWidth * GRID_SIZE)));
        const clampedY = Math.max(0, Math.min(pixelY, containerSize.height - (gridHeight * GRID_SIZE)));
        
        const gridX = Math.round(clampedX / GRID_SIZE);
        const gridY = Math.round(clampedY / GRID_SIZE);

        // Try the exact position first
        if (isValidPosition(windowId, gridX, gridY, gridWidth, gridHeight)) {
            return { gridX, gridY };
        }

        // Try nearby positions in a spiral pattern (expanded search)
        for (let radius = 1; radius <= 5; radius++) {
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
        return { gridX: originalWindow.gridX, gridY: originalWindow.gridY };
    };

    const handleMouseDown = (e, windowId) => {
        e.preventDefault();
        e.stopPropagation();
        const window = windows.find(w => w.id === windowId);
        const rect = e.currentTarget.getBoundingClientRect();
        setDraggedWindow(windowId);
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        
        if (draggedWindow) {
            const pixelX = e.clientX - containerRect.left - dragOffset.x;
            const pixelY = e.clientY - containerRect.top - dragOffset.y;
            
            const window = windows.find(w => w.id === draggedWindow);
            
            // Always snap to grid to prevent overlaps
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
            
            // Calculate new dimensions with minimum size constraints
            const minWidth = 100; // Minimum width in pixels
            const minHeight = 80; // Minimum height in pixels
            const newWidth = Math.max(resizeStart.width + deltaX, minWidth);
            const newHeight = Math.max(resizeStart.height + deltaY, minHeight);
            
            // Get current position
            const windowElement = document.querySelector(`[data-window-id="${resizingWindow}"]`);
            if (windowElement) {
                const rect = windowElement.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                const currentX = rect.left - containerRect.left;
                const currentY = rect.top - containerRect.top;
                
                // Check if resized window would collide
                if (!checkDOMCollision(resizingWindow, currentX, currentY, newWidth, newHeight)) {
                    // No collision, allow resize
                    windowElement.style.width = `${newWidth}px`;
                    windowElement.style.height = `${newHeight}px`;
                    windowElement.style.zIndex = '10';
                }
                // If collision, don't resize (keep current size)
            }
        }
    };

    const handleResizeStart = (e, windowId) => {
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
    };

    const handleMouseUp = () => {
        if (draggedWindow) {
            // Snap to grid and update state
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
                
                // Reset styles
                windowElement.style.left = '';
                windowElement.style.top = '';
                windowElement.style.zIndex = '';
            }
        } else if (resizingWindow) {
            // Snap to grid and update state
            const windowElement = document.querySelector(`[data-window-id="${resizingWindow}"]`);
            if (windowElement) {
                const rect = windowElement.getBoundingClientRect();
                const newGridWidth = Math.max(Math.ceil(rect.width / GRID_SIZE), windows.find(w => w.id === resizingWindow).gridWidth);
                const newGridHeight = Math.max(Math.ceil(rect.height / GRID_SIZE), windows.find(w => w.id === resizingWindow).gridHeight);
                
                setWindows(prev => prev.map(w => 
                    w.id === resizingWindow 
                        ? { ...w, gridWidth: newGridWidth, gridHeight: newGridHeight }
                        : w
                ));
                
                // Reset styles
                windowElement.style.width = '';
                windowElement.style.height = '';
                windowElement.style.zIndex = '';
            }
        }
        
        setDraggedWindow(null);
        setDragOffset({ x: 0, y: 0 });
        setResizingWindow(null);
        setResizeStart({ x: 0, y: 0, width: 0, height: 0 });
    };

    useEffect(() => {
        if (draggedWindow || resizingWindow) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggedWindow, resizingWindow, dragOffset, resizeStart]);

    return (
        <div ref={containerRef} className="desktop-container w-full h-full relative">
            {/* Grid background - only render when we have valid dimensions */}
            {containerSize.width > 0 && containerSize.height > 0 && (
                <div className="absolute inset-0 opacity-10">
                    <div className="grid h-full" style={{
                        gridTemplateColumns: `repeat(${GRID_COLS}, ${GRID_SIZE}px)`,
                        gridTemplateRows: `repeat(${GRID_ROWS}, ${GRID_SIZE}px)`
                    }}>
                        {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => (
                            <div key={i} className="border border-gray-300"></div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Draggable windows */}
            {windows.map(window => {
                const { x, y, width, height } = gridToPixel(window.gridX, window.gridY, window.gridWidth, window.gridHeight);
                return (
                    <div
                        key={window.id}
                        data-window-id={window.id}
                        className={`absolute ${window.color} rounded-lg shadow-lg border border-white/20 cursor-move select-none`}
                        style={{
                            left: x,
                            top: y,
                            width: width,
                            height: height,
                            zIndex: draggedWindow === window.id ? 10 : 1
                        }}
                        onMouseDown={(e) => handleMouseDown(e, window.id)}
                    >
                        {/* Window header */}
                        <div className="bg-black/20 text-white text-sm px-3 py-2 rounded-t-lg flex justify-between items-center">
                            <span className="font-gothic font-medium truncate">{window.title}</span>
                            <div className="flex space-x-1">
                                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            </div>
                        </div>
                        
                        {/* Window content */}
                        <div className="p-2 text-white text-xs flex flex-col overflow-hidden h-full" style={{ height: 'calc(100% - 40px)' }}>
                            <div className="bg-white/10 rounded p-1 mb-1 flex-1 min-h-0 w-full">
                                <div className="h-1 bg-white/30 rounded mb-1 w-full"></div>
                                <div className="h-1 bg-white/20 rounded mb-1 w-full"></div>
                                <div className="h-1 bg-white/15 rounded w-full"></div>
                            </div>
                        </div>
                        
                        {/* Resize handle */}
                        <div 
                            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-60 hover:opacity-100 transition-opacity duration-200"
                            onMouseDown={(e) => handleResizeStart(e, window.id)}
                        >
                            <ChevronDoubleRightIcon className="w-full h-full text-white transform rotate-45" />
                        </div>
                    </div>
                );
            })}
            
            {/* Instructions */}
            <div className="absolute bottom-2 left-2 text-xs text-gray-600 font-gothic">
                Drag windows - they'll snap to grid and never overlap
            </div>
        </div>
    );
};

export default InteractiveDesktop;
