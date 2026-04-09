let activeFilter = 'all';
let searchQuery = '';

const filtersEl = document.getElementById('filters');
const sectionsEl = document.getElementById('sections');
const emptyEl = document.getElementById('empty');
const statsEl = document.getElementById('stats-bar');
const searchEl = document.getElementById('search');

if (window.marked) {
  marked.setOptions({
    gfm: true,
    breaks: true
  });
}

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

    const filteredRows = sec.rows
      .map((row, rowIndex) => ({ row, rowIndex }))
      .filter(({ row }) =>
        !q || row.topic.toLowerCase().includes(q) || row.desc.toLowerCase().includes(q)
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

    filteredRows.forEach(({ row, rowIndex }) => {
      const cardId = `${sec.id}-${rowIndex}`;
      const isLearned = learned[cardId];
      const comments = getComments(cardId);
      html += `<div class="card ${isLearned?'learned':''}" id="card-${cardId}">`;
      html += `<div class="card-header">`;
      html += `<div class="card-check" onclick="event.stopPropagation();toggleLearned('${cardId}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></div>`;
      html += `<div class="card-topic" onclick="toggleCard('${cardId}')">${highlight(row.topic, q)}</div>`;
      html += `<svg class="card-expand" onclick="toggleCard('${cardId}')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`;
      html += `</div>`;
      html += `<div class="card-body">`;
      html += `<div class="markdown-body">${renderMarkdown(row.desc)}</div>`;
      if (row.links.length > 0) {
        html += `<div style="margin-top:10px">`;
        row.links.forEach(l => {
          html += `<a href="${l.u}" target="_blank" rel="noopener">${l.t} &#8599;</a><br>`;
        });
        html += `</div>`;
      }
      html += renderCommentsBlock({
        topicKey: cardId,
        topicTitle: row.topic,
        sectionId: sec.id,
        sectionTitle: sec.title,
        comments
      });
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

function renderMarkdown(text) {
  if (window.marked) return marked.parse(text || '');
  return `<p>${escapeHtml(text || '')}</p>`;
}

function renderCommentsBlock({ topicKey, topicTitle, sectionId, sectionTitle, comments }) {
  const itemsHtml = comments.length
    ? comments.map(comment => `
      <div class="comment-item">
        <div class="comment-meta">
          <strong>${escapeHtml(comment.author || 'Anonymous')}</strong>
          <span>${escapeHtml(formatCommentDate(comment.createdAt) || '')}</span>
        </div>
        <div class="comment-text">${escapeHtml(comment.comment || '').replace(/\n/g, '<br>')}</div>
      </div>`).join('')
    : `<div class="comment-empty">Пока нет комментариев. Можно оставить первый.</div>`;

  return `
    <div class="comments-block" data-topic-key="${escapeHtml(topicKey)}">
      <div class="comments-header">
        <div class="comments-title">Комментарии</div>
        <div class="comments-count">${comments.length}</div>
      </div>
      <div class="comments-list" id="comments-list-${topicKey}">${itemsHtml}</div>
      <form class="comment-form" onsubmit="submitCommentFromCard(event, '${topicKey}', '${escapeJs(topicTitle)}', '${sectionId}', '${escapeJs(sectionTitle)}')">
        <input class="comment-author-input" type="text" name="author" maxlength="60" placeholder="Ваше имя (необязательно)" value="${escapeHtml(commentAuthor || '')}">
        <textarea class="comment-textarea" name="comment" rows="3" maxlength="1000" placeholder="Оставьте комментарий по теме"></textarea>
        <div class="comment-form-footer">
          <div class="comment-status" id="comment-status-${topicKey}"></div>
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

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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

async function submitCommentFromCard(event, topicKey, topicTitle, sectionId, sectionTitle) {
  event.preventDefault();

  const form = event.currentTarget;
  const authorInput = form.elements.author;
  const commentInput = form.elements.comment;
  const statusEl = document.getElementById(`comment-status-${topicKey}`);
  const submitBtn = form.querySelector('.comment-submit');

  const author = authorInput.value.trim();
  const comment = commentInput.value.trim();

  if (!comment) {
    statusEl.textContent = 'Нужен текст комментария';
    return;
  }

  statusEl.textContent = 'Сохраняю...';
  submitBtn.disabled = true;

  try {
    await submitComment({ topicKey, topicTitle, sectionId, sectionTitle, author, comment });
    buildSections();

    const card = document.getElementById(`card-${topicKey}`);
    if (card) card.classList.add('open');

    const refreshedForm = card ? card.querySelector('.comment-form') : null;
    if (refreshedForm) {
      refreshedForm.elements.author.value = commentAuthor || author;
      refreshedForm.elements.comment.value = '';
      const refreshedStatus = document.getElementById(`comment-status-${topicKey}`);
      if (refreshedStatus) refreshedStatus.textContent = 'Комментарий сохранен';
    }
  } catch (err) {
    statusEl.textContent = err.message || 'Ошибка сохранения';
  } finally {
    submitBtn.disabled = false;
  }
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
