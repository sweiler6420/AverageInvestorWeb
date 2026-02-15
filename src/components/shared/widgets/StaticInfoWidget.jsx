import React from 'react';

const StaticInfoWidget = () => {
  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="text-xs text-neutral-200 font-gothic">Info</div>
      <div className="text-sm text-neutral-100">
        This is a simple static widget. Resize the window to see it scale.
      </div>
    </div>
  );
};

export default StaticInfoWidget;
