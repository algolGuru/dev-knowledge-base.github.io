const FG_COLORS = {
  cyan: '#4fd1c5', amber: '#f6ad55', violet: '#a78bfa',
  rose: '#fb7185', blue: '#60a5fa', green: '#6ee7b7', orange: '#fb923c',
  white: '#e8e6f0'
};

if (window.marked) {
  marked.setOptions({
    gfm: true,
    breaks: true
  });
}

const FG = {
  nodes: [], links: [], nodeMap: {},
  svg: null, animId: null,
  width: 0, height: 0,
  REPULSION: 13000, SPRING_K: 0.035, REST_LEN: 150,
  ROOT_REST_LEN: 160, DAMPING: 0.78, CENTER_K: 0.0012, alphaMin: 0.003,
  alpha: 1,
  dragging: null, dragOX: 0, dragOY: 0,
  highlighted: null,
  // Camera
  viewX: 0, viewY: 0, viewScale: 1,
  VIEW_SCALE_MIN: 0.15, VIEW_SCALE_MAX: 4,
  viewport: null,
  // Pan
  panning: false, _panMoved: false, panStartX: 0, panStartY: 0, panStartVX: 0, panStartVY: 0,
  // Touch pinch
  _pinchDist0: 0, _pinchScale0: 1,
  _pinchVX0: 0, _pinchVY0: 0, _pinchMidX0: 0, _pinchMidY0: 0,
};

function buildTree() {
  const svg = document.getElementById('tree-canvas');
  FG.svg = svg;
  // Fixed large physics world — nodes never hit the boundary.
  // Camera is centered on the world center at startup.
  const WORLD_W = 4000, WORLD_H = 4000;
  FG.width  = WORLD_W;
  FG.height = WORLD_H;
  const vw = window.innerWidth  || 800;
  const vh = (window.innerHeight || 664) - 64;
  const cx = WORLD_W / 2, cy = WORLD_H / 2;

  FG.nodes = []; FG.links = []; FG.nodeMap = {};

  // Root node
  const root = {
    id: '__root__', label: 'Senior Dev', type: 'root', color: 'white',
    x: cx, y: cy, vx: 0, vy: 0, r: 18, pinned: true
  };
  FG.nodes.push(root);
  FG.nodeMap['__root__'] = root;

  // Section + leaf nodes
  DATA.forEach((sec, si) => {
    const angle = (si / DATA.length) * Math.PI * 2 - Math.PI / 2;
    const dist = Math.min(FG.width, FG.height) * 0.28;
    const sNode = {
      id: sec.id, label: sec.title,
      shortLabel: sec.title.length > 22 ? sec.title.slice(0, 21) + '…' : sec.title,
      type: 'section', color: sec.color, sec,
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: 0, vy: 0, r: 11, pinned: false
    };
    FG.nodes.push(sNode);
    FG.nodeMap[sec.id] = sNode;
    FG.links.push({ source: '__root__', target: sec.id, restLen: FG.ROOT_REST_LEN });

    sec.rows.forEach((row, i) => {
      const id = `${sec.id}-${i}`;
      const spread = (Math.random() - 0.5);
      const lNode = {
        id, label: row.topic, row, secId: sec.id,
        shortLabel: row.topic.length > 28 ? row.topic.slice(0, 27) + '…' : row.topic,
        type: 'leaf', color: sec.color,
        x: sNode.x + Math.cos(angle + spread * 1.5) * 80 + (Math.random() - 0.5) * 40,
        y: sNode.y + Math.sin(angle + spread * 1.5) * 80 + (Math.random() - 0.5) * 40,
        vx: 0, vy: 0, r: 5, pinned: false
      };
      FG.nodes.push(lNode);
      FG.nodeMap[id] = lNode;
      FG.links.push({ source: sec.id, target: id, restLen: FG.REST_LEN });
    });
  });

  // Build SVG
  const glowDefs = Object.keys(FG_COLORS).map(name => `
    <filter id="fg-glow-${name}" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b1"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b2"/>
      <feMerge><feMergeNode in="b1"/><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="fg-glow-sm-${name}" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b1"/>
      <feMerge><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`).join('');

  svg.innerHTML = `<defs>${glowDefs}</defs>
  <g id="fg-viewport" transform="translate(0,0) scale(1)">
    <g id="fg-links"></g>
    <g id="fg-nodes"></g>
  </g>`;
  // Center the camera on the physics world center
  FG.viewX = vw / 2 - WORLD_W / 2;
  FG.viewY = vh / 2 - WORLD_H / 2;
  FG.viewScale = 1;
  FG.viewport = svg.querySelector('#fg-viewport');

  const linksG = svg.querySelector('#fg-links');
  const nodesG = svg.querySelector('#fg-nodes');

  // Link elements
  FG.links.forEach(link => {
    const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const srcNode = FG.nodeMap[link.source];
    const isRoot = link.source === '__root__';
    ln.setAttribute('stroke', isRoot ? '#e8e6f0' : FG_COLORS[srcNode.color]);
    ln.setAttribute('stroke-width', isRoot ? '1' : '0.8');
    ln.setAttribute('stroke-opacity', isRoot ? '0.15' : '0.2');
    linksG.appendChild(ln);
    link.el = ln;
  });

  // Node elements
  FG.nodes.forEach(node => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('fg-node-g');
    g.style.cursor = 'pointer';
    g.setAttribute('transform', `translate(${node.x.toFixed(1)},${node.y.toFixed(1)})`);

    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('r', node.r);
    c.setAttribute('fill', FG_COLORS[node.color]);
    c.setAttribute('filter', node.type === 'leaf' ? `url(#fg-glow-sm-${node.color})` : `url(#fg-glow-${node.color})`);
    c.setAttribute('fill-opacity', node.type === 'root' ? '1' : node.type === 'section' ? '0.85' : '0.55');

    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', node.r + 7);
    t.setAttribute('y', '4');
    t.setAttribute('fill', node.type === 'root' ? '#ffffff' : node.type === 'section' ? FG_COLORS[node.color] : '#9895a8');
    t.setAttribute('font-size', node.type === 'root' ? '13' : node.type === 'section' ? '11' : '9');
    t.setAttribute('font-weight', node.type === 'root' ? '600' : node.type === 'section' ? '500' : '400');
    t.setAttribute('font-family', 'JetBrains Mono, monospace');
    t.setAttribute('pointer-events', 'none');
    t.textContent = node.type === 'root' ? node.label : (node.shortLabel || node.label);

    // Pin ring (shown when node is user-pinned)
    const pinRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pinRing.setAttribute('r', node.r + 4);
    pinRing.setAttribute('fill', 'none');
    pinRing.setAttribute('stroke', FG_COLORS[node.color]);
    pinRing.setAttribute('stroke-width', '1.5');
    pinRing.setAttribute('stroke-dasharray', '3 3');
    pinRing.setAttribute('stroke-opacity', '0.7');
    pinRing.style.display = 'none';
    pinRing.setAttribute('pointer-events', 'none');

    g.appendChild(pinRing);
    g.appendChild(c);
    g.appendChild(t);
    nodesG.appendChild(g);

    node.el = g; node.circleEl = c; node.textEl = t; node.pinRingEl = pinRing;

    // Click discrimination from drag
    let _dragMoved = false;
    let _lastClick = 0;
    g.addEventListener('mousedown', e => {
      _dragMoved = false;
      e.stopPropagation();
      fgStartDrag(e, node);
    });
    g.addEventListener('mousemove', () => { _dragMoved = true; });
    g.addEventListener('click', e => {
      if (_dragMoved) return;
      e.stopPropagation();
      const now = Date.now();
      if (now - _lastClick < 350) {
        // Double click — unpin
        fgUnpinNode(node);
        _lastClick = 0;
        return;
      }
      _lastClick = now;
      closeTreePopup();
      if (node.type === 'leaf') openTreePopup(node.row, node.el);
      else if (node.type === 'section') toggleHighlight(node.id);
    });
    g.addEventListener('touchstart', e => {
      e.preventDefault(); _dragMoved = false; fgStartDragTouch(e, node);
    }, { passive: false });
    g.addEventListener('touchend', () => {
      if (!_dragMoved) {
        if (node.type === 'leaf') openTreePopup(node.row, node.el);
        else if (node.type === 'section') toggleHighlight(node.id);
      }
    });
  });

  // Background click: deselect (skip if we just panned)
  svg.addEventListener('click', () => {
    if (FG._panMoved) return;
    if (FG.highlighted) { FG.highlighted = null; applyHighlight(); }
    closeTreePopup();
  });

  // Pan on background mousedown (left or middle button)
  svg.addEventListener('mousedown', e => {
    if (e.button === 0 || e.button === 1) {
      FG.panning = true;
      FG._panMoved = false;
      FG.panStartX = e.clientX; FG.panStartY = e.clientY;
      FG.panStartVX = FG.viewX; FG.panStartVY = FG.viewY;
      svg.style.cursor = 'grabbing';
      e.preventDefault();
    }
  });

  // Wheel zoom centered on cursor
  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const newScale = Math.max(FG.VIEW_SCALE_MIN, Math.min(FG.VIEW_SCALE_MAX, FG.viewScale * factor));
    if (newScale === FG.viewScale) return;
    const p = clientToSVG(e.clientX, e.clientY);
    FG.viewX = p.x - (p.x - FG.viewX) * (newScale / FG.viewScale);
    FG.viewY = p.y - (p.y - FG.viewY) * (newScale / FG.viewScale);
    FG.viewScale = newScale;
    fgApplyViewport();
    fgUpdateLabelVisibility();
  }, { passive: false });

  // Touch: pinch-to-zoom (2 fingers) or single-finger pan on background
  svg.addEventListener('touchstart', e => {
    if (e.touches.length === 2 && !FG.dragging) {
      e.preventDefault();
      const t0 = e.touches[0], t1 = e.touches[1];
      FG._pinchDist0  = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      FG._pinchScale0 = FG.viewScale;
      FG._pinchVX0 = FG.viewX; FG._pinchVY0 = FG.viewY;
      const mid = clientToSVG((t0.clientX + t1.clientX) / 2, (t0.clientY + t1.clientY) / 2);
      FG._pinchMidX0 = mid.x; FG._pinchMidY0 = mid.y;
      FG.panning = false;
    } else if (e.touches.length === 1 && !FG.dragging) {
      // Single finger on background — start pan
      e.preventDefault();
      FG.panning = true;
      FG._panMoved = false;
      const t = e.touches[0];
      FG.panStartX = t.clientX; FG.panStartY = t.clientY;
      FG.panStartVX = FG.viewX; FG.panStartVY = FG.viewY;
    }
  }, { passive: false });

  // Animate physics from initial state until settled
  fgApplyViewport();
  fgUpdateLinkColors();
  FG.alpha = 1;
  FG.animId = requestAnimationFrame(fgTick);
}

function fgPhysicsStep() {
  const { nodes, links, nodeMap, width, height } = FG;
  const cx = width / 2, cy = height / 2;

  // Repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      let dx = b.x - a.x || 0.01, dy = b.y - a.y || 0.01;
      const minD = a.r + b.r + 6;
      let d2 = dx * dx + dy * dy;
      if (d2 < minD * minD) d2 = minD * minD;
      const d = Math.sqrt(d2);
      const f = FG.REPULSION / d2 * FG.alpha;
      const fx = f * dx / d, fy = f * dy / d;
      if (!a.pinned) { a.vx -= fx; a.vy -= fy; }
      if (!b.pinned) { b.vx += fx; b.vy += fy; }
    }
  }

  // Spring forces
  links.forEach(({ source, target, restLen }) => {
    const s = nodeMap[source], t = nodeMap[target];
    const dx = t.x - s.x, dy = t.y - s.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 0.1;
    const f = FG.SPRING_K * (d - restLen) * FG.alpha;
    const fx = f * dx / d, fy = f * dy / d;
    if (!s.pinned) { s.vx += fx; s.vy += fy; }
    if (!t.pinned) { t.vx -= fx; t.vy -= fy; }
  });

  // Integrate
  nodes.forEach(n => {
    if (n.pinned) return;
    n.vx *= FG.DAMPING; n.vy *= FG.DAMPING;
    n.x = Math.max(n.r + 4, Math.min(width - n.r - 4, n.x + n.vx));
    n.y = Math.max(n.r + 4, Math.min(height - n.r - 4, n.y + n.vy));
  });

  FG.alpha *= 0.992;
}

function fgRender() {
  const { nodes, links, nodeMap } = FG;
  nodes.forEach(n => n.el.setAttribute('transform', `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`));
  links.forEach(({ source, target, el }) => {
    const s = nodeMap[source], t = nodeMap[target];
    el.setAttribute('x1', s.x.toFixed(1)); el.setAttribute('y1', s.y.toFixed(1));
    el.setAttribute('x2', t.x.toFixed(1)); el.setAttribute('y2', t.y.toFixed(1));
  });
}

function fgTick() {
  if (FG.alpha > FG.alphaMin) fgPhysicsStep();
  fgRender();

  if (FG.alpha > FG.alphaMin || FG.dragging) {
    FG.animId = requestAnimationFrame(fgTick);
  } else {
    FG.animId = null;
  }
}

function fgApplyViewport() {
  FG.viewport.setAttribute('transform',
    `translate(${FG.viewX.toFixed(2)},${FG.viewY.toFixed(2)}) scale(${FG.viewScale.toFixed(4)})`);
}

function clientToWorld(clientX, clientY) {
  const r = FG.svg.getBoundingClientRect();
  return {
    x: (clientX - r.left - FG.viewX) / FG.viewScale,
    y: (clientY - r.top  - FG.viewY) / FG.viewScale
  };
}

function clientToSVG(clientX, clientY) {
  const r = FG.svg.getBoundingClientRect();
  return { x: clientX - r.left, y: clientY - r.top };
}

function fgUpdateLinkColors() {
  // Count learned leaves per section
  const secDone = {}, secTotal = {};
  DATA.forEach(sec => {
    secTotal[sec.id] = sec.rows.length;
    secDone[sec.id]  = sec.rows.filter((_, i) => learned[`${sec.id}-${i}`]).length;
  });

  FG.links.forEach(link => {
    const el = link.el;
    if (link.source === '__root__') {
      // Root → section: green when all leaves learned
      const allDone = secTotal[link.target] > 0 && secDone[link.target] === secTotal[link.target];
      el.setAttribute('stroke',         allDone ? '#6ee7b7' : '#e8e6f0');
      el.setAttribute('stroke-opacity', allDone ? '0.7'     : '0.15');
      el.setAttribute('stroke-width',   allDone ? '1.5'     : '1');
    } else {
      // Section → leaf: green when leaf is learned
      const done    = !!learned[link.target];
      const srcNode = FG.nodeMap[link.source];
      el.setAttribute('stroke',         done ? '#6ee7b7' : (srcNode ? FG_COLORS[srcNode.color] : '#e8e6f0'));
      el.setAttribute('stroke-opacity', done ? '0.6'    : '0.2');
      el.setAttribute('stroke-width',   done ? '1'      : '0.8');
    }
  });
}

function fgUpdateLabelVisibility() {
  const s = FG.viewScale;
  FG.nodes.forEach(n => {
    if (n.type === 'root')    { n.textEl.style.display = ''; return; }
    if (n.type === 'section') { n.textEl.style.display = s < 0.4 ? 'none' : ''; return; }
    n.textEl.style.display = s < 0.6 ? 'none' : '';
  });
}

// After drop: unfreeze children so spring forces settle them around parent
function fgWakeChildren(node) {
  if (node.type === 'section') {
    FG.nodes.forEach(n => {
      if (n.secId === node.id && !n.userPinned) { n.vx = 0; n.vy = 0; }
    });
    FG.alpha = Math.max(FG.alpha, 0.25);
    if (!FG.animId) FG.animId = requestAnimationFrame(fgTick);
  }
}

function fgStartDrag(e, node) {
  FG.dragging = node;
  const w = clientToWorld(e.clientX, e.clientY);
  FG.dragOX = w.x - node.x;
  FG.dragOY = w.y - node.y;
  node.pinned = true;
  if (!FG.animId) FG.animId = requestAnimationFrame(fgTick);
}

function fgStartDragTouch(e, node) {
  const t = e.touches[0];
  FG.dragging = node;
  const w = clientToWorld(t.clientX, t.clientY);
  FG.dragOX = w.x - node.x;
  FG.dragOY = w.y - node.y;
  node.pinned = true;
  if (!FG.animId) FG.animId = requestAnimationFrame(fgTick);
}

function toggleHighlight(sectionId) {
  FG.highlighted = FG.highlighted === sectionId ? null : sectionId;
  applyHighlight();
}

function applyHighlight() {
  const h = FG.highlighted;
  FG.nodes.forEach(n => {
    const on = !h || n.id === h || n.secId === h || n.id === '__root__';
    n.circleEl.setAttribute('fill-opacity', on
      ? (n.type === 'root' ? '1' : n.type === 'section' ? '0.85' : '0.55')
      : '0.05');
    n.textEl.setAttribute('fill-opacity', on ? '1' : '0.05');
  });
  FG.links.forEach(lnk => {
    const on = !h || lnk.source === h || lnk.source === '__root__' && !h;
    lnk.el.setAttribute('stroke-opacity', !h ? (lnk.source === '__root__' ? '0.15' : '0.2')
      : (lnk.source === h ? '0.5' : lnk.source === '__root__' ? '0.06' : '0.02'));
  });
}

document.addEventListener('mousemove', e => {
  if (FG.panning && FG.svg) {
    const dx = e.clientX - FG.panStartX, dy = e.clientY - FG.panStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) FG._panMoved = true;
    FG.viewX = FG.panStartVX + dx;
    FG.viewY = FG.panStartVY + dy;
    fgApplyViewport();
    return;
  }
  if (!FG.dragging || !FG.svg) return;
  const w = clientToWorld(e.clientX, e.clientY);
  FG.dragging.x = w.x - FG.dragOX;
  FG.dragging.y = w.y - FG.dragOY;
  FG.alpha = Math.max(FG.alpha, 0.15);
  if (!FG.animId) FG.animId = requestAnimationFrame(fgTick);
});

document.addEventListener('mouseup', () => {
  if (FG.dragging) {
    const node = FG.dragging;
    node.userPinned = true;
    node.pinned = true;
    if (node.pinRingEl) node.pinRingEl.style.display = '';
    FG.dragging = null;
    fgWakeChildren(node);
  }
  if (FG.panning && FG.svg) { FG.panning = false; FG.svg.style.cursor = ''; }
});

function fgUnpinNode(node) {
  node.userPinned = false;
  node.pinned = false;
  node.vx = 0; node.vy = 0;
  if (node.pinRingEl) node.pinRingEl.style.display = 'none';
  FG.alpha = Math.max(FG.alpha, 0.3);
  if (!FG.animId) FG.animId = requestAnimationFrame(fgTick);
}

document.addEventListener('touchmove', e => {
  if (!FG.svg) return;
  e.preventDefault();
  // Two-finger pinch zoom
  if (e.touches.length === 2 && !FG.dragging && FG._pinchDist0 > 0) {
    const t0 = e.touches[0], t1 = e.touches[1];
    const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
    const newScale = Math.max(FG.VIEW_SCALE_MIN, Math.min(FG.VIEW_SCALE_MAX,
      FG._pinchScale0 * dist / FG._pinchDist0));
    FG.viewX = FG._pinchMidX0 - (FG._pinchMidX0 - FG._pinchVX0) * (newScale / FG._pinchScale0);
    FG.viewY = FG._pinchMidY0 - (FG._pinchMidY0 - FG._pinchVY0) * (newScale / FG._pinchScale0);
    FG.viewScale = newScale;
    fgApplyViewport(); fgUpdateLabelVisibility();
    return;
  }
  // Single-finger pan on background
  if (e.touches.length === 1 && FG.panning && !FG.dragging) {
    const t = e.touches[0];
    const dx = t.clientX - FG.panStartX, dy = t.clientY - FG.panStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) FG._panMoved = true;
    FG.viewX = FG.panStartVX + dx;
    FG.viewY = FG.panStartVY + dy;
    fgApplyViewport();
    return;
  }
  if (!FG.dragging) return;
  const t = e.touches[0];
  const w = clientToWorld(t.clientX, t.clientY);
  FG.dragging.x = w.x - FG.dragOX;
  FG.dragging.y = w.y - FG.dragOY;
  FG.alpha = Math.max(FG.alpha, 0.15);
  if (!FG.animId) FG.animId = requestAnimationFrame(fgTick);
}, { passive: false });

document.addEventListener('touchend', () => {
  if (FG.dragging) {
    const node = FG.dragging;
    node.userPinned = true;
    node.pinned = true;
    if (node.pinRingEl) node.pinRingEl.style.display = '';
    FG.dragging = null;
    fgWakeChildren(node);
  }
  FG._pinchDist0 = 0;
  FG.panning = false;
});

// Close popup on outside click
document.addEventListener('click', e => {
  const popup = document.getElementById('tree-popup');
  if (popup && popup.style.display !== 'none') {
    if (!popup.contains(e.target) && !e.target.closest('.fg-node-g')) closeTreePopup();
  }
});

// Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const popup = document.getElementById('tree-popup');
    if (popup && popup.style.display !== 'none') closeTreePopup();
    else if (FG.highlighted) { FG.highlighted = null; applyHighlight(); }
  }
});

// Resize
let _fgResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_fgResizeTimer);
  _fgResizeTimer = setTimeout(() => {
    if (FG.svg) {
      FG.width  = window.innerWidth;
      FG.height = window.innerHeight - 64;
      fgRender();
    }
  }, 150);
});

function openTreePopup(row, anchorEl) {
  const topicKey = findTopicKeyByRow(row);
  const section = DATA.find(sec => sec.id === topicKey.split('-')[0]);
  const popup = document.getElementById('tree-popup');
  document.getElementById('tree-popup-title').textContent = row.topic;
  document.getElementById('tree-popup-desc').innerHTML = renderMarkdown(row.desc);
  enhanceCodeBlocks(document.getElementById('tree-popup-desc'));

  const linksEl = document.getElementById('tree-popup-links');
  linksEl.innerHTML = '';
  if (row.links && row.links.length > 0) {
    row.links.forEach(l => {
      const a = document.createElement('a');
      a.href = l.u; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = l.t + ' ↗';
      linksEl.appendChild(a);
    });
    linksEl.style.display = '';
  } else {
    linksEl.style.display = 'none';
  }

  renderTreeComments({
    topicKey,
    topicTitle: row.topic,
    sectionId: section?.id || '',
    sectionTitle: section?.title || ''
  });

  popup.style.display = '';
  popup.style.left = '-9999px';
  popup.style.top = '-9999px';

  const ar = anchorEl.getBoundingClientRect();
  const pr = popup.getBoundingClientRect();
  const margin = 12;

  if (window.innerWidth > 640) {
    let top = ar.bottom + margin + window.scrollY;
    let left = ar.left + ar.width / 2 - pr.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - pr.width - margin));
    if (ar.bottom + pr.height + margin > window.innerHeight) top = ar.top + window.scrollY - pr.height - margin;
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
  }
}

function closeTreePopup() {
  document.getElementById('tree-popup').style.display = 'none';
}

function enhanceCodeBlocks(root = document) {
  if (!window.hljs || !root?.querySelectorAll) return;
  root.querySelectorAll('pre code').forEach(block => {
    if (block.dataset.hljsDone === 'true') return;
    window.hljs.highlightElement(block);
    block.dataset.hljsDone = 'true';
  });
}

function findTopicKeyByRow(targetRow) {
  for (const sec of DATA) {
    const rowIndex = sec.rows.indexOf(targetRow);
    if (rowIndex !== -1) return `${sec.id}-${rowIndex}`;
  }
  return '';
}

function renderTreeComments({ topicKey, topicTitle, sectionId, sectionTitle }) {
  const host = document.getElementById('tree-popup-comments');
  const comments = getComments(topicKey);
  const itemsHtml = comments.length
    ? comments.map(comment => `
      <div class="comment-item">
        <div class="comment-meta">
          <span>${escapeHtml(formatCommentDate(comment.createdAt) || '')}</span>
        </div>
        <div class="comment-text">${escapeHtml(comment.comment || '').replace(/\n/g, '<br>')}</div>
      </div>`).join('')
    : `<div class="comment-empty">Пока нет комментариев. Можно оставить первый.</div>`;

  host.innerHTML = `
    <div class="comments-block comments-block-tree" data-topic-key="${escapeHtml(topicKey)}">
      <div class="comments-header">
        <div class="comments-title">Комментарии</div>
        <div class="comments-count">${comments.length}</div>
      </div>
      <div class="comments-list">${itemsHtml}</div>
      <form class="comment-form" onsubmit="submitCommentFromTree(event, '${topicKey}', '${escapeJs(topicTitle)}', '${sectionId}', '${escapeJs(sectionTitle)}')">
        <textarea class="comment-textarea" name="comment" rows="3" maxlength="1000" placeholder="Оставьте комментарий по теме"></textarea>
        <div class="comment-form-footer">
          <div class="comment-status" id="tree-comment-status"></div>
          <button class="comment-submit" type="submit">Отправить</button>
        </div>
      </form>
    </div>`;
}

function escapeJs(text) {
  return String(text || '')
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'");
}

async function submitCommentFromTree(event, topicKey, topicTitle, sectionId, sectionTitle) {
  event.preventDefault();

  const form = event.currentTarget;
  const commentInput = form.elements.comment;
  const statusEl = document.getElementById('tree-comment-status');
  const submitBtn = form.querySelector('.comment-submit');
  const comment = commentInput.value.trim();

  if (!comment) {
    statusEl.textContent = 'Нужен текст комментария';
    return;
  }

  statusEl.textContent = 'Сохраняю...';
  submitBtn.disabled = true;

  try {
    await submitComment({ topicKey, topicTitle, sectionId, sectionTitle, comment });
    renderTreeComments({ topicKey, topicTitle, sectionId, sectionTitle });
    const refreshedStatus = document.getElementById('tree-comment-status');
    if (refreshedStatus) refreshedStatus.textContent = 'Комментарий сохранен';
  } catch (err) {
    statusEl.textContent = err.message || 'Ошибка сохранения';
  } finally {
    submitBtn.disabled = false;
  }
}

function renderMarkdown(text) {
  if (window.marked) return marked.parse(text || '');
  return `<p>${escapeHtml(text || '')}</p>`;
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

onSyncRefresh = () => { updateProgress(); fgUpdateLinkColors(); };

updateProgress();
initSync();
buildTree();
