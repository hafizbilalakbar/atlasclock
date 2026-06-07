(function() {
  'use strict';

  const BrandSlider = {
    swiper: null,

    init() {
      const swiperEl = document.querySelector('.brand-slider .swiper');
      if (!swiperEl || typeof Swiper === 'undefined') return;

      this.createSlides();

      this.swiper = new Swiper(swiperEl, {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        loop: true,
        speed: 800,
        coverflowEffect: {
          rotate: 20,
          stretch: 0,
          depth: 300,
          modifier: 1.2,
          slideShadows: false,
        },
        autoplay: {
          delay: 4000,
          disableOnInteraction: true,
        },
        pagination: {
          el: '.brand-slider .swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.brand-slider .swiper-button-next',
          prevEl: '.brand-slider .swiper-button-prev',
        },
        on: {
          slideChange: function() {
            const active = this.slides[this.activeIndex];
            if (active) {
              const icon = active.querySelector('.brand-slide-icon');
              if (icon && typeof gsap !== 'undefined') {
                gsap.fromTo(icon, { scale: 0.8, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)' });
              }
            }
          }
        }
      });

      this._initGSAPAnimations();
    },

    createSlides() {
      const wrapper = document.querySelector('.brand-slider .swiper-wrapper');
      if (!wrapper) return;

      const slides = [
        { icon: 'fa-globe-americas', title: 'Global Time Intelligence', desc: 'Real-time synchronization across 141 countries with 3D Earth visualization and orbital time rings.', color: '#6c5ce7', features: ['141 Countries', '24 Time Zones', 'Real-time Sync', '3D Globe'] },
        { icon: 'fa-robot', title: 'AI Time Dashboard', desc: 'AI-powered predictive time analytics with intelligent scheduling across multiple time zones.', color: '#00cec9', features: ['Smart Scheduling', 'Pattern Detection', 'Peak Hours AI', 'Analytics'] },
        { icon: 'fa-cloud-sun', title: 'World Weather Engine', desc: 'Live global weather data integrated with time intelligence for every country and major city.', color: '#fdcb6e', features: ['Temperature', 'Humidity', 'Wind Speed', 'Forecast'] },
        { icon: 'fa-cube', title: '3D Earth Explorer', desc: 'Interactive Three.js globe with glowing city nodes, orbital rings, and real-time rotation.', color: '#a29bfe', features: ['Wireframe Globe', 'City Lights', 'Orbit Rings', 'Mouse Control'] },
        { icon: 'fa-clock', title: 'Time Zone Analyzer', desc: 'Deep timezone analytics with daylight distribution, business hours tracking, and offset comparison.', color: '#fd79a8', features: ['Offset Analysis', 'DST Tracking', 'Daylight Map', 'Compare Tool'] },
        { icon: 'fa-stopwatch', title: 'Smart Stopwatch System', desc: 'Precision time measurement with odometer rolling digits, lap tracking, and millisecond accuracy.', color: '#55efc4', features: ['Odometer Digits', 'Lap Tracking', 'Millisecond', 'Export Data'] },
        { icon: 'fa-satellite', title: 'Global Time Network', desc: 'Distributed time server network ensuring sub-second accuracy across all connected zones.', color: '#74b9ff', features: ['Atomic Sync', 'Server Mesh', '99.9% Uptime', 'Low Latency'] },
      ];

      wrapper.innerHTML = slides.map((s, i) => `
        <div class="swiper-slide brand-slide" data-color="${s.color}" style="--slide-accent:${s.color}">
          <div class="brand-slide-glow" style="background:radial-gradient(circle at center, ${s.color}15, transparent 70%)"></div>
          <div class="brand-slide-icon"><i class="fas ${s.icon}"></i></div>
          <h3 class="brand-slide-title">${s.title}</h3>
          <p class="brand-slide-desc">${s.desc}</p>
          <div class="brand-slide-features">${s.features.map(f => '<span class="brand-feature-tag">'+f+'</span>').join('')}</div>
          <div class="brand-slide-number">${String(i+1).padStart(2,'0')}</div>
          <div class="brand-slide-connector" style="background:linear-gradient(90deg,${s.color},transparent)"></div>
        </div>`).join('');
    },

    _initGSAPAnimations() {
      if (typeof gsap === 'undefined') return;
      const slides = document.querySelectorAll('.brand-slide');
      slides.forEach(s => {
        s.addEventListener('mouseenter', () => {
          gsap.to(s, { scale: 1.03, duration: 0.4, ease: 'power2.out' });
          gsap.to(s.querySelector('.brand-slide-icon'), { scale: 1.15, duration: 0.4, ease: 'back.out(2)' });
        });
        s.addEventListener('mouseleave', () => {
          gsap.to(s, { scale: 1, duration: 0.4, ease: 'power2.out' });
          gsap.to(s.querySelector('.brand-slide-icon'), { scale: 1, duration: 0.4, ease: 'power2.out' });
        });
      });
    }
  };

  window.BrandSlider = BrandSlider;
})();
