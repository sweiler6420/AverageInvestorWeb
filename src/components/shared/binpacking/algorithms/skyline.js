// Deterministic Skyline bin-packing heuristic operating in grid units.
// Uses a per-column height array (heights[col] => current filled height in rows).
// Placement scans x from 0..(cols - width) and chooses the span with minimal resulting y,
// then minimal x; ties resolved by input order to ensure determinism.

/**
 * Packs windows into a grid with the Skyline heuristic.
 * @param {Array<{id:string,width:number,height:number}>} items - items sized in grid cells
 * @param {number} cols - number of columns available
 * @param {number} startOrderSeed - optional; used only for tie-breaking stability
 * @returns {{placed:Array<{id:string,x:number,y:number,width:number,height:number}>, requiredRows:number}}
 */
export function packSkyline(items, cols, startOrderSeed = 0) {
  const heights = new Array(Math.max(1, cols)).fill(0);
  const placed = [];

  function spanMaxY(x, w) {
    let maxY = 0;
    for (let i = x; i < x + w; i += 1) {
      const h = heights[i] ?? 0;
      if (h > maxY) maxY = h;
    }
    return maxY;
  }

  function commit(x, w, h, y) {
    const baseY = y != null ? y : spanMaxY(x, w);
    const newH = baseY + h;
    for (let i = x; i < x + w; i += 1) heights[i] = newH;
    return baseY;
  }

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const width = Math.min(Math.max(1, Math.floor(item.width)), cols);
    const height = Math.max(1, Math.floor(item.height));

    let bestX = 0;
    let bestY = Number.POSITIVE_INFINITY;
    for (let x = 0; x <= cols - width; x += 1) {
      const y = spanMaxY(x, width);
      if (y < bestY) {
        bestY = y;
        bestX = x;
      }
    }

    const yCommitted = commit(bestX, width, height, bestY);
    placed.push({ id: item.id, x: bestX, y: yCommitted, width, height });
  }

  const requiredRows = heights.reduce((m, v) => (v > m ? v : m), 0);
  return { placed, requiredRows };
}

/**
 * Attempts to pack minimum sizes (minWidth/minHeight) first to derive minimal rows
 * needed to satisfy constraints for the current column count.
 * @param {Array<{id:string,minWidth:number,minHeight:number}>} items
 * @param {number} cols
 * @returns {number} requiredRows
 */
export function estimateRowsForMinimums(items, cols) {
  const minima = items.map((w) => ({ id: w.id, width: Math.max(1, w.minWidth || 1), height: Math.max(1, w.minHeight || 1) }));
  const { requiredRows } = packSkyline(minima, cols);
  return requiredRows;
}


