(function() {
  'use strict';

  const PageTransitions = {
    overlay: null,

    init() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'page-transition-overlay';
      document.body.appendChild(this.overlay);

      document.querySelectorAll('[data-transition]').forEach(link => {
        link.addEventListener('click', (e) => {
          if (link.target === '_blank') return;
          const href = link.getAttribute('href');
          if (!href || href.startsWith('#') || href.startsWith('http')) return;
          e.preventDefault();
          this.transitionTo(href);
        });
      });

      // Intercept all internal links
      document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a || a.dataset.transition || a.target === '_blank') return;
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('javascript') || href.startsWith('mailto')) return;
        if (a.classList.contains('no-transition')) return;
        e.preventDefault();
        this.transitionTo(href);
      });
    },

    transitionTo(url) {
      if (!this.overlay) return;
      this.overlay.classList.add('active');
      setTimeout(() => {
        window.location.href = url;
      }, 500);
    }
  };

  window.PageTransitions = PageTransitions;
})();
