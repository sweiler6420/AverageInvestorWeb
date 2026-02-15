// GridManager: measures the container, computes centered grid spec using equal-spacing rule,
// and emits updates via a debounced ResizeObserver.

export function computeGridSpec(containerW, containerH, cellSize, minCols, minRows) {
  const cols = Math.max(minCols, Math.floor(containerW / cellSize));
  const rows = Math.max(minRows, Math.floor(containerH / cellSize));
  const innerW = cols * cellSize;
  const innerH = rows * cellSize;
  const offsetLeft = Math.max(0, Math.floor((containerW - innerW) / 2));
  const offsetTop = Math.max(0, Math.floor((containerH - innerH) / 2));
  return { cols, rows, innerW, innerH, offsetLeft, offsetTop };
}

export function computeGridSpecWithMinimumFootprint(containerW, containerH, cellSize, minCols, minRows, minFootCols, minFootRows) {
  const requiredCols = Math.max(minCols, minFootCols);
  const requiredRows = Math.max(minRows, minFootRows);
  const innerW = requiredCols * cellSize;
  const innerH = requiredRows * cellSize;
  const fitsW = innerW <= containerW;
  const fitsH = innerH <= containerH;
  const cols = fitsW ? requiredCols : requiredCols; // columns are dictated by required footprint
  const rows = fitsH ? requiredRows : requiredRows;
  const offsetLeft = fitsW ? Math.max(0, Math.floor((containerW - innerW) / 2)) : 0;
  const offsetTop = fitsH ? Math.max(0, Math.floor((containerH - innerH) / 2)) : 0;
  return { cols, rows, innerW, innerH, offsetLeft, offsetTop, overflow: !(fitsW && fitsH) };
}

export function createResizeObserver(targetEl, callback, debounceMs = 100) {
  if (!targetEl) return { disconnect: () => {} };
  let rafId = null;
  let last = 0;
  const ro = new ResizeObserver((entries) => {
    const now = Date.now();
    if (now - last < debounceMs) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        last = Date.now();
        callback(entries[0].contentRect);
      });
      return;
    }
    last = now;
    callback(entries[0].contentRect);
  });
  ro.observe(targetEl);
  return ro;
}


