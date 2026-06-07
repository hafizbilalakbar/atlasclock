(function() {
  'use strict';

  const Explorer3D = {
    currentRegion: 'all',
    cardAnimations: [],

    init() {
      this._setupRegionTabs();
      this._renderGrid('all');
      this._initSearch();
      this._initGSAPReveal();
    },

    _setupRegionTabs() {
      const tabs = document.getElementById('explorerRegionTabs');
      if (!tabs) return;
      tabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.explorer-region-tab');
        if (!tab) return;
        tabs.querySelectorAll('.explorer-region-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentRegion = tab.dataset.region || 'all';
        this._renderGrid(this.currentRegion);
      });
    },

    _getCountriesByRegion(region) {
      if (region === 'all') return COUNTRIES.filter(Boolean);
      const map = {
        'asia': ['JP','CN','IN','KR','SG','HK','TH','ID','MY','PH','VN','PK','BD','SA','AE','IL','TR','IR','IQ','KW','QA','OM','YE','SY','JO','LB','NP','LK','MM','KH','TW','KZ','UZ','TM','KG','TJ','AF','MN','BN','LA','MV'],
        'europe': ['GB','DE','FR','IT','ES','NL','CH','SE','NO','DK','FI','IE','AT','GR','PL','CZ','HU','RO','UA','PT','BE','BG','HR','SK','SI','EE','LV','LT','AL','MK','ME','RS','BA','LU','MT','IS','CY','GE','AM','AZ','BY','MD'],
        'africa': ['ZA','EG','NG','KE','MA','DZ','TN','LY','SD','ET','SO','TZ','UG','GH','CI','SN','CM','AO','MZ','MG','ZW','BW','NA','ZM','MW'],
        'americas': ['US','CA','BR','MX','AR','CO','CL','PE','UY','PY','BO','EC','VE','CR','PA','GT','CU','JM','DO','PR'],
        'oceania': ['AU','NZ','FJ','PG','SB','VU','WS','TO','MH','FM']
      };
      const codes = map[region] || [];
      return codes.map(getCountryByCode).filter(Boolean);
    },

    _renderGrid(region) {
      const grid = document.getElementById('explorer3DGrid');
      if (!grid) return;

      // Clear old clocks
      if (window._explorerClocks) {
        window._explorerClocks.forEach(id => ClockEngine.unregisterClock(id));
      }
      window._explorerClocks = [];

      const countries = this._getCountriesByRegion(region);
      // randomize for variety
      const shuffled = [...countries].sort(() => Math.random() - 0.5);
      const items = shuffled.slice(0, 30);

      grid.innerHTML = items.map(c => {
        const offsetNum = c.offset;
        const dayNight = (offsetNum >= -6 && offsetNum <= 6) ? 'day' : 'night';
        return `<div class="explorer-node" data-code="${c.code}" data-zone="${c.zone}" data-continent="${c.continent}" style="--node-delay:${Math.random()*0.5}s">
          <div class="explorer-node-glow"></div>
          <div class="explorer-node-flag"><span class="flag-wave flag-wave-glow">${c.flag}</span></div>
          <div class="explorer-node-name">${c.name}</div>
          <div class="explorer-node-capital">${c.capital}</div>
          <div class="explorer-node-time" id="ex-${c.code}">--:--:--</div>
          <div class="explorer-node-offset">${formatOffset(c.offset)}</div>
          <div class="explorer-node-hover-info">
            <span class="explorer-node-weather" id="exw-${c.code}"><i class="fas fa-cloud-sun"></i> --°C</span>
            <span class="explorer-node-cities" id="exc-${c.code}"><i class="fas fa-city"></i> <span>0 cities</span></span>
          </div>
          <a href="country.html?code=${c.code}" class="explorer-node-link">Explore →</a>
          <div class="explorer-node-orbit" style="animation-delay:${Math.random()*2}s"></div>
        </div>`;
      }).join('');

      // Register clocks
      items.forEach(c => {
        const id = 'ex-' + c.code;
        ClockEngine.registerClock(id, c.zone, (now) => {
          const t = ClockEngine.getTimeInTimezone(now, c.zone);
          const el = document.getElementById(id);
          if (el) Odometer.update(el, t.hours+':'+t.minutes+':'+t.seconds);
        });
        window._explorerClocks.push(id);

        // Weather
        (async (cc) => {
          try {
            const data = await WeatherAPI.fetchForCity(c.capital, cc);
            if (data) {
              const wEl = document.getElementById('exw-'+cc);
              if (wEl) wEl.innerHTML = '<i class="fas fa-cloud-sun"></i> ' + data.temp + '°C';
            }
          } catch {}
        })(c.code);
      });

      // GSAP entrance
      if (typeof gsap !== 'undefined') {
        const cards = grid.querySelectorAll('.explorer-node');
        gsap.fromTo(cards, { y: 60, opacity: 0, scale: 0.9 }, {
          y: 0, opacity: 1, scale: 1,
          duration: 0.6,
          stagger: 0.04,
          ease: 'power3.out',
          onComplete: () => {
            cards.forEach(card => {
              card.style.opacity = '1';
              card.style.transform = 'none';
            });
          }
        });
      }
    },

    _initSearch() {
      const inp = document.getElementById('explorerSearch3D');
      if (!inp) return;
      inp.addEventListener('input', () => {
        const q = inp.value.toLowerCase().trim();
        document.querySelectorAll('.explorer-node').forEach(node => {
          const match = node.textContent.toLowerCase().includes(q);
          if (typeof gsap !== 'undefined') {
            gsap.to(node, { opacity: match || !q ? 1 : 0.15, scale: match || !q ? 1 : 0.95, duration: 0.3, ease: 'power2.out' });
          } else {
            node.style.opacity = match || !q ? '1' : '0.15';
          }
        });
      });
    },

    _initGSAPReveal() {
      if (typeof gsap === 'undefined') return;
      const header = document.querySelector('.explorer-3d-header');
      if (header) {
        gsap.fromTo(header.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
      }
    }
  };

  window.Explorer3D = Explorer3D;
})();
