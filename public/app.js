(function () {
  'use strict';

  /* ---------- state ---------- */
  let locales = [];       // full dataset
  let filtered = [];      // after search
  let currentLang = i18n.init();

  /* ---------- DOM refs ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const langToggle  = $('#lang-toggle');
  const searchInput = $('#search-input');
  const table       = $('#locales-table');
  const tbody       = $('#table-body');
  const skeleton    = $('#skeleton');
  const messageArea = $('#message-area');
  const titleEl     = $('#app-title');
  const thEls       = $$('#locales-table th[data-i18n]');

  /* ---------- render ---------- */
  function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, (c) => map[c]);
  }

  function renderTable(data) {
    if (!data.length) {
      table.style.display = 'none';
      messageArea.style.display = 'block';
      messageArea.textContent = i18n.t('empty.search');
      return;
    }

    table.style.display = '';
    messageArea.style.display = 'none';

    tbody.innerHTML = data.map((loc) => {
      const langName = loc.language?.name || '';
      const countryName = loc.country?.name || '';
      const flag = loc.country?.flag || '';
      const code = escapeHtml(loc.locale || '');
      const currency = escapeHtml(loc.country?.currency_code || '—');
      const tld = loc.country?.tld ? '.' + loc.country.tld : '—';

      return '<tr>' +
        `<td class="flag-cell">${flag}</td>` +
        `<td class="code-cell">${code}</td>` +
        `<td>${escapeHtml(langName)}</td>` +
        `<td>${escapeHtml(countryName)}</td>` +
        `<td class="curr-cell">${currency}</td>` +
        `<td class="tld-cell">${tld}</td>` +
        `<td class="col-btn"><button class="details-btn" data-locale="${code}">${escapeHtml(i18n.t('table.details'))}</button></td>` +
        '</tr>';
    }).join('');
  }

  /* ---------- i18n helpers ---------- */
  function updateI18n() {
    titleEl.textContent = i18n.t('app.title');
    langToggle.textContent = i18n.t('lang.toggle');
    searchInput.placeholder = i18n.t('search.placeholder');

    thEls.forEach((th) => {
      const key = th.getAttribute('data-i18n');
      if (key) th.textContent = i18n.t(key);
    });

    // Update "Details" buttons in rendered rows
    $$('.details-btn').forEach((btn) => {
      btn.textContent = i18n.t('table.details');
    });

    // Update message if visible
    if (messageArea.style.display !== 'none') {
      if (filtered.length === 0 && locales.length > 0) {
        messageArea.textContent = i18n.t('empty.search');
      }
    }
  }

  function setLang(lang) {
    i18n.setLang(lang);
    currentLang = lang;
    updateI18n();
    document.documentElement.lang = lang === 'uk' ? 'uk' : 'en';
  }

  function toggleLang() {
    const next = currentLang === 'uk' ? 'en' : 'uk';
    setLang(next);
  }

  /* ---------- filter ---------- */
  function filterLocales(query) {
    if (!query.trim()) {
      filtered = locales.slice();
      return;
    }

    const q = query.trim().toLowerCase();
    filtered = locales.filter((loc) => {
      const fields = [
        loc.locale,
        loc.language?.name,
        loc.country?.name,
        loc.country?.name_local,
        loc.country?.currency_code,
        loc.country?.capital_name,
      ];
      return fields.some((f) => f && f.toLowerCase().includes(q));
    });
  }

  function onSearch() {
    filterLocales(searchInput.value);
    renderTable(filtered);
  }

  /* ---------- fetch ---------- */
  async function loadData() {
    try {
      skeleton.style.display = '';
      table.style.display = 'none';
      messageArea.style.display = 'none';

      const res = await fetch('/api/locales');

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      locales = await res.json();

      if (!Array.isArray(locales)) {
        throw new Error('Invalid data format');
      }

      skeleton.style.display = 'none';
      filtered = locales.slice();
      renderTable(filtered);
      updateI18n();

    } catch (err) {
      console.error('Failed to load locales:', err);
      skeleton.style.display = 'none';
      table.style.display = 'none';
      messageArea.style.display = 'block';
      messageArea.textContent = i18n.t('error.load');
    }
  }

  /* ---------- init ---------- */
  function init() {
    // Restore language
    setLang(currentLang);

    // Event listeners
    langToggle.addEventListener('click', toggleLang);

    searchInput.addEventListener('input', onSearch);

    // Click on "Details" buttons
    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('.details-btn');
      if (btn) {
        const localeCode = btn.getAttribute('data-locale');
        // M3 will replace this
        alert(`Details for: ${localeCode}`);
      }
    });

    // Start
    loadData();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
