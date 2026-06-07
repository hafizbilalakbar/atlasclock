const TimeAPI = {
  cache: {},
  cacheDuration: 30000,
  primaryAPI: 'https://worldtimeapi.org/api/timezone',
  fallbackAPI: 'https://timeapi.io/api/Time/current/zone',
  online: navigator.onLine,
  ready: false,

  init() {
    this.updateOnlineStatus();
    window.addEventListener('online', () => { this.online = true; });
    window.addEventListener('offline', () => { this.online = false; });
    this.ready = true;
    return this;
  },

  updateOnlineStatus() {
    this.online = navigator.onLine;
  },

  async fetchTimeForZone(timezone) {
    if (!timezone) return this._generateFallback(null);

    const now = Date.now();
    const cached = this.cache[timezone];
    if (cached && (now - cached.timestamp < this.cacheDuration)) {
      return cached.data;
    }

    let data;
    if (this.online) {
      data = await this._tryFetch(timezone);
    }
    if (!data) {
      data = this._generateFallback(timezone);
    }
    this.cache[timezone] = { data, timestamp: Date.now() };
    return data;
  },

  async _tryFetch(timezone) {
    const endpoints = [
      `${this.primaryAPI}/${timezone}`,
      `${this.fallbackAPI}?timeZone=${encodeURIComponent(timezone)}`,
    ];

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const resp = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
        clearTimeout(timer);
        if (!resp.ok) continue;
        const json = await resp.json();
        return {
          datetime: json.datetime || json.currentLocalTime || new Date().toISOString(),
          utc_offset: json.utc_offset || json.standardUtcOffset || '+00:00',
          timezone: json.timezone || timezone,
          abbreviation: json.abbreviation || json.timeZoneAbbreviation || '',
          source: 'api',
        };
      } catch {
        continue;
      }
    }
    return null;
  },

  _generateFallback(timezone) {
    const country = typeof getCountryByZone === 'function' ? getCountryByZone(timezone) : null;
    const offset = country ? country.offset : 0;
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const local = new Date(utc + offset * 3600000);
    const sign = offset >= 0 ? '+' : '';
    const h = Math.floor(Math.abs(offset));
    const m = (Math.abs(offset) % 1) * 60;

    return {
      datetime: local.toISOString(),
      utc_offset: `${sign}${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,
      timezone: timezone || 'UTC',
      abbreviation: country ? country.code : 'UTC',
      source: 'fallback',
    };
  },

  async prefetchPopular() {
    const zones = [
      'America/New_York', 'Europe/London', 'Asia/Tokyo',
      'Australia/Sydney', 'Europe/Paris', 'Asia/Kolkata',
      'America/Los_Angeles', 'Asia/Dubai', 'Africa/Cairo',
    ];
    await Promise.allSettled(zones.map(z => this.fetchTimeForZone(z)));
  },
};

TimeAPI.init();
