const PageRouter = {
  currentPage: '',
  navLinks: null,
  observer: null,

  init() {
    this.navLinks = document.querySelectorAll('.nav-links a');
    this.setActivePage();
    this.initNavScroll();
    this.initMobileNav();
    this.initSmoothScroll();
  },

  setActivePage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    this.navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  },

  initNavScroll() {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const scroll = window.scrollY;
      const navbar = document.querySelector('.navbar');

      if (scroll > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      this.updateScrollProgress();
      lastScroll = scroll;
    }, { passive: true });
  },

  updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    const bar = document.querySelector('.scroll-progress');
    if (bar) {
      bar.style.width = `${progress}%`;
    }
  },

  initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!toggle) return;

    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar')) {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
      }
    });
  },

  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  },
};

document.addEventListener('DOMContentLoaded', () => PageRouter.init());
