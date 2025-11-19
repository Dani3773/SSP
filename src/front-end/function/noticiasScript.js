// News page script: fetch live data from /api/communications and render list with filters, search and pagination
const API_BASE = '/api';
const NEWS_STATE = { items: [], page: 1, pageSize: 10, filter: '', category: 'todas', period: 'todos' };

document.addEventListener('DOMContentLoaded', () => {
  initNewsControls();
  loadNewsFromApi();
  setupStaticCards();
});

function initNewsControls() {
  // Category buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      NEWS_STATE.category = btn.dataset.category || 'todas';
      NEWS_STATE.page = 1;
      renderNewsList();
    });
  });

  // Search
  const searchInput = document.getElementById('news-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      NEWS_STATE.filter = e.target.value || '';
      NEWS_STATE.page = 1;
      renderNewsList();
    });
    // Clear search button
    const clearBtn = document.getElementById('news-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        NEWS_STATE.filter = '';
        NEWS_STATE.page = 1;
        renderNewsList();
        searchInput.focus();
      });
    }
  }

  // Page size
  const pageSize = document.getElementById('news-pagesize');
  if (pageSize) {
    pageSize.addEventListener('change', (e) => {
      NEWS_STATE.pageSize = parseInt(e.target.value, 10) || 10;
      NEWS_STATE.page = 1;
      renderNewsList();
    });
  }

  // Date filter (period)
  const periodSelect = document.getElementById('news-period');
  if (periodSelect) {
    periodSelect.addEventListener('change', (e) => {
      NEWS_STATE.period = e.target.value || 'todos';
      NEWS_STATE.page = 1;
      renderNewsList();
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById('news-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      await loadNewsFromApi();
      refreshBtn.disabled = false;
    });
  }
}

async function loadNewsFromApi() {
  const list = document.getElementById('news-list');
  if (!list) return;
  // Preserve static HTML fallback if it's the first run
  if (!list.dataset.staticHtml) list.dataset.staticHtml = list.innerHTML;
  list.innerHTML = '<div class="loader">Carregando notícias...</div>';
  // Ensure loader displayed while fetching
  try {
    const res = await fetch(`${API_BASE}/communications`);
    if (!res.ok) throw new Error('Falha ao carregar notícias');
    const news = await res.json();
    NEWS_STATE.items = Array.isArray(news) ? news : [];
    NEWS_STATE.page = 1;
    // no UI badge for API/source; production UI doesn't show internal state.
    if (NEWS_STATE.items.length === 0) {
      // restore static fallback
      list.innerHTML = list.dataset.staticHtml || '';
    } else {
      renderNewsList();
    }
  } catch (error) {
    list.innerHTML = `<p class="error">Erro ao carregar notícias: ${error.message}</p>`;
    // on error, we keep showing fallback content (static HTML) with no visible badge
  }
}

function renderNewsList() {
  const container = document.getElementById('news-list');
  const countEl = document.getElementById('news-count');
  if (!container) return;

  const { items, page, pageSize, filter, category } = NEWS_STATE;
  let filtered = items.slice();
  if (category && category !== 'todas') {
    filtered = filtered.filter(n => (n.category || '').toLowerCase() === category.toLowerCase());
  }
  // Period filter
  if (NEWS_STATE.period && NEWS_STATE.period !== 'todos') {
    const now = Date.now();
    let days = 0;
    switch (NEWS_STATE.period) {
      case '7dias': days = 7; break;
      case '30dias': days = 30; break;
      case '90dias': days = 90; break;
      case '365dias': days = 365; break;
      default: days = 0; break;
    }
    if (days > 0) {
      const cutoff = now - (days * 24 * 3600 * 1000);
      filtered = filtered.filter(n => {
        const d = new Date(n.date || n.createdAt).getTime();
        return !isNaN(d) && d >= cutoff;
      });
    }
  }
  if (filter && filter.trim()) {
    const f = filter.toLowerCase();
    filtered = filtered.filter(n => (n.title || '').toLowerCase().includes(f) || (n.description || '').toLowerCase().includes(f));
  }

  const totalItems = filtered.length;
  if (countEl) countEl.textContent = `${totalItems} notícia${totalItems !== 1 ? 's' : ''}`;

  // Pagination
  const start = (page - 1) * pageSize;
  const pageItems = pageSize > 0 ? filtered.slice(start, start + pageSize) : filtered;

    container.innerHTML = pageItems.map((n, i) => getNewsCardHtml(n, i === 0 && page === 1)).join('');
  renderNewsPagination(totalItems);
  // update lucide icons
  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  // attach click handlers for dynamically created "Ler mais" buttons (use data-id to avoid inline onclick issues)
  document.querySelectorAll('.btn.view-btn').forEach(b => {
    if (!b.dataset._bound) {
      b.addEventListener('click', () => openNewsModal(b.dataset.id));
      b.dataset._bound = '1';
    }
  });
}

function getNewsCardHtml(n, featured = false) {
  // robust image handling: prefer absolute server path if available,
  // but fallback to local img folder when opened as file:// or when origin is missing
  let image = n.image || '/img/imagem1.webp';
  image = resolveImageUrl(image);
  const date = n.date || n.createdAt || '';
  const formattedDate = date ? new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '';
  const fullDesc = n.description || '';
  const maxExcerptChars = 280; // approximate
  const hasDesc = fullDesc && String(fullDesc).trim().length > 0;
  const needsMore = fullDesc.length > maxExcerptChars;
  const excerpt = needsMore ? (fullDesc.slice(0, maxExcerptChars) + '...') : fullDesc;
  const readMoreBtn = hasDesc ? `<button class="btn view-btn" data-id="${escapeHtml(String(n.id || ''))}"><i data-lucide="eye" class="btn-icon" aria-hidden="true"></i><span class="btn-label">Ler mais</span></button>` : '';
  return `
    <article class="card ${featured ? 'card--featured' : ''}" role="listitem">
      <img src="${image}" loading="lazy" decoding="async" alt="${escapeHtml(n.title || '')}">
      <div>
        <h3>${escapeHtml(n.title || 'Sem título')}</h3>
        <p class="meta">${formattedDate} • ${escapeHtml(n.category || '')}</p>
        <p>${escapeHtml(excerpt)}</p>
        <div class="news-actions">
          ${readMoreBtn}
        </div>
      </div>
    </article>
  `;
}

// Resolve image path safely for server and local file contexts
function resolveImageUrl(imagePath) {
  let img = imagePath || '/img/imagem1.webp';
  try {
    if (typeof img === 'string' && img.startsWith('/api/communications')) {
      const origin = (window.location && window.location.origin) ? window.location.origin : '';
      if (origin && origin.startsWith('http')) return origin + img;
      return '../img/imagem1.webp';
    }
  } catch (e) { }
  return img;
}

function renderNewsPagination(totalItems) {
  const pagination = document.getElementById('news-pagination');
  const { page, pageSize } = NEWS_STATE;
  if (!pagination) return;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;
  pagination.innerHTML = `
    <div class="pagination-controls">
      <button class="btn" ${page <= 1 ? 'disabled' : ''} onclick="changeNewsPage(${page - 1})">&larr; Anterior</button>
      <span>Página ${page} de ${totalPages}</span>
      <button class="btn" ${page >= totalPages ? 'disabled' : ''} onclick="changeNewsPage(${page + 1})">Próxima &rarr;</button>
    </div>
  `;
}

function changeNewsPage(newPage) {
  const { items, pageSize } = NEWS_STATE;
  const totalItems = items.length;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;
  NEWS_STATE.page = Math.min(Math.max(1, newPage), totalPages);
  renderNewsList();
}

// Walk static fallback cards and add 'Ler mais' when content is too long
function setupStaticCards() {
  const list = document.getElementById('news-list');
  if (!list) return;
  const cards = Array.from(list.querySelectorAll('.card'));
  const maxExcerptChars = 280;
  cards.forEach(card => {
    const contentP = card.querySelector('div > p:last-of-type');
    const titleEl = card.querySelector('h3');
    const dateEl = card.querySelector('div > p:first-of-type');
    const imgEl = card.querySelector('img');
    if (!contentP || !titleEl) return;
    const fullText = contentP.textContent || '';
    if (fullText.length > maxExcerptChars) {
      // truncate visible text via CSS is already applied; add button
      let actions = card.querySelector('.news-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'news-actions';
        card.querySelector('div').appendChild(actions);
      }
      // Avoid duplicate buttons
      if (!actions.querySelector('.view-btn')) {
        const btn = document.createElement('button');
        btn.className = 'btn view-btn';
        btn.textContent = 'Ler mais';
        btn.addEventListener('click', () => {
          openGenericNewsModal(titleEl.textContent || '', dateEl?.textContent || '', imgEl?.getAttribute('src') || '', contentP.innerHTML);
        });
        actions.appendChild(btn);
      }
    }
  });
}

// Simple modal to display full news
function openNewsModal(id) {
  const item = NEWS_STATE.items.find(n => n.id == id);
  if (!item) return alert('Notícia não encontrada');
  let modal = document.getElementById('news-modal');
  if (!modal) {
    modal = document.createElement('section');
    modal.id = 'news-modal';
    modal.className = 'news-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="news-modal-card">
        <div class="news-modal-header">
          <i data-lucide="book-open" aria-hidden="true"></i>
          <div class="news-modal-titles">
            <h3 id="news-modal-title"></h3>
            <p class="news-modal-subtitle">Notícia completa</p>
          </div>
          <button class="news-modal-close" aria-label="Fechar">✕</button>
        </div>
        <div class="news-modal-inner">
          <div class="news-modal-media"></div>
          <div class="news-modal-body" id="news-modal-body"></div>
        </div>
        <div class="news-modal-actions" id="news-modal-actions" style="display:none;"></div>
      </div>`;
    document.body.appendChild(modal);
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    // attach close handler (avoid inline onclick)
    const closeBtn = modal.querySelector('.news-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeNewsModal);
  }
  const body = document.getElementById('news-modal-body');
  const media = modal.querySelector('.news-modal-media');
  const titleEl = document.getElementById('news-modal-title');
  titleEl.textContent = item.title || '';
  if (media) {
    media.innerHTML = item.image ? `<img src="${resolveImageUrl(item.image)}" alt="${escapeHtml(item.title)}" class="news-modal-image">` : '';
  }
  if (body) {
    body.innerHTML = `
      <p class="meta">${new Date(item.date || item.createdAt).toLocaleString('pt-BR')}</p>
      <div class="news-modal-content">${escapeHtml(item.description || '')}</div>
    `;
  }
  // Actions: share / copy link / print
  const actions = document.getElementById('news-modal-actions');
  if (actions) {
    const url = `${window.location.origin}${window.location.pathname}#news-${encodeURIComponent(item.id)}`;
    actions.style.display = 'flex';
    actions.innerHTML = `
      <button class="btn action-btn" data-action="share"><i data-lucide="share-2"></i> Compartilhar</button>
      <button class="btn action-btn" data-action="copy"><i data-lucide="copy"></i> Copiar link</button>
      <button class="btn action-btn" data-action="print"><i data-lucide="printer"></i> Imprimir</button>
    `;
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    const btnShare = actions.querySelector('[data-action="share"]');
    const btnCopy = actions.querySelector('[data-action="copy"]');
    const btnPrint = actions.querySelector('[data-action="print"]');
    if (btnShare) btnShare.addEventListener('click', async () => {
      try {
        if (navigator.share) {
          await navigator.share({ title: item.title || 'Notícia', text: item.description ? item.description.slice(0, 160) : '', url });
        } else {
          await navigator.clipboard.writeText(url);
          alert('Link copiado para a área de transferência');
        }
      } catch (e) { alert('Não foi possível compartilhar: ' + (e && e.message)); }
    });
    if (btnCopy) btnCopy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(url); alert('Link copiado para a área de transferência'); } catch (e) { alert('Falha ao copiar link'); }
    });
    if (btnPrint) btnPrint.addEventListener('click', () => {
      // print only modal content by opening a new window
      const printWin = window.open('', '_blank', 'noopener');
      if (!printWin) return alert('Não foi possível abrir janela de impressão');
      const title = escapeHtml(item.title || 'Notícia');
      const content = document.querySelector('#news-modal .news-modal-inner')?.innerHTML || document.getElementById('news-modal-body')?.innerHTML || '';
      printWin.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Inter,system-ui,Arial;padding:20px;color:#111}</style></head><body>${content}</body></html>`);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => { printWin.print(); printWin.close(); }, 300);
    });
  }
  // Accessibility: focus management and simple focus trap
  modal._previousActive = document.activeElement;
  const firstFocus = modal.querySelector('.news-modal-close') || modal.querySelector('.news-modal-card');
  if (firstFocus && typeof firstFocus.focus === 'function') firstFocus.focus();
  // trap tab within modal
  const trapHandler = (e) => {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(modal.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled && el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  modal._trapHandler = trapHandler;
  document.addEventListener('keydown', trapHandler);
  modal.classList.add('open');
  // Close modal on overlay click or Escape key
  modal.addEventListener('click', (e) => { if (e.target === modal) closeNewsModal(); });
  document.addEventListener('keydown', handleNewsModalKeydown);
}

// Generic modal opener for static cards (no ID required)
function openGenericNewsModal(title, date, image, descriptionHtml) {
  let modal = document.getElementById('news-modal');
  if (!modal) {
    modal = document.createElement('section');
    modal.id = 'news-modal';
    modal.className = 'news-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="news-modal-card">
        <div class="news-modal-header">
          <i data-lucide="book-open" aria-hidden="true"></i>
          <div class="news-modal-titles">
            <h3 id="news-modal-title"></h3>
            <p class="news-modal-subtitle">Notícia</p>
          </div>
          <button class="news-modal-close" aria-label="Fechar">✕</button>
        </div>
        <div class="news-modal-inner">
          <div class="news-modal-media"></div>
          <div class="news-modal-body" id="news-modal-body"></div>
        </div>
        <div class="news-modal-actions" id="news-modal-actions" style="display:none;"></div>
      </div>`;
    document.body.appendChild(modal);
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    const closeBtn2 = modal.querySelector('.news-modal-close');
    if (closeBtn2) closeBtn2.addEventListener('click', closeNewsModal);
  }
  const body = document.getElementById('news-modal-body');
  const media2 = modal.querySelector('.news-modal-media');
  const titleEl = document.getElementById('news-modal-title');
  titleEl.textContent = title || '';
  if (media2) {
    media2.innerHTML = image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="news-modal-image">` : '';
  }
  if (body) {
    body.innerHTML = `
      <p class="meta">${escapeHtml(date)}</p>
      <div class="news-modal-content">${descriptionHtml}</div>
    `;
  }
  // Actions area
  const actions2 = document.getElementById('news-modal-actions');
  if (actions2) {
    const url = `${window.location.origin}${window.location.pathname}`;
    actions2.style.display = 'flex';
    actions2.innerHTML = `
      <button class="btn action-btn" data-action="share"><i data-lucide="share-2"></i> Compartilhar</button>
      <button class="btn action-btn" data-action="copy"><i data-lucide="copy"></i> Copiar link</button>
      <button class="btn action-btn" data-action="print"><i data-lucide="printer"></i> Imprimir</button>
    `;
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    const bs = actions2.querySelector('[data-action="share"]');
    const bc = actions2.querySelector('[data-action="copy"]');
    const bp = actions2.querySelector('[data-action="print"]');
    if (bs) bs.addEventListener('click', async () => {
      try {
        if (navigator.share) {
          await navigator.share({ title: title || 'Notícia', text: descriptionHtml ? descriptionHtml.slice(0, 160) : '', url });
        } else {
          await navigator.clipboard.writeText(url);
          alert('Link copiado para a área de transferência');
        }
      } catch (e) { alert('Não foi possível compartilhar: ' + (e && e.message)); }
    });
    if (bc) bc.addEventListener('click', async () => { try { await navigator.clipboard.writeText(url); alert('Link copiado para a área de transferência'); } catch (e) { alert('Falha ao copiar link'); } });
    if (bp) bp.addEventListener('click', () => {
      const printWin = window.open('', '_blank', 'noopener');
      if (!printWin) return alert('Não foi possível abrir janela de impressão');
      const content = document.querySelector('#news-modal .news-modal-inner')?.innerHTML || document.getElementById('news-modal-body')?.innerHTML || '';
      printWin.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title || 'Notícia')}</title><style>body{font-family:Inter,system-ui,Arial;padding:20px;color:#111}</style></head><body>${content}</body></html>`);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => { printWin.print(); printWin.close(); }, 300);
    });
  }
  modal.classList.add('open');
  // Close modal on overlay click or Escape key
  modal.addEventListener('click', (e) => { if (e.target === modal) closeNewsModal(); });
  document.addEventListener('keydown', handleNewsModalKeydown);
  // focus management for generic modal
  modal._previousActive = document.activeElement;
  const f = modal.querySelector('.news-modal-close') || modal.querySelector('.news-modal-card');
  if (f && typeof f.focus === 'function') f.focus();
  const trap = (e) => {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(modal.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled && el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  modal._trapHandler = trap;
  document.addEventListener('keydown', trap);
}

function closeNewsModal() {
  const modal = document.getElementById('news-modal');
  if (!modal) return;
  modal.classList.remove('open');
  // remove focus trap if present
  if (modal._trapHandler) document.removeEventListener('keydown', modal._trapHandler);
  // restore previous focus
  try {
    if (modal._previousActive && typeof modal._previousActive.focus === 'function') modal._previousActive.focus();
  } catch (e) {}
  // clear actions to avoid duplicate listeners next open
  const actions = document.getElementById('news-modal-actions');
  if (actions) {
    actions.style.display = 'none';
    actions.innerHTML = '';
  }
  document.removeEventListener('keydown', handleNewsModalKeydown);
}

function handleNewsModalKeydown(e) {
  if (e.key === 'Escape') closeNewsModal();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
