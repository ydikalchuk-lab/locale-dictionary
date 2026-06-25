(function () {
  'use strict';

  /* ---------- state ---------- */
  let locales = [];
  let filtered = [];
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
  const modalOverlay = $('#modal-overlay');
  const modalContent = $('#modal-content');
  const modalClose   = $('#modal-close');

  /* ---------- helpers ---------- */
  function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, (c) => map[c]);
  }

  function getFlagClass(loc) {
    const code = loc.country?.iso_3166_1_alpha2 || loc.country?.code || '';
    return code ? 'fi fi-' + code.toLowerCase() : '';
  }

  /* ---------- render ---------- */
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
      const flagClass = getFlagClass(loc);
      const code = escapeHtml(loc.locale || '');
      const currency = escapeHtml(loc.country?.currency_code || '—');
      const tld = loc.country?.tld ? '.' + loc.country.tld : '—';

      return '<tr>' +
        `<td><span class="fi ${flagClass}"></span></td>` +
        `<td class="code">${code}</td>` +
        `<td>${escapeHtml(langName)}</td>` +
        `<td>${escapeHtml(countryName)}</td>` +
        `<td class="curr">${currency}</td>` +
        `<td class="tld">${tld}</td>` +
        `<td><button class="details-btn" data-locale="${code}">${escapeHtml(i18n.t('table.details'))}</button></td>` +
        '</tr>';
    }).join('');
  }

  /* ---------- i18n ---------- */
  function updateI18n() {
    titleEl.textContent = i18n.t('app.title');
    langToggle.textContent = i18n.t('lang.toggle');
    searchInput.placeholder = i18n.t('search.placeholder');

    thEls.forEach((th) => {
      const key = th.getAttribute('data-i18n');
      if (key) th.textContent = i18n.t(key);
    });

    $$('.details-btn').forEach((btn) => {
      btn.textContent = i18n.t('table.details');
    });

    if (modalOverlay.style.display !== 'none') {
      modalContent.querySelectorAll('[data-i18n-modal]').forEach((el) => {
        const key = el.getAttribute('data-i18n-modal');
        if (key) el.textContent = i18n.t(key);
      });
    }

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
    setLang(currentLang === 'uk' ? 'en' : 'uk');
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

  /* ---------- modal ---------- */
  function formatArea(sqKm) {
    if (typeof sqKm !== 'number') return '—';
    return sqKm.toLocaleString() + ' km²';
  }

  function findLocale(code) {
    return locales.find((l) => l.locale === code) || null;
  }

  function renderModalContent(loc) {
    const c = loc.country || {};
    const l = loc.language || {};
    const flagClass = getFlagClass(loc);
    const langName = l.name || '—';
    const countryName = c.name || '—';
    const code = escapeHtml(loc.locale || '');
    const currency = c.currency_code || '—';
    const currencyName = c.currency || c.currency_local || '';
    const currencyFull = currencyName ? `${currency} (${escapeHtml(currencyName)})` : currency;
    const tld = c.tld ? '.' + c.tld : '—';
    const capital = c.capital_name || '—';
    const tz = c.timezones?.length ? c.timezones.join(', ') : '—';
    const continent = c.continent || '—';
    const region = c.region || '—';
    const area = formatArea(c.area_sq_km);
    let bordersHtml = '—';
    if (c.borders?.length) {
      bordersHtml = '<div class="modal-borders">' +
        c.borders.map((code2) => {
          const neighbour = locales.find((l2) => l2.country?.iso_3166_1_alpha2 === code2);
          const nFlag = neighbour ? '<span class="fi fi-' + code2.toLowerCase() + '"></span>' : '';
          const nName = neighbour?.country?.name || code2;
          return `<span class="modal-border-item">${nFlag}&nbsp;${escapeHtml(nName)}</span>`;
        }).join('') + '</div>';
    }

    modalContent.innerHTML =
      '<div class="modal-flag"><span class="fi ' + flagClass + '" style="font-size:3rem"></span></div>' +
      '<div class="modal-locale-code">' + code + '</div>' +
      '<hr class="modal-divider">' +
      '<div class="modal-grid">' +
        '<div class="modal-label" data-i18n-modal="table.language">' + escapeHtml(i18n.t('table.language')) + '</div>' +
        '<div class="modal-value">' + escapeHtml(langName) + '</div>' +
        '<div class="modal-label" data-i18n-modal="table.country">' + escapeHtml(i18n.t('table.country')) + '</div>' +
        '<div class="modal-value">' + escapeHtml(countryName) + '</div>' +
        '<div class="modal-label" data-i18n-modal="modal.capital">' + escapeHtml(i18n.t('modal.capital')) + '</div>' +
        '<div class="modal-value">' + escapeHtml(capital) + '</div>' +
        '<div class="modal-label" data-i18n-modal="table.currency">' + escapeHtml(i18n.t('table.currency')) + '</div>' +
        '<div class="modal-value">' + currencyFull + '</div>' +
        '<div class="modal-label" data-i18n-modal="table.tld">' + escapeHtml(i18n.t('table.tld')) + '</div>' +
        '<div class="modal-value">' + tld + '</div>' +
        '<div class="modal-label" data-i18n-modal="modal.timezone">' + escapeHtml(i18n.t('modal.timezone')) + '</div>' +
        '<div class="modal-value">' + escapeHtml(tz) + '</div>' +
        '<div class="modal-label" data-i18n-modal="modal.continent">' + escapeHtml(i18n.t('modal.continent')) + '</div>' +
        '<div class="modal-value">' + escapeHtml(continent) + '</div>' +
        '<div class="modal-label" data-i18n-modal="modal.region">' + escapeHtml(i18n.t('modal.region')) + '</div>' +
        '<div class="modal-value">' + escapeHtml(region) + '</div>' +
        '<div class="modal-label" data-i18n-modal="modal.area">' + escapeHtml(i18n.t('modal.area')) + '</div>' +
        '<div class="modal-value">' + area + '</div>' +
        '<div class="modal-label" data-i18n-modal="modal.borders">' + escapeHtml(i18n.t('modal.borders')) + '</div>' +
        '<div class="modal-value full-width">' + bordersHtml + '</div>' +
      '</div>';
  }

  function openModal(localeCode) {
    const loc = findLocale(localeCode);
    if (!loc) return;
    renderModalContent(loc);
    modalOverlay.style.display = '';
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modalOverlay.style.display = 'none';
    document.body.classList.remove('modal-open');
  }

  /* ---------- fetch ---------- */
  async function loadData() {
    try {
      skeleton.style.display = '';
      table.style.display = 'none';
      messageArea.style.display = 'none';

      const res = await fetch('/locales.json');

      if (!res.ok) throw new Error('HTTP ' + res.status);

      locales = await res.json();
      if (!Array.isArray(locales)) throw new Error('Invalid data');

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
    setLang(currentLang);
    langToggle.addEventListener('click', toggleLang);
    searchInput.addEventListener('input', onSearch);

    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('.details-btn');
      if (btn) openModal(btn.getAttribute('data-locale'));
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.style.display !== 'none') closeModal();
    });

    loadData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
