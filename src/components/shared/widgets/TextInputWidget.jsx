import React, { useState } from 'react';

const TextInputWidget = () => {
  const [text, setText] = useState('');
  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="text-xs text-neutral-200 font-gothic">Echo Input</div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full px-2 py-1 rounded bg-neutral-100 text-neutral-900 outline-none"
        placeholder="Type here"
      />
      <div className="text-sm text-neutral-100 truncate">Output: {text || '—'}</div>
    </div>
  );
};

export default TextInputWidget;


