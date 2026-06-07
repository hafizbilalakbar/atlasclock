const ClockEngine = {
  activeClocks: [],
  tickTimer: null,

  init() {
    this._tick();
    this.tickTimer = setInterval(() => this._tick(), 1000);
    return this;
  },

  _tick() {
    const now = new Date();
    for (let i = 0; i < this.activeClocks.length; i++) {
      const c = this.activeClocks[i];
      if (c && typeof c.fn === 'function') {
        try { c.fn(now); } catch (e) { console.warn('[Clock]', c.id, e); }
      }
    }
  },

  register(id, tz, fn) {
    if (!id || typeof fn !== 'function') return;
    const existing = this.activeClocks.findIndex(c => c.id === id);
    const entry = { id, tz, fn };
    if (existing >= 0) this.activeClocks[existing] = entry;
    else this.activeClocks.push(entry);
    try { fn(new Date()); } catch (e) { console.warn('[Clock:init]', id, e); }
    return this;
  },

  registerClock(id, tz, fn) {
    return this.register(id, tz, fn);
  },

  unregister(id) {
    this.activeClocks = this.activeClocks.filter(c => c.id !== id);
  },

  getTime(tz) {
    if (!tz) return { h: '--', m: '--', s: '--' };
    try {
      const o = { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      const p = new Intl.DateTimeFormat('en-US', o).format(new Date()).split(':');
      return { h: p[0] || '00', m: p[1] || '00', s: p[2] || '00' };
    } catch {
      const c = typeof getCountryByZone === 'function' ? getCountryByZone(tz) : null;
      const off = c ? c.offset : 0;
      const u = new Date().getTime() + new Date().getTimezoneOffset() * 60000 + off * 3600000;
      const d = new Date(u);
      return {
        h: String(d.getHours()).padStart(2,'0'),
        m: String(d.getMinutes()).padStart(2,'0'),
        s: String(d.getSeconds()).padStart(2,'0'),
      };
    }
  },

  getTimeInTimezone(now, tz) {
    const t = this.getTime(tz);
    return { hours: t.h, minutes: t.m, seconds: t.s, full: t.h+':'+t.m+':'+t.s };
  },

  getDate(tz) {
    if (!tz) return '--';
    try {
      return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
    } catch {
      const c = typeof getCountryByZone === 'function' ? getCountryByZone(tz) : null;
      const off = c ? c.offset : 0;
      const u = new Date().getTime() + new Date().getTimezoneOffset() * 60000 + off * 3600000;
      return new Date(u).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  },

  getDateInTimezone(now, tz) {
    return this.getDate(tz);
  },

  getSunPct(tz) {
    try {
      const t = this.getTime(tz);
      return (parseInt(t.h) * 60 + parseInt(t.m)) / 1440 * 100;
    } catch { return 50; }
  },

  formatOffset(offset) {
    const s = offset >= 0 ? '+' : '-';
    const h = Math.floor(Math.abs(offset));
    const m = Math.round((Math.abs(offset) % 1) * 60);
    return `UTC${s}${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  },
};

(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ClockEngine.init());
  } else {
    ClockEngine.init();
  }
})();
