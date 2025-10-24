import React from 'react';

const WindowMenu = () => {
  const handleDragStart = (type) => (e) => {
    try {
      e.dataTransfer.setData('application/json', JSON.stringify({ type }));
    } catch {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type }));
    }
    e.dataTransfer.effectAllowed = 'copy';
  };

  const itemBase = 'cursor-move select-none text-white px-3 py-2 rounded shadow-sm font-gothic text-sm';

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-gray-500 mr-2 font-gothic">Drag into grid:</div>
      <div
        draggable
        onDragStart={handleDragStart('blue')}
        className={`${itemBase} bg-blue-500 hover:bg-blue-600`}
      >
        Blue
      </div>
      <div
        draggable
        onDragStart={handleDragStart('green')}
        className={`${itemBase} bg-green-500 hover:bg-green-600`}
      >
        Green
      </div>
      <div
        draggable
        onDragStart={handleDragStart('red')}
        className={`${itemBase} bg-red-500 hover:bg-red-600`}
      >
        Red
      </div>
    </div>
  );
};

export default WindowMenu;


