const AtlasLogo = {
  svgContent: null,

  getSVG(size = 36) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#6c5ce7"/>
          <stop offset="50%" stop-color="#a29bfe"/>
          <stop offset="100%" stop-color="#00cec9"/>
        </linearGradient>
        <linearGradient id="logoGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a29bfe" stop-opacity="0"/>
          <stop offset="100%" stop-color="#6c5ce7" stop-opacity="0.15"/>
        </linearGradient>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#6c5ce7" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#6c5ce7" stop-opacity="0"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <circle cx="50" cy="50" r="48" stroke="url(#logoGrad)" stroke-width="0.5" opacity="0.3"/>

      <circle cx="50" cy="50" r="45" fill="url(#glowGrad)" opacity="0.4"/>

      <g class="logo-orbit" opacity="0.4">
        <ellipse cx="50" cy="50" rx="44" ry="16" stroke="url(#logoGrad)" stroke-width="0.5" fill="none" stroke-dasharray="3 6" opacity="0.5"/>
        <ellipse cx="50" cy="50" rx="16" ry="44" stroke="url(#logoGrad)" stroke-width="0.5" fill="none" stroke-dasharray="3 6" opacity="0.3"/>
      </g>

      <circle cx="50" cy="50" r="28" stroke="url(#logoGrad)" stroke-width="0.8" opacity="0.4"/>

      <g class="globe-grid" opacity="0.25">
        <ellipse cx="50" cy="30" rx="18" ry="8" fill="none" stroke="currentColor" stroke-width="0.3"/>
        <ellipse cx="50" cy="50" rx="24" ry="8" fill="none" stroke="currentColor" stroke-width="0.3"/>
        <ellipse cx="50" cy="70" rx="18" ry="8" fill="none" stroke="currentColor" stroke-width="0.3"/>
        <line x1="26" y1="50" x2="74" y2="50" stroke="currentColor" stroke-width="0.3"/>
      </g>

      <circle cx="50" cy="50" r="20" fill="url(#logoGrad2)" opacity="0.3"/>

      <g class="clock-face">
        <circle cx="50" cy="50" r="18" stroke="url(#logoGrad)" stroke-width="1" fill="none"/>
        <g opacity="0.6">
          <line x1="50" y1="34" x2="50" y2="37" stroke="currentColor" stroke-width="0.8"/>
          <line x1="50" y1="63" x2="50" y2="66" stroke="currentColor" stroke-width="0.8"/>
          <line x1="34" y1="50" x2="37" y2="50" stroke="currentColor" stroke-width="0.8"/>
          <line x1="63" y1="50" x2="66" y2="50" stroke="currentColor" stroke-width="0.8"/>
        </g>
      </g>

      <line class="clock-hand hand-hour" x1="50" y1="50" x2="50" y2="38" stroke="url(#logoGrad)" stroke-width="1.5" stroke-linecap="round" filter="url(#glow)"/>
      <line class="clock-hand hand-minute" x1="50" y1="50" x2="54" y2="42" stroke="#a29bfe" stroke-width="1" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="2.5" fill="url(#logoGrad)" filter="url(#glow)"/>

      <g class="particles" opacity="0.6">
        <circle cx="28" cy="38" r="1" fill="#a29bfe" class="p1"/>
        <circle cx="72" cy="55" r="0.8" fill="#6c5ce7" class="p2"/>
        <circle cx="35" cy="68" r="1.2" fill="#00cec9" class="p3"/>
        <circle cx="65" cy="35" r="0.7" fill="#a29bfe" class="p4"/>
        <circle cx="42" cy="28" r="0.9" fill="#6c5ce7" class="p5"/>
        <circle cx="60" cy="70" r="0.6" fill="#00cec9" class="p6"/>
      </g>

      <circle cx="28" cy="38" r="3" fill="url(#logoGrad)" opacity="0.15"/>
      <circle cx="72" cy="55" r="3" fill="url(#logoGrad)" opacity="0.15"/>
      <circle cx="35" cy="68" r="3" fill="url(#logoGrad)" opacity="0.15"/>
    </svg>`;
  },

  getFullLogo(size = 36) {
    return this.getSVG(size);
  },

  getLogoRevealHTML() {
    return `<div class="logo-reveal-container">
      <div class="logo-reveal-svg">${this.getSVG(80)}</div>
      <div class="logo-reveal-text">
        <span class="logo-text-line logo-name">AtlasClock</span>
        <span class="logo-text-line logo-tagline">Global Time Synchronized</span>
      </div>
    </div>`;
  },

  logoStyles() {
    return `
      .logo-reveal-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }

      .logo-reveal-svg svg {
        width: 80px;
        height: 80px;
        filter: drop-shadow(0 0 30px rgba(108, 92, 231, 0.3));
      }

      .logo-reveal-text {
        text-align: center;
      }

      .logo-text-line {
        display: block;
      }

      .logo-name {
        font-family: 'Segoe UI', system-ui, sans-serif;
        font-size: 1.8rem;
        font-weight: 800;
        letter-spacing: 1px;
        background: linear-gradient(135deg, #6c5ce7, #a29bfe, #00cec9);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .logo-tagline {
        font-size: 0.8rem;
        color: var(--text-muted);
        letter-spacing: 4px;
        text-transform: uppercase;
        margin-top: 4px;
      }
    `;
  },

  initLogoReveal(container) {
    if (!container) return;
    container.innerHTML = this.getLogoRevealHTML();

    const styleTag = document.createElement('style');
    styleTag.textContent = this.logoStyles();
    document.head.appendChild(styleTag);

    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.logo-reveal-svg svg',
        { scale: 0, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1.2 }
      )
      .fromTo('.logo-name',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      )
      .fromTo('.logo-tagline',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.2'
      );

      this.animateParticles();
    }
  },

  animateParticles() {
    const particles = document.querySelectorAll('.logo-reveal-svg .particles circle');
    if (!particles.length || typeof gsap === 'undefined') return;

    particles.forEach((p, i) => {
      gsap.to(p, {
        x: () => (Math.random() - 0.5) * 20,
        y: () => (Math.random() - 0.5) * 20,
        opacity: () => Math.random() * 0.5 + 0.3,
        duration: 2 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3,
      });
    });
  },

  injectNavLogo() {
    const logoContainer = document.querySelector('.nav-logo');
    if (!logoContainer) return;

    logoContainer.innerHTML = this.getSVG(32) + ' <span>AtlasClock</span>';
  }
};
