let activeFilter = 'all';
let searchQuery = '';

const filtersEl = document.getElementById('filters');
const sectionsEl = document.getElementById('sections');
const emptyEl = document.getElementById('empty');
const statsEl = document.getElementById('stats-bar');
const searchEl = document.getElementById('search');

function buildFilters() {
  let html = `<button class="filter-btn ${activeFilter==='all'?'active':''}" onclick="setFilter('all')">Все<span class="filter-count">${DATA.reduce((s,sec)=>s+sec.rows.length,0)}</span></button>`;
  DATA.forEach(sec => {
    html += `<button class="filter-btn ${activeFilter===sec.id?'active':''}" data-color onclick="setFilter('${sec.id}')" style="${activeFilter===sec.id?`border-color:var(--accent-${sec.color});color:var(--accent-${sec.color});background:var(--accent-${sec.color}-dim)`:''}">${sec.title}<span class="filter-count">${sec.rows.length}</span></button>`;
  });
  filtersEl.innerHTML = html;
}

function buildStats() {
  const total = DATA.reduce((s, sec) => s + sec.rows.length, 0);
  const done = Object.keys(learned).length;
  const withLinks = DATA.reduce((s, sec) => s + sec.rows.filter(r => r.links.length > 0).length, 0);
  statsEl.innerHTML = `
    <div class="stat-chip"><strong>${total}</strong> тем</div>
    <div class="stat-chip"><strong>${done}</strong> изучено</div>
    <div class="stat-chip"><strong>${total - done}</strong> осталось</div>
    <div class="stat-chip"><strong>${withLinks}</strong> со ссылками</div>`;
}

function buildSections() {
  let html = '';
  let visibleCount = 0;
  const q = searchQuery.toLowerCase().trim();

  DATA.forEach((sec, si) => {
    if (activeFilter !== 'all' && activeFilter !== sec.id) return;

    const filteredRows = sec.rows.filter(r =>
      !q || r.topic.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)
    );

    if (filteredRows.length === 0) return;
    visibleCount += filteredRows.length;

    html += `<div class="section color-${sec.color}" id="sec-${sec.id}">`;
    html += `<div class="section-header" onclick="toggleSection('${sec.id}')">`;
    html += `<div class="section-icon">${sec.icon}</div>`;
    html += `<div class="section-title">${sec.title}</div>`;
    html += `<div class="section-count">${filteredRows.length} тем</div>`;
    html += `<svg class="section-toggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`;
    html += `</div>`;
    html += `<div class="section-body">`;

    filteredRows.forEach((row, ri) => {
      const cardId = `${sec.id}-${ri}`;
      const isLearned = learned[cardId];
      html += `<div class="card ${isLearned?'learned':''}" id="card-${cardId}">`;
      html += `<div class="card-header">`;
      html += `<div class="card-check" onclick="event.stopPropagation();toggleLearned('${cardId}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></div>`;
      html += `<div class="card-topic" onclick="toggleCard('${cardId}')">${highlight(row.topic, q)}</div>`;
      html += `<svg class="card-expand" onclick="toggleCard('${cardId}')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`;
      html += `</div>`;
      html += `<div class="card-body">`;
      html += `<p>${highlight(row.desc, q)}</p>`;
      if (row.links.length > 0) {
        html += `<div style="margin-top:10px">`;
        row.links.forEach(l => {
          html += `<a href="${l.u}" target="_blank" rel="noopener">${l.t} &#8599;</a><br>`;
        });
        html += `</div>`;
      }
      html += `</div></div>`;
    });

    html += `</div></div>`;
  });

  sectionsEl.innerHTML = html;
  emptyEl.style.display = visibleCount === 0 ? '' : 'none';
}

function highlight(text, q) {
  if (!q) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark style="background:rgba(79,209,197,0.25);color:inherit;padding:0 2px;border-radius:3px">$1</mark>');
}

function setFilter(id) {
  activeFilter = id;
  buildFilters();
  buildSections();
}

function toggleSection(id) {
  const el = document.getElementById('sec-' + id);
  if (el) el.classList.toggle('collapsed');
}

function toggleCard(id) {
  const el = document.getElementById('card-' + id);
  if (el) el.classList.toggle('open');
}

function toggleLearned(id) {
  if (learned[id]) delete learned[id];
  else learned[id] = true;
  saveLearned();
  schedulePush(id);
  const el = document.getElementById('card-' + id);
  if (el) el.classList.toggle('learned');
  updateProgress();
  buildStats();
}

searchEl.addEventListener('input', e => {
  searchQuery = e.target.value;
  buildSections();
});

document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== searchEl) {
    e.preventDefault();
    searchEl.focus();
  }
  if (e.key === 'Escape') {
    searchEl.value = '';
    searchQuery = '';
    searchEl.blur();
    buildSections();
  }
});

onSyncRefresh = () => { buildSections(); updateProgress(); buildStats(); };

buildFilters();
buildStats();
buildSections();
updateProgress();
initSync();
