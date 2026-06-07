(function() {
  'use strict';

  const Swiper3D = {
    swiper: null,
    currentRegion: 'all',

    init() {
      const swiperEl = document.querySelector('.swiper-3d-world .swiper');
      if (!swiperEl) return;

      const regionTabs = document.querySelectorAll('.region-tab');
      regionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          regionTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.currentRegion = tab.dataset.region || 'all';
          this.updateSlides();
        });
      });

      this.createSlides('all');

      if (typeof Swiper !== 'undefined') {
        this.swiper = new Swiper(swiperEl, {
          effect: 'coverflow',
          grabCursor: true,
          centeredSlides: true,
          slidesPerView: 'auto',
          loop: true,
          coverflowEffect: {
            rotate: 30,
            stretch: 0,
            depth: 200,
            modifier: 1,
            slideShadows: false,
          },
          autoplay: {
            delay: 3500,
            disableOnInteraction: true,
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
        });
      }

      // Init clocks for all slides
      this.initSlideClocks('all');
    },

    getCountriesByRegion(region) {
      const regionMap = {
        'asia': ['JP','CN','IN','KR','SG','HK','TH','ID','MY','PH','VN','PK','BD','SA','AE','IL','TR','IR','IQ','KW','QA','OM','YE','SY','JO','LB','NP','LK','MM','KH','TW','KZ','UZ','TM','KG','TJ','AF','MN','BN','LA','MV'],
        'europe': ['GB','DE','FR','IT','ES','NL','CH','SE','NO','DK','FI','IE','AT','GR','PL','CZ','HU','RO','UA','PT','BE','BG','HR','SK','SI','EE','LV','LT','AL','MK','ME','RS','BA','LU','MT','IS','CY','GE','AM','AZ','BY','MD'],
        'africa': ['ZA','EG','NG','KE','MA','DZ','TN','LY','SD','ET','SO','TZ','UG','GH','CI','SN','CM','AO','MZ','MG','ZW','BW','NA','ZM','MW'],
        'americas': ['US','CA','BR','MX','AR','CO','CL','PE','UY','PY','BO','EC','VE','CR','PA','GT','CU','JM','DO','PR'],
        'oceania': ['AU','NZ','FJ','PG','SB','VU','WS','TO','MH','FM']
      };
      const codes = regionMap[region] || [];
      return codes.map(code => {
        const c = getCountryByCode(code);
        return c;
      }).filter(Boolean);
    },

    createSlides(region) {
      const wrapper = document.querySelector('.swiper-3d-world .swiper-wrapper');
      if (!wrapper) return;

      let countries;
      if (region === 'all') {
        countries = COUNTRIES.filter(Boolean);
      } else {
        countries = this.getCountriesByRegion(region);
      }

      // Shuffle for variety
      countries = [...countries].sort(() => Math.random() - 0.5);
      if (countries.length > 40) countries = countries.slice(0, 40);

      wrapper.innerHTML = countries.map((c, i) => {
        const weatherIcon = this.getWeatherIcon(c.code);
        const cities = this.getCities(c.code);
        return `
          <div class="swiper-slide" data-code="${c.code}" data-zone="${c.zone}">
            <div class="slide-flag flag-wave flag-wave-glow">${c.flag}</div>
            <div class="slide-country">${c.name}</div>
            <div class="slide-capital">${c.capital}</div>
            <div class="slide-time" id="s3d-time-${c.code}-${i}">--:--:--</div>
            <div class="slide-seconds" id="s3d-sec-${c.code}-${i}">--</div>
            <div class="slide-offset">${formatOffset(c.offset)}</div>
            <div class="slide-weather"><i class="fas fa-cloud-sun"></i> <span id="s3d-wth-${c.code}-${i}">--°C</span></div>
            <div class="slide-cities">${cities.slice(0,4).map(ct => '<span>'+ct+'</span>').join('')}</div>
            <div style="margin-top:12px;">
              <a href="country.html?code=${c.code}" class="btn btn-sm btn-ghost no-transition" style="font-size:0.7rem;padding:4px 14px;">
                <i class="fas fa-expand"></i> Explore
              </a>
            </div>
          </div>`;
      }).join('');
    },

    initSlideClocks(region) {
      // Kill old clocks with s3d prefix
      if (window._s3dClocks) {
        window._s3dClocks.forEach(id => ClockEngine.unregisterClock(id));
      }
      window._s3dClocks = [];

      const slides = document.querySelectorAll('.swiper-3d-world .swiper-slide');
      slides.forEach(slide => {
        const code = slide.dataset.code;
        const zone = slide.dataset.zone;
        const c = getCountryByCode(code);
        if (!c || !zone) return;

        const timeId = 's3d-time-' + code;
        const secId = 's3d-sec-' + code;
        const wthId = 's3d-wth-' + code;

        // Time clock
        const clockId = 's3d-' + code;
        ClockEngine.registerClock(clockId, zone, (now) => {
          const t = ClockEngine.getTimeInTimezone(now, zone);
          const te = slide.querySelector('.slide-time');
          const se = slide.querySelector('.slide-seconds');
          if (te) Odometer.update(te, t.hours+':'+t.minutes+':'+t.seconds);
          if (se) Odometer.update(se, t.seconds);
        });
        window._s3dClocks.push(clockId);

        // Weather
        (async (countryCode) => {
          try {
            const data = await WeatherAPI.fetchForCity(c.capital, countryCode);
            if (data) {
              const wt = slide.querySelector('.slide-weather span');
              if (wt) wt.textContent = data.temp + '°C';
            }
          } catch {}
        })(code);
      });
    },

    updateSlides() {
      if (this.swiper) {
        this.swiper.destroy(true, true);
      }
      this.createSlides(this.currentRegion);
      if (typeof Swiper !== 'undefined') {
        const swiperEl = document.querySelector('.swiper-3d-world .swiper');
        if (swiperEl) {
          this.swiper = new Swiper(swiperEl, {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: true,
            coverflowEffect: {
              rotate: 30,
              stretch: 0,
              depth: 200,
              modifier: 1,
              slideShadows: false,
            },
            autoplay: {
              delay: 3500,
              disableOnInteraction: true,
            },
            pagination: {
              el: '.swiper-pagination',
              clickable: true,
            },
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
          });
        }
      }
      this.initSlideClocks(this.currentRegion);
    },

    getWeatherIcon(code) {
      const icons = {
        'US': 'sun', 'GB': 'cloud', 'JP': 'sun', 'AU': 'sun',
        'BR': 'cloud-rain', 'DE': 'cloud', 'IN': 'sun', 'FR': 'cloud',
        'CN': 'cloud-sun', 'RU': 'snowflake', 'CA': 'snowflake',
        'KR': 'cloud-sun', 'IT': 'sun', 'ES': 'sun', 'MX': 'sun',
        'ZA': 'sun', 'SE': 'snowflake', 'NO': 'snowflake', 'SG': 'cloud-rain',
        'NZ': 'cloud', 'AE': 'sun', 'NL': 'cloud', 'CH': 'sun',
      };
      return icons[code] || 'sun';
    },

    getCities(code) {
      const map = {
        'US': 'New York,Los Angeles,Chicago,Houston,Miami',
        'GB': 'London,Manchester,Birmingham,Edinburgh,Liverpool',
        'IN': 'Mumbai,Delhi,Bangalore,Chennai,Kolkata',
        'JP': 'Tokyo,Osaka,Kyoto,Yokohama,Nagoya',
        'CN': 'Beijing,Shanghai,Guangzhou,Shenzhen,Hong Kong',
        'AU': 'Sydney,Melbourne,Brisbane,Perth,Adelaide',
        'BR': 'Sao Paulo,Rio de Janeiro,Brasilia,Salvador',
        'DE': 'Berlin,Munich,Hamburg,Frankfurt,Cologne',
        'FR': 'Paris,Marseille,Lyon,Toulouse,Nice',
        'CA': 'Toronto,Vancouver,Montreal,Calgary,Ottawa',
        'RU': 'Moscow,Saint Petersburg,Novosibirsk,Yekaterinburg',
        'ZA': 'Johannesburg,Cape Town,Durban,Pretoria',
        'AE': 'Dubai,Abu Dhabi,Sharjah,Al Ain',
        'KR': 'Seoul,Busan,Incheon,Daegu,Daejeon',
        'SG': 'Singapore',
        'HK': 'Hong Kong',
        'MY': 'Kuala Lumpur,Penang,Johor Bahru',
        'TH': 'Bangkok,Chiang Mai,Phuket,Pattaya',
        'ID': 'Jakarta,Surabaya,Bandung,Medan',
        'PH': 'Manila,Quezon City,Cebu,Davao',
        'VN': 'Ho Chi Minh City,Hanoi,Da Nang',
        'IR': 'Tehran,Mashhad,Isfahan,Shiraz',
        'SA': 'Riyadh,Jeddah,Mecca,Medina',
        'TR': 'Istanbul,Ankara,Izmir,Antalya',
        'EG': 'Cairo,Alexandria,Giza,Luxor',
        'NG': 'Lagos,Abuja,Ibadan,Kano',
        'KE': 'Nairobi,Mombasa,Kisumu,Nakuru',
        'MA': 'Casablanca,Rabat,Marrakech,Fez',
        'MX': 'Mexico City,Guadalajara,Monterrey,Puebla',
        'AR': 'Buenos Aires,Cordoba,Rosario,Mendoza',
        'CO': 'Bogota,Medellin,Cali,Barranquilla',
        'CL': 'Santiago,Valparaiso,Concepcion,La Serena',
        'PE': 'Lima,Cusco,Arequipa,Trujillo',
        'UA': 'Kyiv,Kharkiv,Odesa,Dnipro,Lviv',
        'PL': 'Warsaw,Krakow,Wroclaw,Poznan',
        'IT': 'Rome,Milan,Naples,Turin,Florence',
        'ES': 'Madrid,Barcelona,Valencia,Seville',
        'SE': 'Stockholm,Gothenburg,Malmo,Uppsala',
        'NO': 'Oslo,Bergen,Trondheim,Stavanger',
        'DK': 'Copenhagen,Aarhus,Odense,Aalborg',
        'FI': 'Helsinki,Espoo,Tampere,Vantaa',
        'IE': 'Dublin,Cork,Limerick,Galway',
        'PT': 'Lisbon,Porto,Braga,Coimbra',
        'AT': 'Vienna,Salzburg,Graz,Linz',
        'GR': 'Athens,Thessaloniki,Patras,Heraklion',
        'CH': 'Zurich,Geneva,Basel,Bern',
        'NL': 'Amsterdam,Rotterdam,The Hague,Utrecht',
        'BE': 'Brussels,Antwerp,Ghent,Charleroi',
        'CZ': 'Prague,Brno,Ostrava,Plzen',
        'HU': 'Budapest,Debrecen,Szeged,Miskolc',
        'RO': 'Bucharest,Cluj-Napoca,Iasi,Timisoara',
        'NZ': 'Auckland,Wellington,Christchurch,Hamilton',
      };
      return (map[code] || '').split(',');
    }
  };

  window.Swiper3D = Swiper3D;
})();
