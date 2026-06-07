const AtlasAnimations = {
  inited: false,

  init() {
    if (this.inited) return;
    this.inited = true;

    if (typeof gsap !== 'undefined') {
      try {
        gsap.registerPlugin(ScrollTrigger);
      } catch {}
      this.scrollReveal();
      this.counters();
      this.logoSpin();
      this.pageTransitions();
    }
  },

  scrollReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length || typeof ScrollTrigger === 'undefined') {
      els.forEach((el, i) => {
        const d = parseFloat(el.dataset.revealDelay) || 0;
        setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, (i * 100) + d * 1000);
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      });
      setTimeout(() => {
        els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
      }, 500);
      return;
    }
    els.forEach(el => {
      const delay = parseFloat(el.dataset.revealDelay) || 0;
      gsap.fromTo(el,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, delay, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
        }
      );
    });
  },

  counters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count) || 0;
      const suffix = el.dataset.countSuffix || '';
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(el,
          { textContent: 0 },
          { textContent: target, duration: 2.5, ease: 'power2.out', snap: { textContent: 1 },
            scrollTrigger: { trigger: el, start: 'top 85%' },
            onUpdate: () => { el.textContent = Math.round(parseFloat(el.textContent)) + suffix; }
          }
        );
      }
    });
  },

  logoSpin() {
    const svg = document.querySelector('.nav-logo svg');
    if (!svg || typeof gsap === 'undefined') return;
    const h = svg.querySelector('.hand-hour');
    const m = svg.querySelector('.hand-minute');
    if (h) gsap.to(h, { rotation: 360, transformOrigin: '50% 50%', duration: 60, repeat: -1, ease: 'none' });
    if (m) gsap.to(m, { rotation: 360, transformOrigin: '50% 50%', duration: 3600, repeat: -1, ease: 'none' });
  },

  pageTransitions() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('a[data-transition]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;
        e.preventDefault();
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0a0a1a;transform:scaleY(0);transform-origin:bottom;';
        document.body.appendChild(overlay);
        gsap.to(overlay, { scaleY: 1, duration: 0.5, ease: 'power4.inOut', onComplete: () => { window.location.href = href; } });
      });
    });
  },

  createParticleCanvas(container) {
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let particles = [];
    let running = true;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5, opacity: Math.random() * 0.4 + 0.1,
      });
    }

    function animate() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 92, 231, ${p.opacity})`;
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(108, 92, 231, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; canvas.remove(); };
  },
};

document.addEventListener('DOMContentLoaded', () => AtlasAnimations.init());
