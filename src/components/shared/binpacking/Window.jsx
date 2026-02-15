import React, { useRef, useEffect } from 'react';

export default function Window({
  id,
  title,
  color,
  left,
  top,
  width,
  height,
  zIndex,
  isFullscreen,
  hidden,
  onMinimize,
  onMaximize,
  onFullscreen,
  onClose,
  onDragStart,
  onResizeStart,
  children
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.transform = 'translate(0px, 0px)';
    }
  }, [left, top]);

  const outerStyle = {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    zIndex: zIndex || 1,
    cursor: 'default',
    display: hidden ? 'none' : undefined
  };

  const innerStyle = {
    width: 'calc(100% - 8px)',
    height: 'calc(100% - 8px)',
    margin: '4px',
    outline: '2px solid rgba(255, 255, 255, 0.29)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(5px)',
    background: 'rgba(59, 130, 246, 0.1)', // fallback; header color is applied separately
    borderRadius: '0.5rem'
  };

  const headerStyle = {
    background: 'rgba(0, 0, 0, 0.2)',
    color: 'white',
    fontSize: '0.875rem',
    padding: '0.5rem 0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: '0.5rem',
    borderTopRightRadius: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const titleStyle = {
    fontFamily: 'AllRoundGothic, ui-sans-serif, system-ui',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const contentWrapper = {
    padding: '0.5rem',
    color: 'white',
    fontSize: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: 'calc(100% - 40px)'
  };

  const contentInner = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0.25rem',
    padding: '0.25rem',
    flex: 1,
    minHeight: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto'
  };

  const resizeHandleStyle = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '1rem',
    height: '1rem',
    cursor: 'se-resize',
    opacity: 0.6
  };

  const controlDot = (bg) => ({
    width: '12px',
    height: '12px',
    background: bg,
    borderRadius: '9999px',
    transition: 'background-color 150ms ease-in-out'
  });

  const handleMouseDown = (e) => {
    if (isFullscreen) return;
    const isButton = e.target.getAttribute('data-role') === 'control';
    const isResize = e.target.getAttribute('data-role') === 'resize-handle' || e.target.closest('[data-role="resize-handle"]');
    if (isButton || isResize) return;
    const headerEl = e.target.closest('[data-role="header"]');
    if (!headerEl) return; // only drag when starting from header
    onDragStart(e, id);
  };

  return (
    <div ref={ref} style={outerStyle} onMouseDown={handleMouseDown} data-window-id={id}>
      <div style={innerStyle}>
        <div data-role="header" style={{ ...headerStyle, background: color || headerStyle.background, cursor: isFullscreen ? 'default' : 'move', userSelect: 'none' }}>
          <span style={titleStyle}>{title}</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button data-role="control" onClick={(e) => { e.stopPropagation(); onMinimize?.(id); }} style={controlDot('#facc15')} title="Minimize" />
            <button data-role="control" onClick={(e) => { e.stopPropagation(); onMaximize?.(id); }} style={controlDot('#22c55e')} title="Maximize" />
            <button data-role="control" onClick={(e) => { e.stopPropagation(); onFullscreen?.(id); }} style={controlDot('#60a5fa')} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} />
            <button data-role="control" onClick={(e) => { e.stopPropagation(); onClose?.(id); }} style={controlDot('#f87171')} title="Close" />
          </div>
        </div>
        <div style={contentWrapper}>
          <div style={contentInner}>
            {children}
          </div>
        </div>
        {!isFullscreen && (
          <div data-role="resize-handle" style={resizeHandleStyle} onMouseDown={(e) => { e.stopPropagation(); onResizeStart?.(e, id); }}>
            {/* visual chevron substitute */}
            <svg width="100%" height="100%" style={{ transform: 'rotate(45deg)' }}>
              <path d="M2 8 L8 2" stroke="white" strokeWidth="2" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}


