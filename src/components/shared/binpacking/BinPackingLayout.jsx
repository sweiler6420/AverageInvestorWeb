/**
 * BinPackingLayout (prop-driven, modular)
 *
 * Architecture:
 * - GridManager: measures container and computes centered grid (equal-spacing rule).
 * - WindowManager: deterministic reflow using Skyline; constraints honored; no overlaps.
 * - Window: inline-styled UI identical to current visuals.
 *
 * Behavior:
 * - Waits for first measured grid before packing to avoid (1,1) defaults.
 * - Reflows deterministically on container resize, windows change, or cellSize change.
 * - Preserves position/area if possible; collapses space; scales only if necessary.
 * - Enforces min sizes; allows overflow with scroll rather than shrinking below minimums.
 */

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Window from './Window';
import { createResizeObserver, computeGridSpec, computeGridSpecWithMinimumFootprint } from './GridManager';
import { reflowPreserve, estimateMinimumFootprintRows, reflowScaleByOverlap, computeArrangementMinimums } from './WindowManager';

const BinPackingLayout = forwardRef(function BinPackingLayout(
  {
    cellSize = 20,
    minGridWidth = 4,
    minGridHeight = 3,
    centerGrid = true,
    allowOverflowScroll = true,
    windows = [],
    onWindowsChange,
    reflowStrategy = 'conservative',
    windowFactory
  },
  ref
) {
  const containerRef = useRef(null);
  const [containerRect, setContainerRect] = useState({ width: 0, height: 0 });
  const [gridSpec, setGridSpec] = useState({ cols: 0, rows: 0, innerW: 0, innerH: 0, offsetLeft: 0, offsetTop: 0, overflow: false });
  const [packed, setPacked] = useState([]);
  const [dragState, setDragState] = useState(null); // {id, startX, startY, originLeft, originTop}
  const [resizeState, setResizeState] = useState(null); // {id, startX, startY, originW, originH}
  const [activeId, setActiveId] = useState(null);
  const [dragPreview, setDragPreview] = useState(null); // {x,y,width,height,color}

  // Collision helpers (grid units)
  const rectsOverlap = useCallback((a, b) => {
    return !(a.x >= b.x + b.width || a.x + a.width <= b.x || a.y >= b.y + b.height || a.y + a.height <= b.y);
  }, []);

  const isCollision = useCallback((x, y, width, height, excludeId) => {
    if (x < 0 || y < 0) return true;
    if (x + width > gridSpec.cols || y + height > gridSpec.rows) return true;
    const candidate = { x, y, width, height };
    for (let i = 0; i < packed.length; i += 1) {
      const w = packed[i];
      if (w.id === excludeId) continue;
      if (rectsOverlap(candidate, w)) return true;
    }
    return false;
  }, [gridSpec.cols, gridSpec.rows, packed, rectsOverlap]);

  const findNearestValidPosition = useCallback((startX, startY, width, height, excludeId) => {
    // Try target first
    if (!isCollision(startX, startY, width, height, excludeId)) return { x: startX, y: startY };
    const maxR = Math.max(gridSpec.cols, gridSpec.rows);
    for (let r = 1; r <= maxR; r += 1) {
      for (let dx = -r; dx <= r; dx += 1) {
        for (let dy = -r; dy <= r; dy += 1) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const x = startX + dx;
          const y = startY + dy;
          if (!isCollision(x, y, width, height, excludeId)) return { x, y };
        }
      }
    }
    // Fallback: clamp inside grid and return
    const clampedX = Math.max(0, Math.min(startX, gridSpec.cols - width));
    const clampedY = Math.max(0, Math.min(startY, gridSpec.rows - height));
    return { x: clampedX, y: clampedY };
  }, [gridSpec.cols, gridSpec.rows, isCollision]);

  const computeAllowedSize = useCallback((x, y, reqW, reqH, minW, minH, excludeId) => {
    let w = Math.max(minW, Math.min(reqW, gridSpec.cols - x));
    let h = Math.max(minH, Math.min(reqH, gridSpec.rows - y));
    // Reduce until no collision
    let guard = 0;
    while (isCollision(x, y, w, h, excludeId) && guard < 1000) {
      guard += 1;
      if (w > minW) w -= 1;
      else if (h > minH) h -= 1;
      else break;
    }
    return { width: w, height: h };
  }, [gridSpec.cols, gridSpec.rows, isCollision]);

  // Measure container
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = createResizeObserver(el, (rect) => {
      setContainerRect({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    }, 60);
    return () => ro.disconnect?.();
  }, []);

  // Compute minimum footprint rows for current windows and cols guess
  const minFootprint = useMemo(() => {
    const minCols = windows.reduce((s, w) => s + Math.max(1, w.minWidth || 1), 0);
    const minRows = windows.reduce((m, w) => Math.max(m, Math.max(1, w.minHeight || 1)), 1);
    return { minCols, minRows };
  }, [windows]);

  // Compute grid spec once container is measured
  useEffect(() => {
    const { width, height } = containerRect;
    if (width <= 0 || height <= 0) return;

    // Start with basic centered grid using available space
    const base = computeGridSpec(width, height, cellSize, minGridWidth, minGridHeight);
    // Compute arrangement-driven minimums (lines of windows) to prevent over-shrink below mins
    const arrangement = computeArrangementMinimums(windows);
    const requiredCols = Math.max(base.cols, arrangement.minCols);
    // Estimate rows required for minimums at current cols using Skyline minimums pass
    const requiredRows = Math.max(estimateMinimumFootprintRows(windows, requiredCols), arrangement.minRows);
    const rows = Math.max(base.rows, requiredRows);
    const cols = requiredCols;
    const innerW = cols * cellSize;
    const innerH = rows * cellSize;
    const overflowX = innerW > width;
    const overflowY = innerH > height;
    const offsetLeft = overflowX ? 0 : Math.max(0, Math.floor((width - innerW) / 2));
    const offsetTop = overflowY ? 0 : Math.max(0, Math.floor((height - innerH) / 2));
    setGridSpec({ cols, rows, innerW, innerH, offsetLeft, offsetTop, overflowX, overflowY });
  }, [containerRect.width, containerRect.height, cellSize, minGridWidth, minGridHeight, minFootprint.minCols, minFootprint.minRows]);

  const isGridReady = gridSpec.cols > 0 && gridSpec.rows > 0 && cellSize > 0;

  // Keep packed in sync with external windows changes without reflowing others
  useEffect(() => {
    setPacked(windows);
  }, [windows]);

  // Reflow windows deterministically when inputs change
  useLayoutEffect(() => {
    if (!isGridReady) return;
    const { cols, rows } = gridSpec;
    const { next } = reflowScaleByOverlap({ windows: packed, cols, rows });
    setPacked(next);
    onWindowsChange?.(() => next);
  }, [isGridReady, gridSpec.cols, gridSpec.rows]);

  // Imperative helpers
  useImperativeHandle(ref, () => ({
    addWindow: (win) => onWindowsChange?.((prev) => [...prev, win]),
    removeWindow: (id) => onWindowsChange?.((prev) => prev.filter((w) => w.id !== id)),
    replaceWindows: (next) => onWindowsChange?.(() => next)
  }), [onWindowsChange]);

  // Coordinate transforms
  const toPixels = useCallback((x, y, w, h) => ({
    left: gridSpec.offsetLeft + x * cellSize,
    top: gridSpec.offsetTop + y * cellSize,
    width: w * cellSize,
    height: h * cellSize
  }), [gridSpec.offsetLeft, gridSpec.offsetTop, cellSize]);

  // Drag handling (apply transforms during interaction, commit on mouseup)
  const onDragStart = useCallback((e, id) => {
    if (!isGridReady) return;
    const el = e.currentTarget.closest('[data-window-id]');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setActiveId(id);
    setDragState({ id, startX: e.clientX, startY: e.clientY, originLeft: rect.left, originTop: rect.top });
    e.preventDefault();
  }, [isGridReady]);

  const onResizeStart = useCallback((e, id) => {
    if (!isGridReady) return;
    const el = e.currentTarget.closest('[data-window-id]');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setActiveId(id);
    setResizeState({ id, startX: e.clientX, startY: e.clientY, originW: rect.width, originH: rect.height });
    e.preventDefault();
  }, [isGridReady]);

  useEffect(() => {
    if (!dragState && !resizeState) return;
    const onMove = (e) => {
      if (dragState) {
        const el = document.querySelector(`[data-window-id="${dragState.id}"]`);
        if (!el) return;
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      } else if (resizeState) {
        const el = document.querySelector(`[data-window-id="${resizeState.id}"]`);
        if (!el) return;
        const dx = e.clientX - resizeState.startX;
        const dy = e.clientY - resizeState.startY;
        const resizing = packed.find((w) => w.id === resizeState.id);
        if (!resizing) return;
        const targetWpx = Math.max(1, resizeState.originW + dx);
        const targetHpx = Math.max(1, resizeState.originH + dy);
        const reqW = Math.max(1, Math.round(targetWpx / cellSize));
        const reqH = Math.max(1, Math.round(targetHpx / cellSize));
        const minW = Math.max(1, resizing.minWidth || 1);
        const minH = Math.max(1, resizing.minHeight || 1);
        const allowed = computeAllowedSize(resizing.x, resizing.y, reqW, reqH, minW, minH, resizing.id);
        el.style.width = `${allowed.width * cellSize}px`;
        el.style.height = `${allowed.height * cellSize}px`;
      }
    };
    const onUp = (e) => {
      if (dragState) {
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        const moved = packed.find((w) => w.id === dragState.id);
        if (moved) {
          const px = toPixels(moved.x, moved.y, moved.width, moved.height);
          const newLeft = px.left + dx - gridSpec.offsetLeft;
          const newTop = px.top + dy - gridSpec.offsetTop;
          const targetX = Math.max(0, Math.min(gridSpec.cols - moved.width, Math.round(newLeft / cellSize)));
          const targetY = Math.max(0, Math.min(gridSpec.rows - moved.height, Math.round(newTop / cellSize)));
          const pos = findNearestValidPosition(targetX, targetY, moved.width, moved.height, moved.id);
          const updated = packed.map((w) => (w.id === moved.id ? { ...w, x: pos.x, y: pos.y } : w));
          onWindowsChange?.((prev) => prev.map((w) => (w.id === moved.id ? { ...w, x: pos.x, y: pos.y } : w)));
          setPacked(updated);
        }
      } else if (resizeState) {
        const resized = packed.find((w) => w.id === resizeState.id);
        if (resized) {
          const el = document.querySelector(`[data-window-id="${resizeState.id}"]`);
          const rect = el?.getBoundingClientRect();
          const minWpx = Math.max(1, resized.minWidth || 1) * cellSize;
          const minHpx = Math.max(1, resized.minHeight || 1) * cellSize;
          // Visual clamp while resizing so it can't invert into itself
          if (el) {
            const liveW = Math.max(minWpx, Math.round((rect?.width || 0)));
            const liveH = Math.max(minHpx, Math.round((rect?.height || 0)));
            el.style.width = `${liveW}px`;
            el.style.height = `${liveH}px`;
          }
          const reqW = Math.max(1, Math.round((rect?.width || 0) / cellSize));
          const reqH = Math.max(1, Math.round((rect?.height || 0) / cellSize));
          const minW = Math.max(1, resized.minWidth || 1);
          const minH = Math.max(1, resized.minHeight || 1);
          const allowed = computeAllowedSize(resized.x, resized.y, reqW, reqH, minW, minH, resized.id);
          let newX = resized.x;
          let newY = resized.y;
          if (isCollision(newX, newY, allowed.width, allowed.height, resized.id)) {
            const pos = findNearestValidPosition(newX, newY, allowed.width, allowed.height, resized.id);
            newX = pos.x; newY = pos.y;
          }
          const updated = packed.map((w) => (w.id === resized.id ? { ...w, x: newX, y: newY, width: allowed.width, height: allowed.height } : w));
          onWindowsChange?.((prev) => prev.map((w) => (w.id === resized.id ? { ...w, x: newX, y: newY, width: allowed.width, height: allowed.height } : w)));
          setPacked(updated);
        }
      }
      setActiveId(null);
      setDragState(null);
      setResizeState(null);
      const els = document.querySelectorAll('[data-window-id]');
      els.forEach((el) => { el.style.transform = 'translate(0px, 0px)'; });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragState, resizeState, packed, toPixels, gridSpec.cols, gridSpec.rows, gridSpec.offsetLeft, gridSpec.offsetTop, cellSize, onWindowsChange]);

  // UI styles
  const containerStyle = useMemo(() => ({
    position: 'relative',
    width: '100%',
    height: '100%',
    overflowX: gridSpec.overflowX && allowOverflowScroll ? 'auto' : 'hidden',
    overflowY: gridSpec.overflowY && allowOverflowScroll ? 'auto' : 'hidden',
    scrollbarGutter: 'stable both-edges'
  }), [gridSpec.overflowX, gridSpec.overflowY, allowOverflowScroll]);

  const gridStyle = useMemo(() => ({
    position: 'absolute',
    left: `${centerGrid ? gridSpec.offsetLeft : 0}px`,
    top: `${centerGrid ? gridSpec.offsetTop : 0}px`,
    width: `${gridSpec.innerW}px`,
    height: `${gridSpec.innerH}px`,
    opacity: 0.2,
    border: '2px solid #3b82f6',
    pointerEvents: 'none'
  }), [centerGrid, gridSpec.offsetLeft, gridSpec.offsetTop, gridSpec.innerW, gridSpec.innerH]);

  // Default factory for creating a window from a type
  const defaultWindowFactory = useMemo(() => (type) => {
    const color = type === 'green' ? '#22c55e' : type === 'red' ? '#ef4444' : '#3b82f6';
    const title = type === 'green' ? 'Green Window' : type === 'red' ? 'Red Window' : 'Blue Window';
    return {
      title,
      color,
      width: 10,
      height: 8,
      minWidth: 5,
      minHeight: 4,
      content: (
        <div className="font-gothic font-medium text-md p-2 text-neutral-500">
          {`Hello from ${title}`}
        </div>
      )
    };
  }, []);

  // Handle external drop to create new windows via menu drag-and-drop
  const handleExternalDrop = useCallback((e) => {
    e.preventDefault();
    if (!isGridReady || !containerRef.current) return;
    const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    let payload = {};
    try { payload = JSON.parse(raw); } catch {}
    const type = payload?.type || 'blue';

    const rect = containerRef.current.getBoundingClientRect();
    const scrollX = containerRef.current.scrollLeft || 0;
    const scrollY = containerRef.current.scrollTop || 0;
    const clientX = e.clientX - rect.left + scrollX;
    const clientY = e.clientY - rect.top + scrollY;
    const base = (windowFactory || defaultWindowFactory)(type);

    let x; let y; let width; let height;
    if (dragPreview) {
      width = Math.max(1, dragPreview.width);
      height = Math.max(1, dragPreview.height);
      const pos = findNearestValidPosition(dragPreview.x, dragPreview.y, width, height);
      x = Math.max(0, Math.min(gridSpec.cols - width, pos.x));
      y = Math.max(0, Math.min(gridSpec.rows - height, pos.y));
    } else {
      const centerX = (clientX - gridSpec.offsetLeft) / cellSize;
      const centerY = (clientY - gridSpec.offsetTop) / cellSize;
      const startX = Math.max(0, Math.round(centerX - base.width / 2));
      const startY = Math.max(0, Math.round(centerY - base.height / 2));
      const minW = Math.max(1, base.minWidth || 1);
      const minH = Math.max(1, base.minHeight || 1);
      const allowed = computeAllowedSize(startX, startY, base.width, base.height, minW, minH);
      const pos = findNearestValidPosition(startX, startY, allowed.width, allowed.height);
      width = allowed.width; height = allowed.height;
      x = Math.max(0, Math.min(gridSpec.cols - width, pos.x));
      y = Math.max(0, Math.min(gridSpec.rows - height, pos.y));
    }

    const win = {
      ...base,
      id: `win_${Date.now()}`,
      x,
      y,
      width,
      height
    };
    onWindowsChange?.((prev) => [...prev, win]);
    setPacked((prev) => [...prev, win]);
    setDragPreview(null);
  }, [isGridReady, gridSpec.cols, gridSpec.rows, gridSpec.offsetLeft, gridSpec.offsetTop, cellSize, windowFactory, defaultWindowFactory, computeAllowedSize, findNearestValidPosition, onWindowsChange, dragPreview]);

  // Compute and show ghost window while dragging over the grid
  const handleExternalDragOver = useCallback((e) => {
    if (!isGridReady || !containerRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    let payload = {};
    try { payload = JSON.parse(raw); } catch {}
    const type = payload?.type || 'blue';

    const rect = containerRef.current.getBoundingClientRect();
    const scrollX = containerRef.current.scrollLeft || 0;
    const scrollY = containerRef.current.scrollTop || 0;
    const clientX = e.clientX - rect.left + scrollX;
    const clientY = e.clientY - rect.top + scrollY;
    const base = (windowFactory || defaultWindowFactory)(type);
    const centerX = (clientX - gridSpec.offsetLeft) / cellSize;
    const centerY = (clientY - gridSpec.offsetTop) / cellSize;
    const startX = Math.max(0, Math.round(centerX - base.width / 2));
    const startY = Math.max(0, Math.round(centerY - base.height / 2));
    const minW = Math.max(1, base.minWidth || 1);
    const minH = Math.max(1, base.minHeight || 1);
    const allowed = computeAllowedSize(startX, startY, base.width, base.height, minW, minH);
    const pos = findNearestValidPosition(startX, startY, allowed.width, allowed.height);
    const x = Math.max(0, Math.min(gridSpec.cols - allowed.width, pos.x));
    const y = Math.max(0, Math.min(gridSpec.rows - allowed.height, pos.y));

    setDragPreview({ x, y, width: allowed.width, height: allowed.height, color: base.color });
  }, [isGridReady, gridSpec.cols, gridSpec.rows, gridSpec.offsetLeft, gridSpec.offsetTop, cellSize, windowFactory, defaultWindowFactory, computeAllowedSize, findNearestValidPosition]);

  const handleExternalDragLeave = useCallback(() => {
    setDragPreview(null);
  }, []);

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onDragOver={handleExternalDragOver}
      onDragEnter={handleExternalDragOver}
      onDragLeave={handleExternalDragLeave}
      onDrop={handleExternalDrop}
    >
      {isGridReady && (
        <>
          <div style={gridStyle}>
            <svg width="100%" height="100%">
              {Array.from({ length: gridSpec.cols + 1 }).map((_, i) => (
                <line key={`v-${i}`} x1={i * cellSize} y1={0} x2={i * cellSize} y2={gridSpec.rows * cellSize} stroke="#3b82f6" strokeWidth="1" />
              ))}
              {Array.from({ length: gridSpec.rows + 1 }).map((_, i) => (
                <line key={`h-${i}`} x1={0} y1={i * cellSize} x2={gridSpec.cols * cellSize} y2={i * cellSize} stroke="#3b82f6" strokeWidth="1" />
              ))}
            </svg>
          </div>
          {dragPreview && (() => {
            const px = toPixels(dragPreview.x, dragPreview.y, dragPreview.width, dragPreview.height);
            return (
              <div
                style={{
                  position: 'absolute',
                  left: px.left,
                  top: px.top,
                  width: px.width,
                  height: px.height,
                  backgroundColor: dragPreview.color || '#3b82f6',
                  opacity: 0.18,
                  border: `2px dashed ${dragPreview.color || '#3b82f6'}`,
                  borderRadius: 6,
                  pointerEvents: 'none',
                  zIndex: 5
                }}
              />
            );
          })()}
          {packed.map((w) => {
            const px = toPixels(w.x, w.y, w.width, w.height);
            return (
              <Window
                key={w.id}
                id={w.id}
                title={w.title}
                color={w.color}
                left={px.left}
                top={px.top}
                width={px.width}
                height={px.height}
                isFullscreen={false}
                zIndex={activeId === w.id ? 10 : 1}
                onMinimize={(id) => {
                  const minimized = packed.map((x) => (x.id === id ? { ...x, width: Math.max(1, x.minWidth || 1), height: Math.max(1, x.minHeight || 1) } : x));
                  onWindowsChange?.((prev) => prev.map((p) => (p.id === id ? { ...p, width: Math.max(1, p.minWidth || 1), height: Math.max(1, p.minHeight || 1) } : p)));
                  setPacked(minimized);
                }}
                onMaximize={(id) => {
                  const target = packed.find((tw) => tw.id === id);
                  if (!target) return;
                  // Expand left and up first
                  let newX = target.x;
                  let newY = target.y;
                  // move left while no collision and within bounds
                  while (newX > 0 && !isCollision(newX - 1, newY, target.width, target.height, id)) newX -= 1;
                  // move up while no collision and within bounds
                  while (newY > 0 && !isCollision(newX, newY - 1, target.width, target.height, id)) newY -= 1;
                  // then expand right and down to max allowed size
                  let newW = target.width;
                  let newH = target.height;
                  const minW = Math.max(1, target.minWidth || 1);
                  const minH = Math.max(1, target.minHeight || 1);
                  // grow width
                  while (newX + newW < gridSpec.cols && !isCollision(newX, newY, newW + 1, newH, id)) newW += 1;
                  // grow height
                  while (newY + newH < gridSpec.rows && !isCollision(newX, newY, newW, newH + 1, id)) newH += 1;
                  newW = Math.max(minW, newW);
                  newH = Math.max(minH, newH);
                  const updated = packed.map((x) => (x.id === id ? { ...x, x: newX, y: newY, width: newW, height: newH } : x));
                  onWindowsChange?.((prev) => prev.map((p) => (p.id === id ? { ...p, x: newX, y: newY, width: newW, height: newH } : p)));
                  setPacked(updated);
                }}
                onFullscreen={() => {}}
                onClose={(id) => {
                  onWindowsChange?.((prev) => prev.filter((p) => p.id !== id));
                }}
                onDragStart={onDragStart}
                onResizeStart={onResizeStart}
              >
                {w.content}
              </Window>
            );
          })}
        </>
      )}
    </div>
  );
});

export default BinPackingLayout;


