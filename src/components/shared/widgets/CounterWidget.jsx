import React, { useState } from 'react';

const CounterWidget = () => {
  const [count, setCount] = useState(0);
  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="text-xs text-neutral-200 font-gothic">Counter</div>
      <div className="flex items-center gap-2">
        <button className="px-2 py-1 bg-neutral-700 text-white rounded" onClick={() => setCount((c) => c - 1)}>-</button>
        <div className="px-3 py-1 bg-neutral-800 text-white rounded min-w-[3rem] text-center">{count}</div>
        <button className="px-2 py-1 bg-neutral-700 text-white rounded" onClick={() => setCount((c) => c + 1)}>+</button>
      </div>
    </div>
  );
};

export default CounterWidget;


