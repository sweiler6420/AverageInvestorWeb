import { packSkyline, estimateRowsForMinimums } from './algorithms/skyline';

// WindowManager: reflow windows deterministically given grid spec and constraints.

export function clampWindowToBounds(win, cols, rows) {
  const width = Math.min(win.width, cols);
  const height = Math.min(win.height, rows);
  const x = Math.min(Math.max(0, win.x), Math.max(0, cols - width));
  const y = Math.min(Math.max(0, win.y), Math.max(0, rows - height));
  return { ...win, x, y, width, height };
}

export function computeMinimumFootprint(windows) {
  const minCols = windows.reduce((s, w) => s + Math.max(1, w.minWidth || 1), 0);
  const maxMinHeight = windows.reduce((m, w) => Math.max(m, Math.max(1, w.minHeight || 1)), 1);
  return { minCols, minRows: maxMinHeight };
}

export function conservativeReflow(windows, cols) {
  // collapse gaps with skyline without changing sizes
  const items = windows.map((w) => ({ id: w.id, width: w.width, height: w.height }));
  const { placed, requiredRows } = packSkyline(items, cols);
  const byId = new Map(windows.map((w) => [w.id, w]));
  return {
    next: placed.map((p) => ({ ...byId.get(p.id), x: p.x, y: p.y })),
    requiredRows
  };
}

export function scaleToFitIfNeeded(windows, cols, currentRequiredRows) {
  // If rows required are too large compared to available rows, attempt proportional scaling
  // Here we only compute the scaling factor across widths first (height scaling left for container rows growth)
  const totalWidth = windows.reduce((s, w) => s + w.width, 0);
  if (totalWidth <= cols) return windows;
  const factor = cols / totalWidth;
  return windows.map((w) => {
    const scaledW = Math.max(w.minWidth || 1, Math.floor(w.width * factor));
    return { ...w, width: Math.max(1, scaledW) };
  });
}

export function reflowWindows({ windows, cols, rows, strategy = 'conservative' }) {
  if (!Array.isArray(windows)) return { next: [], requiredRows: 0 };
  const clamped = windows.map((w) => ({
    ...w,
    width: Math.max(1, Math.min(w.width, cols)),
    height: Math.max(1, w.height),
    minWidth: Math.max(1, w.minWidth || 1),
    minHeight: Math.max(1, w.minHeight || 1)
  }));

  // Step 1: conservative collapse without scaling
  let { next, requiredRows } = conservativeReflow(clamped, cols);

  // Step 2: If required rows blow past available rows (when constraining), try scale widths proportionally
  if (strategy !== 'aggressive') {
    if (rows && requiredRows > rows) {
      const scaled = scaleToFitIfNeeded(next, cols, requiredRows);
      const again = conservativeReflow(scaled, cols);
      next = again.next;
      requiredRows = again.requiredRows;
    }
  }

  // Step 3: Ensure min sizes
  next = next.map((w) => ({
    ...w,
    width: Math.max(w.minWidth, w.width),
    height: Math.max(w.minHeight, w.height)
  }));

  // Step 4: Clamp to bounds
  next = next.map((w) => clampWindowToBounds(w, cols, Math.max(rows || requiredRows, 1)));

  return { next, requiredRows };
}

export function estimateMinimumFootprintRows(windows, cols) {
  return estimateRowsForMinimums(windows, cols);
}

// ---------- Position-preserving reflow with spiral search ----------

function overlaps(a, b) {
  return !(a.x >= b.x + b.width || a.x + a.width <= b.x || a.y >= b.y + b.height || a.y + a.height <= b.y);
}

function canPlace(x, y, width, height, cols, rows, placed) {
  if (x < 0 || y < 0) return false;
  if (x + width > cols) return false;
  if (y + height > rows) return false;
  const candidate = { x, y, width, height };
  for (let i = 0; i < placed.length; i += 1) {
    if (overlaps(candidate, placed[i])) return false;
  }
  return true;
}

function spiralSearch(startX, startY, width, height, cols, rows, placed) {
  // Try the intended position first
  if (canPlace(startX, startY, width, height, cols, rows, placed)) return { x: startX, y: startY };
  const maxRadius = Math.max(cols, rows);
  for (let r = 1; r <= maxRadius; r += 1) {
    for (let dx = -r; dx <= r; dx += 1) {
      for (let dy = -r; dy <= r; dy += 1) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue; // only the ring
        const x = startX + dx;
        const y = startY + dy;
        if (canPlace(x, y, width, height, cols, rows, placed)) return { x, y };
      }
    }
  }
  // Fallback: clamp to grid if nothing found (should be rare if space exists)
  const clampedX = Math.max(0, Math.min(startX, cols - width));
  const clampedY = Math.max(0, Math.min(startY, rows - height));
  return { x: clampedX, y: clampedY };
}

/**
 * Reflow that preserves user-placed windows. Pinned windows are placed first and never moved.
 * Other windows are placed via spiral search near their current positions.
 */
export function reflowPreserve({ windows, cols, rows, pinIds = [] }) {
  if (!Array.isArray(windows)) return { next: [], requiredRows: rows || 0 };
  const normalized = windows.map((w) => ({
    ...w,
    width: Math.max(1, Math.min(w.width, cols)),
    height: Math.max(1, w.height),
    minWidth: Math.max(1, w.minWidth || 1),
    minHeight: Math.max(1, w.minHeight || 1),
    x: Math.max(0, Math.min(w.x || 0, Math.max(0, cols - Math.max(1, Math.min(w.width, cols))))) ,
    y: Math.max(0, Math.min(w.y || 0, Math.max(0, (rows || 1) - Math.max(1, w.height))))
  }));

  const pinned = normalized.filter((w) => pinIds.includes(w.id) || w.locked);
  const others = normalized.filter((w) => !pinIds.includes(w.id) && !w.locked);

  // Place pinned first (exact positions), clamped to bounds
  const placed = [];
  for (const p of pinned) {
    const width = Math.max(p.minWidth, p.width);
    const height = Math.max(p.minHeight, p.height);
    const x = Math.max(0, Math.min(p.x, cols - width));
    const y = Math.max(0, Math.min(p.y, rows - height));
    const fixed = { ...p, x, y, width, height };
    // If collision among pinned, we allow overlap resolution by nudging later; prefer last placement wins
    placed.push(fixed);
  }

  // Resolve pinned-pinned collisions (rare): nudge later ones minimally
  for (let i = 0; i < placed.length; i += 1) {
    for (let j = 0; j < i; j += 1) {
      if (overlaps(placed[i], placed[j])) {
        const { x, y } = spiralSearch(placed[i].x, placed[i].y, placed[i].width, placed[i].height, cols, rows, placed.slice(0, i));
        placed[i] = { ...placed[i], x, y };
      }
    }
  }

  // Place others using spiral search near their current positions
  for (const w of others) {
    const width = Math.max(w.minWidth, w.width);
    const height = Math.max(w.minHeight, w.height);
    const startX = Math.max(0, Math.min(w.x, cols - width));
    const startY = Math.max(0, Math.min(w.y, rows - height));
    const { x, y } = spiralSearch(startX, startY, width, height, cols, rows, placed);
    placed.push({ ...w, x, y, width, height });
  }

  return { next: placed, requiredRows: rows || placed.reduce((m, w) => Math.max(m, w.y + w.height), 0) };
}

// Reflow that prefers scaling windows down (respecting min sizes) before moving them.
export function reflowScaleFirst({ windows, cols, rows }) {
  if (!Array.isArray(windows)) return { next: [], requiredRows: rows || 0 };
  const normalized = windows.map((w) => ({
    ...w,
    width: Math.max(1, Math.min(w.width, cols)),
    height: Math.max(1, w.height),
    minWidth: Math.max(1, w.minWidth || 1),
    minHeight: Math.max(1, w.minHeight || 1),
    x: Math.max(0, Math.min(w.x || 0, Math.max(0, cols - Math.max(1, Math.min(w.width, cols))))) ,
    y: Math.max(0, Math.min(w.y || 0, Math.max(0, (rows || 1) - Math.max(1, w.height))))
  }));

  const sorted = [...normalized].sort((a, b) => (a.y - b.y) || (a.x - b.x));
  const placed = [];

  function tryShrinkToResolve(curr) {
    // Ensure within bounds first
    if (curr.x + curr.width > cols) curr.width = Math.max(curr.minWidth, cols - curr.x);
    if (curr.y + curr.height > rows) curr.height = Math.max(curr.minHeight, rows - curr.y);

    let guard = 0;
    while (guard < 200) {
      guard += 1;
      let collidedWith = null;
      for (let i = 0; i < placed.length; i += 1) {
        if (overlaps(curr, placed[i])) { collidedWith = placed[i]; break; }
      }
      const outRight = curr.x + curr.width > cols;
      const outBottom = curr.y + curr.height > rows;
      if (!collidedWith && !outRight && !outBottom) break;

      // Prefer shrinking over moving
      if (outRight && curr.width > curr.minWidth) { curr.width = Math.max(curr.minWidth, cols - curr.x); continue; }
      if (outBottom && curr.height > curr.minHeight) { curr.height = Math.max(curr.minHeight, rows - curr.y); continue; }

      if (collidedWith) {
        const dxLeft = (curr.x + curr.width) - collidedWith.x; // overlap if positive when curr on left
        const dxRight = (collidedWith.x + collidedWith.width) - curr.x; // when curr on right
        const dyTop = (curr.y + curr.height) - collidedWith.y;
        const dyBottom = (collidedWith.y + collidedWith.height) - curr.y;
        const overlapX = Math.min(dxLeft, dxRight);
        const overlapY = Math.min(dyTop, dyBottom);
        // Reduce the smaller overlap axis first
        if (overlapX <= overlapY && curr.width > curr.minWidth) {
          curr.width = Math.max(curr.minWidth, curr.width - Math.max(1, overlapX));
          continue;
        }
        if (overlapY < overlapX && curr.height > curr.minHeight) {
          curr.height = Math.max(curr.minHeight, curr.height - Math.max(1, overlapY));
          continue;
        }
      }
      // If cannot shrink anymore, break to fallback move
      break;
    }
    return curr;
  }

  for (let i = 0; i < sorted.length; i += 1) {
    let curr = { ...sorted[i] };
    // Clamp basics
    curr.width = Math.max(curr.minWidth, Math.min(curr.width, cols - curr.x));
    curr.height = Math.max(curr.minHeight, Math.min(curr.height, rows - curr.y));

    curr = tryShrinkToResolve(curr);

    // If still colliding, fallback to spiral placement near original position
    if (!canPlace(curr.x, curr.y, curr.width, curr.height, cols, rows, placed)) {
      const pos = spiralSearch(curr.x, curr.y, curr.width, curr.height, cols, rows, placed);
      curr.x = pos.x; curr.y = pos.y;
      // After moving, ensure bounds again (rare)
      curr.width = Math.max(curr.minWidth, Math.min(curr.width, cols - curr.x));
      curr.height = Math.max(curr.minHeight, Math.min(curr.height, rows - curr.y));
    }
    placed.push(curr);
  }

  return { next: placed, requiredRows: rows || placed.reduce((m, w) => Math.max(m, w.y + w.height), 0) };
}

// Reflow that shrinks only by exact boundary/collision overlap (per grid line lost),
// then moves minimally if still necessary.
export function reflowScaleByOverlap({ windows, cols, rows }) {
  if (!Array.isArray(windows)) return { next: [], requiredRows: rows || 0 };
  const normalized = windows.map((w) => ({
    ...w,
    width: Math.max(1, Math.min(w.width, cols)),
    height: Math.max(1, w.height),
    minWidth: Math.max(1, w.minWidth || 1),
    minHeight: Math.max(1, w.minHeight || 1),
    x: Math.max(0, Math.min(w.x || 0, Math.max(0, cols - Math.max(1, Math.min(w.width, cols))))) ,
    y: Math.max(0, Math.min(w.y || 0, Math.max(0, (rows || 1) - Math.max(1, w.height))))
  }));

  const sorted = [...normalized].sort((a, b) => (a.y - b.y) || (a.x - b.x));
  const placed = [];

  for (let i = 0; i < sorted.length; i += 1) {
    let curr = { ...sorted[i] };
    // Boundary overlap shrink only by overflow amount
    const overRight = Math.max(0, (curr.x + curr.width) - cols);
    if (overRight > 0) curr.width = Math.max(curr.minWidth, curr.width - overRight);
    const overBottom = Math.max(0, (curr.y + curr.height) - rows);
    if (overBottom > 0) curr.height = Math.max(curr.minHeight, curr.height - overBottom);
    // After shrink, clamp position if still out of bounds due to min sizes
    if (curr.x + curr.width > cols) curr.x = Math.max(0, cols - curr.width);
    if (curr.y + curr.height > rows) curr.y = Math.max(0, rows - curr.height);

    // Resolve collisions by shrinking only by exact overlap, then fallback to move
    let collided = true;
    let guard = 0;
    while (collided && guard < 50) {
      guard += 1;
      collided = false;
      for (let j = 0; j < placed.length; j += 1) {
        const other = placed[j];
        if (overlaps(curr, other)) {
          collided = true;
          const overlapX = Math.min(curr.x + curr.width, other.x + other.width) - Math.max(curr.x, other.x);
          const overlapY = Math.min(curr.y + curr.height, other.y + other.height) - Math.max(curr.y, other.y);
          // Choose axis with smaller overlap; shrink both sides minimally by just the overlap amount
          if (overlapX <= overlapY) {
            const need = Math.ceil(overlapX);
            const currCap = curr.width - curr.minWidth;
            const otherCap = other.width - other.minWidth;
            let takeCurr = Math.min(Math.ceil(need / 2), Math.max(0, currCap));
            let takeOther = need - takeCurr;
            if (takeOther > otherCap) {
              takeCurr = Math.min(need - otherCap, currCap);
              takeOther = need - takeCurr;
            }
            if (takeCurr > 0) curr.width -= takeCurr;
            if (takeOther > 0) placed[j] = { ...other, width: other.width - takeOther };
          } else {
            const need = Math.ceil(overlapY);
            const currCap = curr.height - curr.minHeight;
            const otherCap = other.height - other.minHeight;
            let takeCurr = Math.min(Math.ceil(need / 2), Math.max(0, currCap));
            let takeOther = need - takeCurr;
            if (takeOther > otherCap) {
              takeCurr = Math.min(need - otherCap, currCap);
              takeOther = need - takeCurr;
            }
            if (takeCurr > 0) curr.height -= takeCurr;
            if (takeOther > 0) placed[j] = { ...other, height: other.height - takeOther };
          }
          // If no shrink possible on either, move minimally
          if (overlaps(curr, placed[j])) {
            const pos = spiralSearch(curr.x, curr.y, curr.width, curr.height, cols, rows, placed);
            curr.x = pos.x; curr.y = pos.y;
          }
          // After each change, re-clamp within bounds
          if (curr.x + curr.width > cols) curr.x = Math.max(0, cols - curr.width);
          if (curr.y + curr.height > rows) curr.y = Math.max(0, rows - curr.height);
          // break to re-evaluate against placed from start
          break;
        }
      }
    }

    // Final fallback if still colliding due to geometry
    if (!canPlace(curr.x, curr.y, curr.width, curr.height, cols, rows, placed)) {
      const pos = spiralSearch(curr.x, curr.y, curr.width, curr.height, cols, rows, placed);
      curr.x = pos.x; curr.y = pos.y;
      curr.width = Math.max(curr.minWidth, Math.min(curr.width, cols - curr.x));
      curr.height = Math.max(curr.minHeight, Math.min(curr.height, rows - curr.y));
    }

    placed.push(curr);
  }

  return { next: placed, requiredRows: rows || placed.reduce((m, w) => Math.max(m, w.y + w.height), 0) };
}

// Compute arrangement-driven minimum columns/rows so the grid does not shrink below
// what is needed to keep all windows at or above their min sizes without vertical/horizontal shifts.
export function computeArrangementMinimums(windows) {
  if (!Array.isArray(windows) || windows.length === 0) return { minCols: 0, minRows: 0 };
  const W = windows.map((w) => ({
    x: Math.max(0, w.x || 0),
    y: Math.max(0, w.y || 0),
    width: Math.max(1, w.width || 1),
    height: Math.max(1, w.height || 1),
    minWidth: Math.max(1, w.minWidth || 1),
    minHeight: Math.max(1, w.minHeight || 1)
  }));

  const yEdges = new Set();
  const xEdges = new Set();
  for (const w of W) {
    yEdges.add(w.y);
    yEdges.add(w.y + w.height);
    xEdges.add(w.x);
    xEdges.add(w.x + w.width);
  }
  const yPoints = Array.from(yEdges).sort((a, b) => a - b);
  const xPoints = Array.from(xEdges).sort((a, b) => a - b);

  let minCols = 0;
  for (let i = 0; i < yPoints.length - 1; i += 1) {
    const y0 = yPoints[i];
    const y1 = yPoints[i + 1];
    if (y1 <= y0) continue;
    const active = W.filter((w) => w.y < y1 && (w.y + w.height) > y0);
    const sumMinW = active.reduce((s, w) => s + w.minWidth, 0);
    if (sumMinW > minCols) minCols = sumMinW;
  }

  let minRows = 0;
  for (let i = 0; i < xPoints.length - 1; i += 1) {
    const x0 = xPoints[i];
    const x1 = xPoints[i + 1];
    if (x1 <= x0) continue;
    const active = W.filter((w) => w.x < x1 && (w.x + w.width) > x0);
    const sumMinH = active.reduce((s, w) => s + w.minHeight, 0);
    if (sumMinH > minRows) minRows = sumMinH;
  }

  return { minCols, minRows };
}


