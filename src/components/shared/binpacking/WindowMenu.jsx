import React from 'react';

// items: Array<{ name: string, color: string, window: object }>
const WindowMenu = ({ items = [] }) => {
  const handleDragStart = (item) => (e) => {
    // Stash the full window definition (including React nodes) in a global for this drag
    try { window.__BINPACKING_DRAG = item.window; } catch {}
    try {
      e.dataTransfer.setData('application/json', JSON.stringify({ name: item.name }));
    } catch {
      e.dataTransfer.setData('text/plain', JSON.stringify({ name: item.name }));
    }
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    if (window.__BINPACKING_DRAG) window.__BINPACKING_DRAG = null;
  };

  const itemBase = 'cursor-move select-none text-white px-3 py-2 rounded shadow-sm font-demi text-sm';

  return (
    <div className="flex items-center gap-2">
      <div className="font-gothic font-medium text-md font-neutral-500 mr-2">Drag into grid:</div>
      {items.map((item, idx) => (
        <div
          key={idx}
          draggable
          onDragStart={handleDragStart(item)}
          onDragEnd={handleDragEnd}
          className={itemBase}
          style={{ backgroundColor: item.color }}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
};

export default WindowMenu;


