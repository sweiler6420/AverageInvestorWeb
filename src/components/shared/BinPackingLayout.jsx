import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
    XMarkIcon, 
    MinusIcon, 
    ArrowsPointingOutIcon,
    ChevronDoubleRightIcon,
    ArrowsPointingInIcon
} from '@heroicons/react/24/outline'

// Window component (reused from original)
const Window = ({ 
    id, 
    title, 
    color, 
    children, 
    isMinimized, 
    isMaximized, 
    isFullscreen,
    onMinimize, 
    onMaximize, 
    onFullscreen,
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
            className={`absolute cursor-move select-none ${className}`}
            style={{
                ...style,
                right: '4px',
                // No padding, background, or outline on outer div - just positioning
            }}
            onMouseDown={handleMouseDown}
            {...props}
        >
            {/* Inner div with the visual styling and padding */}
            <div
                className="rounded-lg"
                style={{
                    width: 'calc(100% - 8px)',  // Subtract 8px total (4px on each side)
                    height: 'calc(100% - 8px)', // Subtract 8px total (4px on each side)
                    margin: '4px',              // Center the inner div
                    outline: '2px solid rgba(5, 15, 1, 0.29)',
                    boxShadow: '0 8px 32px rgba(8, 8, 8, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    background: 'rgba(1, 175, 255, 0.34)',
                }}
            >
            
            {/* Window header */}
            <div className={`bg-black/20 ${color} text-white text-sm px-3 py-2 rounded-t-lg flex justify-between items-center window-controls`} style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
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
                            onFullscreen(id);
                        }}
                        className="w-3 h-3 bg-blue-400 rounded-full hover:bg-blue-300 transition-colors"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
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
        </div>
    );
};

// Bin Packing Layout Component
const BinPackingLayout = ({ 
    children, 
    className = "",
    cellSize = 20,
    minWindowWidth = 4,
    minWindowHeight = 3
}) => {
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [windows, setWindows] = useState([]);
    const [draggedWindow, setDraggedWindow] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const finalDragPositionRef = useRef({ gridX: 0, gridY: 0 });
    const [resizingWindow, setResizingWindow] = useState(null);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [fullscreenWindow, setFullscreenWindow] = useState(null);
    const originalPositionsRef = useRef({});
    
    // Separate state for logical grid dimensions (independent of container size)
    const [logicalGridCols, setLogicalGridCols] = useState(null); // Will be calculated from container
    const [logicalGridRows, setLogicalGridRows] = useState(null); // Will be calculated from container

    // Calculate actual grid dimensions (use logical grid or fallback to container-based)
    const gridCols = logicalGridCols || Math.max(1, Math.floor(containerSize.width / cellSize));
    const gridRows = logicalGridRows || Math.max(1, Math.floor(containerSize.height / cellSize));

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

    // Initialize and update logical grid dimensions based on container size
    useEffect(() => {
        console.log('Grid initialization check:', {
            containerWidth: containerSize.width,
            containerHeight: containerSize.height,
            logicalGridCols,
            logicalGridRows,
            cellSize
        });
        
        if (containerSize.width > 0 && containerSize.height > 0) {
            const newCols = Math.floor(containerSize.width / cellSize);
            const newRows = Math.floor(containerSize.height / cellSize);
            
            // Update grid dimensions if they're different from current values
            if (logicalGridCols === null || logicalGridRows === null || 
                logicalGridCols !== newCols || logicalGridRows !== newRows) {
                console.log(`Updating logical grid dimensions: ${newCols}x${newRows}`);
                setLogicalGridCols(newCols);
                setLogicalGridRows(newRows);
            }
        }
    }, [containerSize.width, containerSize.height, logicalGridCols, logicalGridRows, cellSize]);

    // Prevent rendering until grid is properly initialized
    const isGridInitialized = logicalGridCols !== null && logicalGridRows !== null && gridCols > 1 && gridRows > 1;

    // Log grid dimensions when they change
    useEffect(() => {
        console.log(`Current grid dimensions: ${gridCols}x${gridRows}`);
    }, [gridCols, gridRows]);

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
        const hasCollision = windows.some(window => {
            if (window.id === excludeWindowId) return false;
            
            // AABB collision detection
            const collides = !(gridX >= window.gridX + window.gridWidth ||
                    gridX + gridWidth <= window.gridX ||
                    gridY >= window.gridY + window.gridHeight ||
                    gridY + gridHeight <= window.gridY);
            
            // Collision detected
            
            return collides;
        });
        
        return hasCollision;
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
        
        // If clamped position is invalid, try to find a valid position
        // Start with the original target position (before clamping) and search around it
        const searchCenterX = Math.max(0, Math.min(targetX, gridCols - gridWidth));
        const searchCenterY = Math.max(0, Math.min(targetY, gridRows - gridHeight));
        
        // Bin packing: Find nearest valid position using spiral search
        for (let radius = 1; radius <= Math.max(gridCols, gridRows); radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const testX = searchCenterX + dx;
                        const testY = searchCenterY + dy;
                        
                        // Ensure test position is within bounds
                        if (testX >= 0 && testY >= 0 && 
                            testX + gridWidth <= gridCols && 
                            testY + gridHeight <= gridRows) {
                            
                            if (!checkCollision(testX, testY, gridWidth, gridHeight, windowId)) {
                                return { gridX: testX, gridY: testY };
                            }
                        }
                    }
                }
            }
        }
        
        // If no valid position found, return the clamped position (even if it collides)
        return { gridX: clampedX, gridY: clampedY };
    }, [pixelToGrid, checkCollision, gridCols, gridRows]);

    // Add window with bin packing placement
    const addWindow = useCallback((windowConfig) => {
        console.log('Adding window:', {
            windowConfig,
            currentGridCols: gridCols,
            currentGridRows: gridRows,
            logicalGridCols,
            logicalGridRows,
            containerSize
        });
        
        // Get current container size directly from DOM to avoid state timing issues
        let currentGridCols = gridCols;
        let currentGridRows = gridRows;
        
        if (containerRef.current && (gridCols === 0 || gridRows === 0)) {
            const rect = containerRef.current.getBoundingClientRect();
            currentGridCols = Math.floor(rect.width / cellSize);
            currentGridRows = Math.floor(rect.height / cellSize);
            console.log('Using DOM measurements:', { currentGridCols, currentGridRows });
        }
        
        const newWindow = {
            id: `window_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: windowConfig.title || 'New Window',
            color: windowConfig.color || 'bg-blue-500',
            gridX: windowConfig.gridX || 0,
            gridY: windowConfig.gridY || 0,
            gridWidth: Math.max(windowConfig.gridWidth || minWindowWidth, minWindowWidth),
            gridHeight: Math.max(windowConfig.gridHeight || minWindowHeight, minWindowHeight),
            children: windowConfig.children || null
        };

        // Use findBestPosition to get the optimal placement
        const { x: pixelX, y: pixelY } = gridToPixel(newWindow.gridX, newWindow.gridY, newWindow.gridWidth, newWindow.gridHeight);
        
        // Create a temporary findBestPosition with current grid dimensions
        const tempFindBestPosition = (windowId, pixelX, pixelY, gridWidth, gridHeight) => {
            // Snap to grid
            const { gridX: targetX, gridY: targetY } = pixelToGrid(pixelX, pixelY);
            
            // Clamp to valid bounds
            const clampedX = Math.max(0, Math.min(targetX, currentGridCols - gridWidth));
            const clampedY = Math.max(0, Math.min(targetY, currentGridRows - gridHeight));
            
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
        };
        
        const { gridX: finalGridX, gridY: finalGridY } = tempFindBestPosition(
            newWindow.id,
            pixelX,
            pixelY,
            newWindow.gridWidth,
            newWindow.gridHeight
        );

        // Update the window with the final position
        newWindow.gridX = finalGridX;
        newWindow.gridY = finalGridY;

        console.log('Final window position:', {
            windowId: newWindow.id,
            finalGridX,
            finalGridY,
            gridWidth: newWindow.gridWidth,
            gridHeight: newWindow.gridHeight
        });

        // Add to state
        setWindows(prev => [...prev, newWindow]);

        // Set position directly in DOM after a brief delay to ensure the element exists
        setTimeout(() => {
            const windowElement = document.querySelector(`[data-window-id="${newWindow.id}"]`);
            if (windowElement) {
                const { x: finalPixelX, y: finalPixelY } = gridToPixel(finalGridX, finalGridY, newWindow.gridWidth, newWindow.gridHeight);
                windowElement.style.left = `${finalPixelX}px`;
                windowElement.style.top = `${finalPixelY}px`;
            }
        }, 0);

        return newWindow.id;
    }, [findBestPosition, gridToPixel, minWindowWidth, minWindowHeight, gridCols, gridRows, windows.length]);

    // Remove window
    const removeWindow = useCallback((windowId) => {
        setWindows(prev => prev.filter(w => w.id !== windowId));
    }, []);

    // Minimize window - shrink to minimum size
    const minimizeWindow = useCallback((windowId) => {
        setWindows(prev => prev.map(w => 
            w.id === windowId 
                ? { ...w, gridWidth: minWindowWidth, gridHeight: minWindowHeight }
                : w
        ));
    }, [minWindowWidth, minWindowHeight]);

    // Maximize window - intelligently expand to fill available space
    const maximizeWindow = useCallback((windowId) => {
        setWindows(prev => prev.map(w => {
            if (w.id === windowId) {
                let newGridX = w.gridX;
                let newGridY = w.gridY;
                let newGridWidth = w.gridWidth;
                let newGridHeight = w.gridHeight;
                
                // Step 1: Move up as far as possible until collision
                for (let testY = w.gridY - 1; testY >= 0; testY--) {
                    if (!checkCollision(w.gridX, testY, w.gridWidth, w.gridHeight, windowId)) {
                        newGridY = testY;
                    } else {
                        break;
                    }
                }
                
                // Step 2: Move left as far as possible until collision
                for (let testX = w.gridX - 1; testX >= 0; testX--) {
                    if (!checkCollision(testX, newGridY, w.gridWidth, w.gridHeight, windowId)) {
                        newGridX = testX;
                    } else {
                        break;
                    }
                }
                
                // Step 3: Scale right as far as possible until collision
                for (let testWidth = w.gridWidth + 1; testWidth <= gridCols - newGridX; testWidth++) {
                    if (!checkCollision(newGridX, newGridY, testWidth, newGridHeight, windowId)) {
                        newGridWidth = testWidth;
                    } else {
                        break;
                    }
                }
                
                // Step 4: Scale down as far as possible until collision
                for (let testHeight = w.gridHeight + 1; testHeight <= gridRows - newGridY; testHeight++) {
                    if (!checkCollision(newGridX, newGridY, newGridWidth, testHeight, windowId)) {
                        newGridHeight = testHeight;
                    } else {
                        break;
                    }
                }
                
                return {
                    ...w,
                    gridX: newGridX,
                    gridY: newGridY,
                    gridWidth: newGridWidth,
                    gridHeight: newGridHeight
                };
            }
            return w;
        }));
    }, [gridCols, gridRows, checkCollision]);

    // Fullscreen window - toggle between fullscreen and original position
    const toggleFullscreen = useCallback((windowId) => {
        setWindows(prev => prev.map(w => {
            if (w.id === windowId) {
                if (fullscreenWindow === windowId) {
                    // Exit fullscreen - restore original position
                    const original = originalPositionsRef.current[windowId];
                    if (original) {
                        return {
                            ...w,
                            gridX: original.gridX,
                            gridY: original.gridY,
                            gridWidth: original.gridWidth,
                            gridHeight: original.gridHeight
                        };
                    }
                    // If no original position saved, keep current state
                    return w;
                } else {
                    // Enter fullscreen - save original position and move to (0,0) with full size
                    originalPositionsRef.current[windowId] = {
                        gridX: w.gridX,
                        gridY: w.gridY,
                        gridWidth: w.gridWidth,
                        gridHeight: w.gridHeight
                    };
                    
                    return {
                        ...w,
                        gridX: 0,
                        gridY: 0,
                        gridWidth: gridCols,
                        gridHeight: gridRows
                    };
                }
            }
            return w;
        }));
        
        // Toggle fullscreen state
        setFullscreenWindow(prev => prev === windowId ? null : windowId);
    }, [gridCols, gridRows, fullscreenWindow]);

    // Drag handlers
    const handleDragStart = useCallback((e, windowId) => {
        // Don't allow dragging if window is in fullscreen
        if (fullscreenWindow === windowId) return;
        
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
    }, [fullscreenWindow]);

    const handleResizeStart = useCallback((e, windowId) => {
        // Don't allow resizing if window is in fullscreen
        if (fullscreenWindow === windowId) return;
        
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
    }, [fullscreenWindow]);

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

    // Grid compression algorithm - reduces grid size while maintaining proportional window sizes
    const compressGrid = useCallback((newGridCols, newGridRows) => {
        if (newGridCols <= 0 || newGridRows <= 0) return;
        
        console.log(`Grid resizing: ${gridCols}x${gridRows} → ${newGridCols}x${newGridRows}`);
        
        // Update the logical grid dimensions first
        setLogicalGridCols(newGridCols);
        setLogicalGridRows(newGridRows);
        
        setWindows(prev => {
            const updatedWindows = [...prev];
            
            // Handle horizontal compression
            if (newGridCols < gridCols) {
                const widthReduction = gridCols - newGridCols;
                
                // Calculate total width usage of all windows
                const totalWidthUsed = updatedWindows.reduce((sum, window) => sum + window.gridWidth, 0);
                
                // Sort windows by their width proportion (largest first)
                const windowsWithProportions = updatedWindows.map(window => ({
                    ...window,
                    widthProportion: window.gridWidth / totalWidthUsed
                })).sort((a, b) => b.widthProportion - a.widthProportion);
                
                // Distribute width reduction proportionally
                let remainingReduction = widthReduction;
                for (const windowData of windowsWithProportions) {
                    if (remainingReduction <= 0) break;
                    
                    const reductionForThisWindow = Math.min(
                        Math.ceil(windowData.widthProportion * widthReduction),
                        remainingReduction,
                        windowData.gridWidth - minWindowWidth // Don't go below minimum
                    );
                    
                    if (reductionForThisWindow > 0) {
                        const windowIndex = updatedWindows.findIndex(w => w.id === windowData.id);
                        if (windowIndex !== -1) {
                            updatedWindows[windowIndex] = {
                                ...updatedWindows[windowIndex],
                                gridWidth: Math.max(
                                    updatedWindows[windowIndex].gridWidth - reductionForThisWindow,
                                    minWindowWidth
                                )
                            };
                            remainingReduction -= reductionForThisWindow;
                        }
                    }
                }
                
                // Clamp windows that are now out of bounds horizontally
                updatedWindows.forEach(window => {
                    if (window.gridX + window.gridWidth > newGridCols) {
                        window.gridX = Math.max(0, newGridCols - window.gridWidth);
                    }
                });
            }
            
            // Handle vertical compression
            if (newGridRows < gridRows) {
                const heightReduction = gridRows - newGridRows;
                
                // Calculate total height usage of all windows
                const totalHeightUsed = updatedWindows.reduce((sum, window) => sum + window.gridHeight, 0);
                
                // Sort windows by their height proportion (largest first)
                const windowsWithProportions = updatedWindows.map(window => ({
                    ...window,
                    heightProportion: window.gridHeight / totalHeightUsed
                })).sort((a, b) => b.heightProportion - a.heightProportion);
                
                // Distribute height reduction proportionally
                let remainingReduction = heightReduction;
                for (const windowData of windowsWithProportions) {
                    if (remainingReduction <= 0) break;
                    
                    const reductionForThisWindow = Math.min(
                        Math.ceil(windowData.heightProportion * heightReduction),
                        remainingReduction,
                        windowData.gridHeight - minWindowHeight // Don't go below minimum
                    );
                    
                    if (reductionForThisWindow > 0) {
                        const windowIndex = updatedWindows.findIndex(w => w.id === windowData.id);
                        if (windowIndex !== -1) {
                            updatedWindows[windowIndex] = {
                                ...updatedWindows[windowIndex],
                                gridHeight: Math.max(
                                    updatedWindows[windowIndex].gridHeight - reductionForThisWindow,
                                    minWindowHeight
                                )
                            };
                            remainingReduction -= reductionForThisWindow;
                        }
                    }
                }
                
                // Clamp windows that are now out of bounds vertically
                updatedWindows.forEach(window => {
                    if (window.gridY + window.gridHeight > newGridRows) {
                        window.gridY = Math.max(0, newGridRows - window.gridHeight);
                    }
                });
            }
            
            // Use bin packing to reposition windows that might now have collisions
            const finalWindows = updatedWindows.map(window => {
                // Check if this window collides with others
                const hasCollision = updatedWindows.some(otherWindow => {
                    if (otherWindow.id === window.id) return false;
                    
                    return !(window.gridX >= otherWindow.gridX + otherWindow.gridWidth ||
                            window.gridX + window.gridWidth <= otherWindow.gridX ||
                            window.gridY >= otherWindow.gridY + otherWindow.gridHeight ||
                            window.gridY + window.gridHeight <= otherWindow.gridY);
                });
                
                if (hasCollision) {
                    // Use existing findBestPosition algorithm to find a valid position
                    const { gridX, gridY } = findBestPosition(
                        window.id,
                        window.gridX * cellSize,
                        window.gridY * cellSize,
                        window.gridWidth,
                        window.gridHeight
                    );
                    
                    return {
                        ...window,
                        gridX,
                        gridY
                    };
                }
                
                return window;
            });
            
            return finalWindows;
        });
        
        // Update the container size to reflect new grid dimensions
        const newWidth = newGridCols * cellSize;
        const newHeight = newGridRows * cellSize;
        setContainerSize({ width: newWidth, height: newHeight });
    }, [gridCols, gridRows, minWindowWidth, minWindowHeight, cellSize, findBestPosition]);

    // Expose methods to parent
    useEffect(() => {
        console.log('Exposing API to parent:', { gridCols, gridRows, isGridInitialized });
        if (children && typeof children === 'function') {
            children({
                addWindow,
                removeWindow,
                minimizeWindow,
                maximizeWindow,
                toggleFullscreen,
                compressGrid,
                windows,
                gridCols,
                gridRows,
                isGridInitialized
            });
        }
    }, [children, addWindow, removeWindow, minimizeWindow, maximizeWindow, toggleFullscreen, compressGrid, windows, gridCols, gridRows, isGridInitialized]);

    return (
        <div ref={containerRef} className={`bin-packing-layout w-full h-full min-h-96 relative ${className}`}>
            {/* Only render grid and windows when properly initialized */}
            {isGridInitialized && (
                <>
                    {/* Grid background */}
                    <div className="absolute inset-0 opacity-20 border-2 border-blue-500" style={{
                        width: `${gridCols * cellSize}px`,
                        height: `${gridRows * cellSize}px`,
                        border: '2px solid #3b82f6'
                    }}>
                        <svg width="100%" height="100%">
                            {/* Vertical grid lines */}
                            {Array.from({ length: gridCols + 1 }).map((_, i) => (
                                <line key={`v-${i}`} x1={i * cellSize} y1={0} x2={i * cellSize} y2={gridRows * cellSize} stroke="#3b82f6" strokeWidth="1" />
                            ))}
                            {/* Horizontal grid lines */}
                            {Array.from({ length: gridRows + 1 }).map((_, i) => (
                                <line key={`h-${i}`} x1={0} y1={i * cellSize} x2={gridCols * cellSize} y2={i * cellSize} stroke="#3b82f6" strokeWidth="1" />
                            ))}
                        </svg>
                    </div>
            
            {/* Windows */}
            {windows.map(window => {
                const { x, y, width, height } = gridToPixel(window.gridX, window.gridY, window.gridWidth, window.gridHeight);
                return (
                    <Window
                        key={window.id}
                        id={window.id}
                        title={window.title}
                        color={window.color}
                        isFullscreen={fullscreenWindow === window.id}
                        onMinimize={minimizeWindow}
                        onMaximize={maximizeWindow}
                        onFullscreen={toggleFullscreen}
                        onClose={removeWindow}
                        onDragStart={handleDragStart}
                        onResizeStart={handleResizeStart}
                        style={{
                            left: x,
                            top: y,
                            width: width,
                            height: height,
                            zIndex: fullscreenWindow === window.id ? 20 : (draggedWindow === window.id ? 10 : 1)
                        }}
                        {...{ 'data-window-id': window.id }}
                    >
                        {window.children}
                    </Window>
                );
            })}
            
                    {/* Scale indicator */}
                    {/* <div className="absolute bottom-2 right-2 text-xs text-gray-600 font-gothic bg-white/80 px-2 py-1 rounded">
                        {gridCols} × {gridRows} grid | Bin Packing Layout
                    </div> */}
                </>
            )}
        </div>
    );
};

export default BinPackingLayout;
