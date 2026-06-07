(function() {
  'use strict';

  const FuturisticLoader = {
    init() {
      const screen = document.getElementById('loadingScreen');
      if (!screen) return;
      const content = screen.querySelector('.loading-content');
      if (!content) return;

      content.innerHTML =
        '<div class="loading-clock-digits" id="loaderClock"></div>' +
        '<div class="loading-bar-container"><div class="loading-bar-fill"></div></div>' +
        '<div class="loading-text" id="loaderStatus">Synchronizing Time Network</div>';

      const container = document.getElementById('loaderClock');
      if (!container) return;

      const digits = '0123456789:'.split('');
      digits.forEach((d, i) => {
        const span = document.createElement('span');
        span.className = 'digit-ring';
        span.textContent = d;
        span.style.setProperty('--angle', (i * 30) + 'deg');
        span.style.animationDelay = (i * 0.15) + 's';
        container.appendChild(span);
      });

      const center = document.createElement('div');
      center.className = 'center-time';
      center.textContent = '00:00';
      container.appendChild(center);

      // Live updating center clock
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const update = () => {
        const now = new Date();
        try {
          const opts = { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false };
          center.textContent = new Intl.DateTimeFormat('en', opts).format(now);
        } catch {
          center.textContent = now.toTimeString().slice(0, 5);
        }
      };
      update();
      const clockIv = setInterval(update, 1000);

      // Status rotation
      const statuses = [
        'Synchronizing Time Network',
        'Calibrating Orbital Clocks',
        'Connecting Global Time Servers',
        'Aligning Timezone Grid',
        'Initializing 3D Engine',
        'Loading Geographic Data',
        'System Ready'
      ];
      let si = 0;
      const stEl = document.getElementById('loaderStatus');
      const stIv = setInterval(() => {
        si = (si + 1) % statuses.length;
        if (stEl) stEl.textContent = statuses[si];
      }, 400);

      // Hide after delay
      setTimeout(() => {
        clearInterval(clockIv);
        clearInterval(stIv);
        screen.classList.add('hidden');
      }, 1800);
    }
  };

  window.FuturisticLoader = FuturisticLoader;
})();
