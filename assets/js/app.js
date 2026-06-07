(function() {
  'use strict';

  const App = {
    pageType: 'home',

    init() {
      this.detectPage();
      this.initLoader();
      this.injectLogo();
      this.init3DEarth();
      this.initTransitions();
      this.initCityDeepSearch();

      const pageTasks = {
        'home': ['ScrollProgress','HeroClock','BrandSlider','WorldAnalytics','HomeStats','HomeSearch','GlobeInfo','HUDTime','Particles'],
        'world-clocks': ['Swiper3D','WorldAnalytics'],
        'explorer': ['Explorer3D'],
        'guide': ['UtcOffsetGrid'],
        'country': ['CountryDetail'],
        'features': ['ScrollProgress'],
        'about': ['ScrollProgress','Stats'],
      };

      (pageTasks[this.pageType] || []).forEach(t => {
        const fn = `init${t}`;
        if (typeof this[fn] === 'function') this[fn]();
      });

      this.initNav();
    },

    detectPage() {
      const p = window.location.pathname;
      if (p.includes('world-clocks')) this.pageType = 'world-clocks';
      else if (p.includes('explorer')) this.pageType = 'explorer';
      else if (p.includes('guide')) this.pageType = 'guide';
      else if (p.includes('features')) this.pageType = 'features';
      else if (p.includes('about')) this.pageType = 'about';
      else if (p.includes('country')) this.pageType = 'country';
      else this.pageType = 'home';
    },

    injectLogo() {
      document.querySelectorAll('.nav-logo').forEach(c => {
        if (typeof AtlasLogo !== 'undefined') {
          c.innerHTML = AtlasLogo.getSVG(30) + ' <span>AtlasClock</span>';
        }
      });
    },

    initNav() {
      document.querySelectorAll('.nav-toggle').forEach(t => {
        t.addEventListener('click', () => {
          document.querySelector('.nav-links')?.classList.toggle('open');
        });
      });
    },

    initLoader() {
      if (typeof FuturisticLoader !== 'undefined') {
        FuturisticLoader.init();
      } else {
        const l = document.querySelector('.loading-screen');
        if (l) setTimeout(() => l.classList.add('hidden'), 800);
      }
    },

    initTransitions() {
      if (typeof PageTransitions !== 'undefined') {
        setTimeout(() => PageTransitions.init(), 100);
      }
    },

    init3DEarth() {
      const c = document.getElementById('earth-container');
      if (c && typeof THREE !== 'undefined' && typeof Earth3D !== 'undefined') {
        setTimeout(() => Earth3D.init('earth-container'), 300);
      }
    },

    initSwiper3D() {
      if (typeof Swiper3D !== 'undefined') {
        setTimeout(() => Swiper3D.init(), 200);
      }
    },

    initBrandSlider() {
      if (typeof BrandSlider !== 'undefined') {
        setTimeout(() => BrandSlider.init(), 300);
      }
    },

    initExplorer3D() {
      if (typeof Explorer3D !== 'undefined') {
        setTimeout(() => Explorer3D.init(), 200);
      }
    },

    initScrollProgress() {
      const nav = document.querySelector('.navbar');
      if (!nav) return;
      const bar = document.createElement('div');
      bar.style.cssText = 'position:absolute;bottom:-1px;left:0;height:2px;background:linear-gradient(90deg,#6c5ce7,#00cec9);width:0%;transition:width.1s linear;z-index:1;';
      nav.appendChild(bar);
      window.addEventListener('scroll', () => {
        const p = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = p > 0 ? `${(window.scrollY / p) * 100}%` : '0%';
      }, { passive: true });
    },

    initHeroClock() {
      const el = document.querySelector('.hero-clock-time');
      if (!el) return;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      ClockEngine.registerClock('hero', tz, (now) => {
        const t = ClockEngine.getTimeInTimezone(now, tz);
        const h = document.querySelector('.hero-clock-time');
        const s = document.querySelector('.hero-clock-seconds');
        const d = document.querySelector('.hero-clock-date');
        if (h) Odometer.update(h, t.hours+':'+t.minutes+':'+t.seconds);
        if (s) Odometer.update(s, t.seconds);
        if (d) d.textContent = ClockEngine.getDateInTimezone(now, tz);
      });
    },

    initWorldClocks() {
      const grid = document.querySelector('.world-clock-grid');
      if (!grid) return;
      const items = COUNTRIES.filter(c => c).slice(0,6);
      grid.innerHTML = items.map(c =>
        `<div class="world-clock-item card-3d-tilt" data-zone="${c.zone}"><div class="country-flag flag-wave flag-wave-glow">${c.flag}</div><div class="city-name">${c.capital}</div><div class="country-name">${c.name}</div><div class="clock-time" id="wc-${c.code}">--:--</div><div class="clock-seconds" id="ws-${c.code}">--</div><div class="timezone-offset">${formatOffset(c.offset)}</div></div>`
      ).join('');
      items.forEach(c => {
        ClockEngine.registerClock('wc-'+c.code, c.zone, (now) => {
          const t = ClockEngine.getTimeInTimezone(now,c.zone);
          const te = document.getElementById('wc-'+c.code);
          const se = document.getElementById('ws-'+c.code);
          if(te) Odometer.update(te, t.hours+':'+t.minutes);
          if(se) Odometer.update(se, t.seconds);
        });
      });
    },

    initTimeCompare() {
      const sel = document.querySelectorAll('.compare-side select');
      if (sel.length < 2) return;
      const pop = COUNTRIES.filter(c => c.zone);
      pop.forEach(c => {
        sel[0].innerHTML += `<option value="${c.zone}">${c.flag} ${c.name} (${c.capital})</option>`;
        sel[1].innerHTML += `<option value="${c.zone}">${c.flag} ${c.name} (${c.capital})</option>`;
      });
      if (sel[0].options.length > 1) sel[0].selectedIndex = 1;
      if (sel[1].options.length > 3) sel[1].selectedIndex = 3;
      const up = () => {
        const n = new Date();
        for (let i=0;i<2;i++) {
          const z = sel[i].value;
          const t = ClockEngine.getTimeInTimezone(n,z);
          const te = document.getElementById('compare-time-'+(i+1));
          const de = document.getElementById('compare-date-'+(i+1));
          const oe = document.getElementById('compare-offset-'+(i+1));
          if(te) Odometer.update(te, t.hours+':'+t.minutes+':'+t.seconds);
          if(de) de.textContent = ClockEngine.getDateInTimezone(n,z);
          const co = getCountryByZone(z);
          if(oe) oe.textContent = co ? formatOffset(co.offset) : '';
        }
      };
      sel[0].addEventListener('change',up);
      sel[1].addEventListener('change',up);
      up();
      setInterval(up,1000);
    },

    initStats() {
      document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count)||0;
        const suffix = el.dataset.countSuffix||'';
        let cur = 0;
        const step = Math.max(1,Math.floor(target/50));
        const iv = setInterval(() => {
          cur = Math.min(cur+step,target);
          try {
            const val = cur + suffix;
            if (typeof Odometer !== 'undefined' && !isNaN(parseInt(cur))) {
              Odometer.update(el, val);
            } else {
              el.textContent = val;
            }
          } catch {}
          if(cur>=target) clearInterval(iv);
        },25);
      });
    },

    initParticles() {
      if (typeof AtlasAnimations !== 'undefined') {
        AtlasAnimations.createParticleCanvas(document.querySelector('.hero')||document.body);
      }
    },

    initHomeSearch() {
      const input = document.getElementById('homeSearch');
      const results = document.getElementById('homeSearchResults');
      if (!input || !results) return;

      const render = (q) => {
        q = q.toLowerCase().trim();
        if (!q) { results.classList.remove('open'); results.innerHTML = ''; return; }
        const matches = COUNTRIES.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.capital.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.zone.toLowerCase().includes(q)
        ).slice(0, 8);
        if (!matches.length) {
          results.innerHTML = '<div style="padding:16px;color:var(--text-muted);text-align:center;">No results found</div>';
          results.classList.add('open');
          return;
        }
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const now = ClockEngine.getTimeInTimezone(new Date(), tz);
        results.innerHTML = matches.map(c => {
          const ct = ClockEngine.getTimeInTimezone(new Date(), c.zone);
          return '<div class="search-result" data-code="'+c.code+'">' +
            '<span class="flag flag-wave">'+c.flag+'</span>' +
            '<div class="info"><div class="name">'+c.name+'</div><div class="meta">'+c.capital+' · '+c.zone+' · '+formatOffset(c.offset)+'</div></div>' +
            '<div class="time">'+ct.hours+':'+ct.minutes+':'+ct.seconds+'</div></div>';
        }).join('');
        results.classList.add('open');
      };

      input.addEventListener('input', () => render(input.value));
      input.addEventListener('focus', () => { if (input.value) render(input.value); });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.global-search')) results.classList.remove('open');
      });
      results.addEventListener('click', (e) => {
        const r = e.target.closest('.search-result');
        if (r && r.dataset.code) window.location.href = 'country.html?code=' + r.dataset.code;
      });
    },

    initGlobeInfo() {
      const flag = document.getElementById('giFlag');
      const name = document.getElementById('giName');
      const zone = document.getElementById('giZone');
      const time = document.getElementById('giTime');
      const date = document.getElementById('giDate');
      if (!time) return;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const ctry = getCountryByZone(tz) || COUNTRIES[0];
      if (flag && name && zone && ctry) {
        flag.textContent = ctry.flag;
        flag.className = 'flag-wave flag-wave-glow';
        name.textContent = ctry.name;
        zone.textContent = ctry.capital + ' · ' + ctry.zone;
      }
      ClockEngine.registerClock('globeInfo', tz, (now) => {
        const t = ClockEngine.getTimeInTimezone(now, tz);
        if (time) Odometer.update(time, t.hours+':'+t.minutes+':'+t.seconds);
        if (date) date.textContent = ClockEngine.getDateInTimezone(now, tz);
      });
    },

    initHomeStats() {
      const ids = ['statCountries','statZones','statCities','statUptime'];
      const targets = [141, 24, 500, 99];
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        let cur = 0;
        const target = targets[i];
        const step = Math.max(1, Math.floor(target / 40));
        const iv = setInterval(() => {
          cur = Math.min(cur + step, target);
          Odometer.update(el, cur);
          if (cur >= target) clearInterval(iv);
        }, 30);
      });
    },

    initHUDTime() {
      const tEl = document.getElementById('hudLocalTime');
      const dEl = document.getElementById('hudLocalDate');
      if (!tEl && !dEl) return;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      ClockEngine.registerClock('hudLocal', tz, (now) => {
        const t = ClockEngine.getTimeInTimezone(now, tz);
        if (tEl) tEl.textContent = t.hours + ':' + t.minutes + ':' + t.seconds;
        if (dEl) dEl.textContent = ClockEngine.getDateInTimezone(now, tz);
      });
    },

    initWorldAnalytics() {
      const up = () => {
        const n = new Date();
        let d=0,ni=0,b=0;
        COUNTRIES.forEach(c => {
          const h = parseInt(ClockEngine.getTimeInTimezone(n,c.zone).hours);
          if (h>=6&&h<18) d++; else ni++;
          if (h>=9&&h<17) b++;
        });
        ['daylightCount','nightCount','businessCount','wcDaylightCount','wcNightCount','wcBusinessCount'].forEach(id => {
          const e = document.getElementById(id);
          if (e) {
            if (id.startsWith('wc')) {
              Odometer.update(e, id==='wcDaylightCount'?d:id==='wcNightCount'?ni:b);
            } else {
              Odometer.update(e, id==='daylightCount'?d:id==='nightCount'?ni:b);
            }
          }
        });
      };
      up(); setInterval(up,2000);
    },

    initCountryExplorer() {
      const g = document.querySelector('.country-card-grid');
      if (!g) return;
      const items = COUNTRIES.slice(0,60);
      g.innerHTML = items.map(c =>
        `<div class="country-card card-3d-tilt" data-zone="${c.zone}" data-code="${c.code}"><div class="card-header"><div class="flag flag-wave flag-wave-glow">${c.flag}</div><div class="info"><h4>${c.capital}</h4><span>${c.name}</span></div></div><div class="time-display" id="ce-${c.code}">--:--:--</div><div class="timezone-info"><span><i class="fas fa-globe"></i> ${c.zone.split('/')[0]}</span><span><i class="fas fa-clock"></i> ${formatOffset(c.offset)}</span></div></div>`
      ).join('');
      items.forEach(c => {
        ClockEngine.registerClock('ce-'+c.code, c.zone, (now) => {
          const t = ClockEngine.getTimeInTimezone(now,c.zone);
          const e = document.getElementById('ce-'+c.code);
          if(e) Odometer.update(e, t.hours+':'+t.minutes+':'+t.seconds);
        });
      });
      g.addEventListener('click', e => {
        const card = e.target.closest('.country-card');
        if (card?.dataset.code) window.location.href = `country.html?code=${card.dataset.code}`;
      });
    },

    initExplorerCarousel() {
      const t = document.getElementById('explorerCarousel');
      if (!t) return;
      const codes = ['US','GB','JP','AU','DE','FR','IN','CN','BR','KR','SG','AE','IT','ES'];
      codes.forEach(code => {
        const c = getCountryByCode(code);
        if (!c) return;
        const item = document.createElement('div');
        item.className = 'carousel-item';
        item.innerHTML = `<div class="world-clock-item card-3d-tilt"><div class="country-flag flag-wave flag-wave-glow">${c.flag}</div><div class="city-name">${c.capital}</div><div class="clock-time" id="ec-${c.code}">--:--</div><div class="clock-seconds" id="ecs-${c.code}">--</div></div>`;
        t.appendChild(item);
        ClockEngine.registerClock('ec-'+c.code, c.zone, (now) => {
          const tm = ClockEngine.getTimeInTimezone(now,c.zone);
          const te = document.getElementById('ec-'+c.code);
          const se = document.getElementById('ecs-'+c.code);
          if(te) Odometer.update(te, tm.hours+':'+tm.minutes);
          if(se) Odometer.update(se, tm.seconds);
        });
      });
    },

    initSearch() {
      const inp = document.getElementById('explorerSearch');
      if (!inp) return;
      inp.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.country-card').forEach(c => {
          c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    },

    initFilters() {
      document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const f = tab.dataset.filter;
          document.querySelectorAll('.country-card').forEach(c => {
            if (f === 'all') { c.style.display = ''; return; }
            c.style.display = (c.dataset.zone||'').startsWith(f) ? '' : 'none';
          });
        });
      });
    },

    initUtcOffsetGrid() {
      const g = document.getElementById('utcOffsetGrid');
      if (!g) return;
      const groups = {};
      COUNTRIES.forEach(c => {
        const k = c.offset.toString();
        if (!groups[k]) groups[k] = [];
        groups[k].push(c);
      });
      g.innerHTML = Object.keys(groups).sort((a,b)=>parseFloat(a)-parseFloat(b)).map(key => {
        const of = parseFloat(key);
        return `<div class="stat-card" style="padding:14px;"><div style="font-size:0.82rem;color:var(--accent-2);font-family:var(--font-mono);margin-bottom:6px;">${formatOffset(of)}</div><div style="font-size:1.4rem;font-weight:700;">${groups[key].length}</div><div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">countries</div><div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:8px;">${groups[key].slice(0,6).map(c=>'<span class="flag-wave" style="font-size:1rem;">'+c.flag+'</span>').join('')}${groups[key].length>6?'<span style="font-size:0.7rem;color:var(--text-muted);">+'+(groups[key].length-6)+'</span>':''}</div></div>`;
      }).join('');
    },

    initCityDeepSearch() {
      // City-level deep search available globally
      window.citySearch = function(query) {
        if (!query || query.length < 2) return [];
        query = query.toLowerCase();
        const results = [];
        const citiesMap = {
          'US': 'New York,Los Angeles,Chicago,Houston,Miami,San Francisco,Seattle,Boston,Dallas,Atlanta',
          'GB': 'London,Manchester,Birmingham,Edinburgh,Liverpool,Glasgow,Bristol,Leeds,Sheffield',
          'JP': 'Tokyo,Osaka,Kyoto,Yokohama,Nagoya,Sapporo,Kobe,Fukuoka,Kawasaki,Saitama',
          'IN': 'Mumbai,Delhi,Bangalore,Chennai,Kolkata,Hyderabad,Pune,Ahmedabad,Jaipur,Surat',
          'CN': 'Beijing,Shanghai,Guangzhou,Shenzhen,Hong Kong,Chengdu,Nanjing,Wuhan,Hangzhou',
          'BR': 'Sao Paulo,Rio de Janeiro,Brasilia,Salvador,Fortaleza,Belo Horizonte,Manaus,Curitiba',
          'AU': 'Sydney,Melbourne,Brisbane,Perth,Adelaide,Gold Coast,Canberra,Newcastle,Hobart',
          'DE': 'Berlin,Munich,Hamburg,Frankfurt,Cologne,Stuttgart,Dusseldorf,Leipzig,Dresden',
          'FR': 'Paris,Marseille,Lyon,Toulouse,Nice,Nantes,Bordeaux,Lille,Montpellier',
          'CA': 'Toronto,Vancouver,Montreal,Calgary,Ottawa,Edmonton,Quebec,Winnipeg,Hamilton',
          'IT': 'Rome,Milan,Naples,Turin,Florence,Bologna,Venice,Genoa,Palermo',
          'ES': 'Madrid,Barcelona,Valencia,Seville,Malaga,Zaragoza,Murcia,Palma,Bilbao',
          'RU': 'Moscow,Saint Petersburg,Novosibirsk,Yekaterinburg,Kazan,Samara,Omsk,Chelyabinsk',
          'KR': 'Seoul,Busan,Incheon,Daegu,Daejeon,Gwangju,Suwon,Ulsan,Changwon',
          'MX': 'Mexico City,Guadalajara,Monterrey,Puebla,Tijuana,Leon,Juarez,Zapopan',
          'ZA': 'Johannesburg,Cape Town,Durban,Pretoria,Port Elizabeth,Bloemfontein,Soweto',
          'AR': 'Buenos Aires,Cordoba,Rosario,Mendoza,La Plata,Tucuman,Mar del Plata',
          'NG': 'Lagos,Abuja,Ibadan,Kano,Port Harcourt,Ilorin,Kaduna,Enugu',
          'EG': 'Cairo,Alexandria,Giza,Luxor,Aswan,Port Said,Suez,Sharm El Sheikh',
          'TR': 'Istanbul,Ankara,Izmir,Antalya,Bursa,Adana,Gaziantep,Konya',
          'PK': 'Karachi,Lahore,Faisalabad,Rawalpindi,Multan,Hyderabad,Gujranwala,Peshawar',
          'BD': 'Dhaka,Chittagong,Khulna,Rajshahi,Sylhet,Barisal,Rangpur,Mymensingh',
          'TH': 'Bangkok,Chiang Mai,Phuket,Pattaya,Krabi,Khon Kaen,Nakhon Ratchasima',
          'VN': 'Ho Chi Minh City,Hanoi,Da Nang,Hai Phong,Can Tho,Hue,Nha Trang,Bien Hoa',
          'ID': 'Jakarta,Surabaya,Bandung,Medan,Denpasar,Palembang,Semarang,Makassar',
          'PH': 'Manila,Quezon City,Cebu,Davao,Zamboanga,Antipolo,Pasig,Taguig',
          'MY': 'Kuala Lumpur,Penang,Johor Bahru,Kota Kinabalu,Malacca,Kuching,Petaling Jaya',
          'AE': 'Dubai,Abu Dhabi,Sharjah,Al Ain,Ajman,Ras Al Khaimah,Fujairah,Umm Al Quwain',
          'SA': 'Riyadh,Jeddah,Mecca,Medina,Dammam,Khobar,Taif,Buraydah',
          'IR': 'Tehran,Mashhad,Isfahan,Shiraz,Tabriz,Karaj,Ahvaz,Qom',
          'IQ': 'Baghdad,Basra,Mosul,Erbil,Kirkuk,Najaf,Karbala,Sulaymaniyah',
          'NZ': 'Auckland,Wellington,Christchurch,Hamilton,Tauranga,Dunedin,Palmerston North',
          'SG': 'Singapore',
          'HK': 'Hong Kong',
          'NO': 'Oslo,Bergen,Trondheim,Stavanger,Drammen,Fredrikstad,Kristiansand',
          'SE': 'Stockholm,Gothenburg,Malmo,Uppsala,Linkoping,Vasteras,Orebro,Helsingborg',
          'DK': 'Copenhagen,Aarhus,Odense,Aalborg,Esbjerg,Randers,Kolding,Horsens',
          'FI': 'Helsinki,Espoo,Tampere,Vantaa,Turku,Oulu,Lahti,Kuopio',
          'PL': 'Warsaw,Krakow,Wroclaw,Poznan,Gdansk,Szczecin,Bydgoszcz,Lublin',
          'NL': 'Amsterdam,Rotterdam,The Hague,Utrecht,Eindhoven,Groningen,Tilburg,Almere',
          'BE': 'Brussels,Antwerp,Ghent,Charleroi,Liège,Bruges,Namur,Leuven',
          'CH': 'Zurich,Geneva,Basel,Bern,Lausanne,Lucerne,St. Gallen,Lugano',
          'AT': 'Vienna,Salzburg,Graz,Linz,Innsbruck,Klagenfurt,Villach,Wels',
          'PT': 'Lisbon,Porto,Braga,Coimbra,Funchal,Amadora,Setubal,Aveiro',
          'GR': 'Athens,Thessaloniki,Patras,Heraklion,Larissa,Volos,Rhodes,Ioannina',
          'CZ': 'Prague,Brno,Ostrava,Plzen,Liberec,Olomouc,Ceske Budejovice,Hradec Kralove',
          'HU': 'Budapest,Debrecen,Szeged,Miskolc,Pecs,Gyor,Nyiregyhaza,Kecskemet',
          'UA': 'Kyiv,Kharkiv,Odesa,Dnipro,Lviv,Zaporizhzhia,Kryvyi Rih,Mykolaiv',
          'RO': 'Bucharest,Cluj-Napoca,Iasi,Timisoara,Constanta,Craiova,Galati,Brasov',
          'CL': 'Santiago,Valparaiso,Concepcion,La Serena,Antofagasta,Temuco,Rancagua',
          'CO': 'Bogota,Medellin,Cali,Barranquilla,Cartagena,Cucuta,Soledad,Ibague',
          'PE': 'Lima,Cusco,Arequipa,Trujillo,Chiclayo,Huancayo,Iquitos,Tacna',
          'KE': 'Nairobi,Mombasa,Kisumu,Nakuru,Eldoret,Ruiru,Malindi,Kitale',
          'MA': 'Casablanca,Rabat,Marrakech,Fez,Tangier,Agadir,Meknes,Oujda',
        };
        COUNTRIES.forEach(c => {
          const cities = citiesMap[c.code] || c.capital;
          cities.split(',').forEach(city => {
            if (city.toLowerCase().includes(query)) {
              results.push({
                countryName: c.name,
                countryCode: c.code,
                flag: c.flag,
                city: city.trim(),
                zone: c.zone,
                offset: c.offset
              });
            }
          });
        });
        return results.slice(0, 10);
      };
    },

    initCountryDetail() {
      const code = new URLSearchParams(window.location.search).get('code') || 'US';
      const country = getCountryByCode(code);
      const container = document.getElementById('countryContent');
      if (!container) return;

      if (!country) {
        container.innerHTML = '<div style="text-align:center;padding:60px 0;"><h2>Country Not Found</h2><a href="explorer.html" class="btn btn-ghost">Back</a></div>';
        return;
      }

      const majorCities = this._getMajorCities(country.code);

      container.innerHTML = `
        <nav class="breadcrumb"><a href="index.html">Home</a><span class="sep">/</span><a href="explorer.html">Explorer</a><span class="sep">/</span><span>${country.name}</span></nav>
        <div class="country-detail-header"><div class="flag-large flag-wave flag-wave-glow">${country.flag}</div><div class="info"><h1>${country.name}</h1><div class="sub">${country.capital} &middot; ${country.continent} &middot; ${country.zone}</div></div></div>
        <div class="grid-auto-sm" style="margin-bottom:var(--space-xl);">
          <div class="stat-card glass"><div class="stat-value" id="cd-time">--:--:--</div><div class="stat-label">Current Time</div></div>
          <div class="stat-card glass"><div class="stat-value">${formatOffset(country.offset)}</div><div class="stat-label">UTC Offset</div></div>
          <div class="stat-card glass"><div class="stat-value" id="cd-date">--</div><div class="stat-label">Date</div></div>
          <div class="stat-card glass"><div class="stat-value">${country.continent}</div><div class="stat-label">Region</div></div>
        </div>
        <div class="glass" style="padding:var(--space-lg);border-radius:var(--radius-md);margin-bottom:var(--space-xl);">
          <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:var(--space-md);"><i class="fas fa-sun" style="color:#fdcb6e;"></i> Day/Night Cycle</h3>
          <div class="sun-sim" data-zone="${country.zone}"><div class="sun" style="left:50%;"></div><div class="horizon"></div><div class="time-markers"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div></div>
        </div>
        <div id="weatherSection" style="margin-bottom:var(--space-xl);">
          <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:var(--space-md);"><i class="fas fa-cloud-sun" style="color:var(--accent-2);"></i> Weather in ${country.capital}</h3>
          <div id="weatherDisplay"><p style="color:var(--text-muted);font-size:0.9rem;"><i class="fas fa-spinner fa-spin"></i> Loading weather...</p></div>
        </div>
        <div id="citiesSection">
          <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:var(--space-md);"><i class="fas fa-city" style="color:var(--accent-2);"></i> Major Cities</h3>
          <div class="city-expand-grid" id="citiesGrid">${majorCities.map(city => {
            const cid = city.replace(/[\s']/g, '');
            return '<div class="city-expand-item">' +
              '<div class="city-name">'+city+'</div>' +
              '<div class="city-time" id="ct-'+cid+'">--:--</div>' +
              '<div class="city-weather" id="cd-'+cid+'">--</div></div>';
          }).join('')}</div>
        </div>
        <div style="text-align:center;margin-top:var(--space-xl);">
          <a href="explorer.html" class="btn btn-ghost"><i class="fas fa-arrow-left"></i> Back to Explorer</a>
        </div>`;

      ClockEngine.registerClock('cd-main', country.zone, (now) => {
        const t = ClockEngine.getTimeInTimezone(now,country.zone);
        const te = document.getElementById('cd-time');
        const de = document.getElementById('cd-date');
        if(te) Odometer.update(te, t.hours+':'+t.minutes+':'+t.seconds);
        if(de) de.textContent = ClockEngine.getDateInTimezone(now,country.zone);
        const sunEl = container.querySelector('.sun');
        if (sunEl) {
          const pct = ClockEngine.getSunPct(country.zone);
          sunEl.style.left = Math.min(95, Math.max(5, pct)) + '%';
        }
        if (typeof gsap !== 'undefined' && !container.dataset.animated) {
          container.dataset.animated = 'true';
          gsap.fromTo('.country-detail-header', {y:40,opacity:0}, {y:0,opacity:1,duration:1,ease:'power3.out'});
        }
      });

      majorCities.forEach(city => {
        const id = city.replace(/[\s']/g, '');
        ClockEngine.registerClock('cdc-'+id, country.zone, (now) => {
          const t = ClockEngine.getTimeInTimezone(now,country.zone);
          const te = document.getElementById('ct-'+id);
          const de = document.getElementById('cd-'+id);
          if(te) Odometer.update(te, t.hours+':'+t.minutes);
          if(de) de.textContent = ClockEngine.getDateInTimezone(now,country.zone);
        });
      });

      this._loadWeather(country);
    },

    _getMajorCities(code) {
      const map = {
        'US': ['New York','Los Angeles','Chicago','Houston','Miami'],
        'GB': ['London','Manchester','Birmingham','Edinburgh','Liverpool'],
        'JP': ['Tokyo','Osaka','Kyoto','Yokohama','Nagoya'],
        'AU': ['Sydney','Melbourne','Brisbane','Perth','Adelaide'],
        'DE': ['Berlin','Munich','Hamburg','Frankfurt','Cologne'],
        'FR': ['Paris','Marseille','Lyon','Toulouse','Nice'],
        'IN': ['Mumbai','Delhi','Bangalore','Chennai','Kolkata'],
        'CN': ['Beijing','Shanghai','Guangzhou','Shenzhen','Hong Kong'],
        'BR': ['Sao Paulo','Rio de Janeiro','Brasilia','Salvador','Fortaleza'],
        'CA': ['Toronto','Vancouver','Montreal','Calgary','Ottawa'],
        'RU': ['Moscow','Saint Petersburg','Novosibirsk','Yekaterinburg','Kazan'],
        'IT': ['Rome','Milan','Naples','Turin','Florence'],
        'ES': ['Madrid','Barcelona','Valencia','Seville','Malaga'],
        'KR': ['Seoul','Busan','Incheon','Daegu','Daejeon'],
        'ZA': ['Johannesburg','Cape Town','Durban','Pretoria','Port Elizabeth'],
        'AR': ['Buenos Aires','Cordoba','Rosario','Mendoza','La Plata'],
        'MX': ['Mexico City','Guadalajara','Monterrey','Puebla','Tijuana'],
        'SG': ['Singapore'],
        'HK': ['Hong Kong'],
        'AE': ['Dubai','Abu Dhabi','Sharjah','Al Ain','Ajman'],
        'CH': ['Zurich','Geneva','Basel','Bern','Lausanne'],
        'NL': ['Amsterdam','Rotterdam','The Hague','Utrecht','Eindhoven'],
        'SE': ['Stockholm','Gothenburg','Malmo','Uppsala','Linkoping'],
        'NO': ['Oslo','Bergen','Trondheim','Stavanger','Drammen'],
        'DK': ['Copenhagen','Aarhus','Odense','Aalborg','Esbjerg'],
        'FI': ['Helsinki','Espoo','Tampere','Vantaa','Turku'],
        'IE': ['Dublin','Cork','Limerick','Galway','Waterford'],
        'PT': ['Lisbon','Porto','Braga','Coimbra','Funchal'],
        'AT': ['Vienna','Salzburg','Graz','Linz','Innsbruck'],
        'GR': ['Athens','Thessaloniki','Patras','Heraklion','Larissa'],
        'PL': ['Warsaw','Krakow','Wroclaw','Poznan','Gdansk'],
        'TR': ['Istanbul','Ankara','Izmir','Antalya','Bursa'],
        'TH': ['Bangkok','Chiang Mai','Phuket','Pattaya','Krabi'],
        'VN': ['Ho Chi Minh City','Hanoi','Da Nang','Hai Phong','Can Tho'],
        'MY': ['Kuala Lumpur','Penang','Johor Bahru','Kota Kinabalu','Malacca'],
        'PH': ['Manila','Quezon City','Cebu','Davao','Zamboanga'],
        'ID': ['Jakarta','Surabaya','Bandung','Medan','Denpasar'],
        'NZ': ['Auckland','Wellington','Christchurch','Hamilton','Tauranga'],
        'EG': ['Cairo','Alexandria','Giza','Luxor','Aswan'],
        'NG': ['Lagos','Abuja','Ibadan','Kano','Port Harcourt'],
        'KE': ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret'],
        'MA': ['Casablanca','Rabat','Marrakech','Fez','Tangier'],
        'PE': ['Lima','Cusco','Arequipa','Trujillo','Chiclayo'],
        'CO': ['Bogota','Medellin','Cali','Barranquilla','Cartagena'],
        'CL': ['Santiago','Valparaiso','Concepcion','La Serena','Antofagasta'],
        'UA': ['Kyiv','Kharkiv','Odesa','Dnipro','Lviv'],
        'CZ': ['Prague','Brno','Ostrava','Plzen','Liberec'],
        'HU': ['Budapest','Debrecen','Szeged','Miskolc','Pecs'],
      };
      return map[code] || [getCountryByCode(code)?.capital || 'Unknown'];
    },

    async _loadWeather(country) {
      const wd = document.getElementById('weatherDisplay');
      if (!wd) return;

      try {
        const data = await WeatherAPI.fetchForCity(country.capital, country.code);
        if (!data) throw new Error('no data');

        const icon = WeatherAPI.getIconHTML(data.icon);
        const condIcon = WeatherAPI.getConditionIcon(data.condition);

        wd.innerHTML = `
          <div class="weather-card">
            <div class="weather-icon">${icon}</div>
            <div>
              <div style="display:flex;align-items:center;gap:var(--space-sm);flex-wrap:wrap;">
                <span class="weather-temp">${data.temp}°C</span>
                <span style="font-size:1rem;color:var(--text-secondary);">${data.description}</span>
              </div>
              <div class="weather-details" style="margin-top:var(--space-sm);">
                <span><i class="fas fa-temperature-low"></i> Feels like ${data.feels_like}°C</span>
                <span><i class="fas fa-tint"></i> Humidity ${data.humidity}%</span>
                <span><i class="fas fa-wind"></i> Wind ${data.wind_speed} km/h</span>
                ${data.source === 'fallback' ? '<span style="color:var(--accent-warm);font-size:0.78rem;"><i class="fas fa-exclamation-triangle"></i> Estimated</span>' : ''}
              </div>
            </div>
          </div>`;
      } catch {
        wd.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;">Weather data unavailable</p>';
      }
    },
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => App.init())
    : App.init();

  window.AtlasApp = App;
})();
