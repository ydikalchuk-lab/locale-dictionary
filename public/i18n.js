const i18n = {
  _current: 'uk',

  en: {
    'app.title':       'Locale Dictionaries',
    'loading':         'Loading locales…',
    'lang.toggle':     'UA',
    'search.placeholder': 'Search by language, country, or code…',
    'table.flag':      'Flag',
    'table.locale':    'Code',
    'table.language':  'Language',
    'table.country':   'Country',
    'table.currency':  'Currency',
    'table.tld':       'TLD',
    'table.details':   'Details',
    'error.load':      'Failed to load locale data.',
    'empty.search':    'Nothing found.',
    'modal.close':     'Close',
    'modal.capital':   'Capital',
    'modal.timezone':  'Timezone',
    'modal.continent': 'Continent',
    'modal.region':    'Region',
    'modal.area':      'Area',
    'modal.borders':   'Borders',
  },

  uk: {
    'app.title':       'Довідник локалей',
    'loading':         'Завантаження локалей…',
    'lang.toggle':     'EN',
    'search.placeholder': 'Пошук за мовою, країною або кодом…',
    'table.flag':      'Прапор',
    'table.locale':    'Код',
    'table.language':  'Мова',
    'table.country':   'Країна',
    'table.currency':  'Валюта',
    'table.tld':       'TLD',
    'table.details':   'Деталі',
    'error.load':      'Не вдалося завантажити дані локалей.',
    'empty.search':    'Нічого не знайдено.',
    'modal.close':     'Закрити',
    'modal.capital':   'Столиця',
    'modal.timezone':  'Часова зона',
    'modal.continent': 'Континент',
    'modal.region':    'Регіон',
    'modal.area':      'Площа',
    'modal.borders':   'Кордони',
  },

  get(lang, key) {
    return this[lang]?.[key] ?? key;
  },

  t(key) {
    return this.get(this._current, key);
  },

  setLang(lang) {
    if (this[lang]) {
      this._current = lang;
      localStorage.setItem('locale-dict-lang', lang);
    }
  },

  init() {
    const saved = localStorage.getItem('locale-dict-lang');
    this._current = saved === 'en' || saved === 'uk' ? saved : 'uk';
    return this._current;
  },
};
