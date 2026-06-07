const Odometer = {
  instances: new Map(),

  getOrCreate(el, opts) {
    if (!el) return null;
    const id = el._odoId || (el._odoId = '_o' + Math.random().toString(36).slice(2, 8));
    let inst = this.instances.get(id);
    if (inst) return inst;
    inst = {
      id, el,
      options: Object.assign({ duration: 0.35, delay: 0, ease: 'power3.out' }, opts),
      digitEls: [],
      currentValue: '',
    };
    el.classList.add('odo');
    el.innerHTML = '';
    this.instances.set(id, inst);
    return inst;
  },

  _getHeight(el) {
    try {
      const h = parseFloat(getComputedStyle(el).fontSize);
      if (h && h >= 8) return h;
    } catch {}
    try {
      const lh = parseInt(getComputedStyle(el).lineHeight);
      if (lh && lh >= 8) return lh;
    } catch {}
    return 32;
  },

  update(el, value) {
    if (!el) return;
    const str = String(value);
    let inst = el._odoId ? this.instances.get(el._odoId) : null;
    if (!inst) inst = this.getOrCreate(el);
    if (!inst) return;
    if (str === inst.currentValue) return;
    inst.currentValue = str;

    const digits = str.split('');
    const h = this._getHeight(el);

    // Balance digit cells
    while (inst.digitEls.length < digits.length) {
      const cell = document.createElement('span');
      cell.className = 'odo-digit';
      el.appendChild(cell);
      inst.digitEls.push(cell);
    }
    while (inst.digitEls.length > digits.length) {
      const cell = inst.digitEls.pop();
      if (cell.parentNode) cell.parentNode.removeChild(cell);
    }

    digits.forEach((ch, i) => {
      const cell = inst.digitEls[i];
      if (!cell) return;
      const d = parseInt(ch);
      if (isNaN(d)) {
        if (!cell._staticText || cell._staticText !== ch) {
          cell.innerHTML = '<span class="odo-static">' + ch + '</span>';
          cell._staticText = ch;
          cell._strip = null;
        }
        return;
      }
      let strip = cell._strip;
      if (!strip || !strip.parentNode) {
        strip = document.createElement('span');
        strip.className = 'odo-strip';
        strip.innerHTML = '0123456789'.split('').map(n =>
          '<span class="odo-num">' + n + '</span>'
        ).join('');
        cell.innerHTML = '';
        cell.appendChild(strip);
        cell._strip = strip;
        cell._staticText = null;
        // First render — position immediately, no animation
        strip.style.transform = 'translateY(' + (-d * h) + 'px)';
        return;
      }
      // Animate to new digit
      const targetY = -(d * h);
      if (typeof gsap !== 'undefined') {
        try {
          gsap.killTweensOf(strip, 'y');
          gsap.to(strip, {
            y: targetY,
            duration: inst.options.duration,
            ease: inst.options.ease,
            overwrite: 'auto',
            onComplete: function() { strip.style.transform = 'translateY(' + targetY + 'px)'; },
          });
        } catch (e) {
          strip.style.transform = 'translateY(' + targetY + 'px)';
        }
      } else {
        strip.style.transform = 'translateY(' + targetY + 'px)';
      }
    });
  },

  destroy(el) {
    if (!el) return;
    const id = el._odoId;
    if (id) {
      const inst = this.instances.get(id);
      if (inst) {
        inst.el.innerHTML = '';
        this.instances.delete(id);
      }
      delete el._odoId;
    }
  },
};
