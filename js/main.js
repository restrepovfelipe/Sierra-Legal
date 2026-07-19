/* ============================================================
   SIERRA LEGAL — Motion & Interaction
   GSAP + ScrollTrigger. Respects prefers-reduced-motion.
   ============================================================ */

document.documentElement.classList.add('js');

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Register GSAP plugins if available
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

/* ==== NAV: condense on scroll ==== */
(() => {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ==== NAV: mobile toggle ==== */
(() => {
  const btn = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!btn || !menu) return;

  const close = () => {
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    menu.classList.remove('is-open');
    document.body.style.overflow = '';
  };
  const open = () => {
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    menu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();

/* ==== HERO: split title into chars ==== */
(() => {
  const target = document.querySelector('[data-split]');
  if (!target) return;

  // Split text into per-char spans, wrapped in per-word containers to prevent
  // mid-word breaks. Rebuilds `node` in-place, preserving <em> shells.
  const chars = [];
  const build = (src, dest) => {
    Array.from(src.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const collapsed = child.textContent.replace(/\s+/g, ' ');
        if (!collapsed.trim()) return;
        const words = collapsed.split(' ');
        words.forEach((word, i) => {
          if (word.length) {
            const w = document.createElement('span');
            w.className = 'split-word';
            for (const ch of word) {
              const c = document.createElement('span');
              c.className = 'split-char';
              c.textContent = ch;
              w.appendChild(c);
              chars.push(c);
            }
            dest.appendChild(w);
          }
          if (i < words.length - 1) {
            dest.appendChild(document.createTextNode(' '));
          }
        });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const shell = child.cloneNode(false); // clone tag, drop children
        dest.appendChild(shell);
        build(child, shell);
      }
    });
  };
  // Build into a detached fragment, then swap
  const frag = document.createDocumentFragment();
  build(target, frag);
  target.replaceChildren(frag);

  if (prefersReduced) {
    chars.forEach(c => { c.style.opacity = 1; c.style.transform = 'none'; });
    return;
  }

  gsap.to(chars, {
    y: 0, opacity: 1,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.018,
    delay: 0.15
  });
})();

/* ==== HERO: reveal eyebrow, lead, CTA ==== */
(() => {
  if (prefersReduced) {
    document.querySelectorAll('.hero [data-reveal]').forEach(el => el.classList.add('is-in'));
    return;
  }
  const heroReveals = document.querySelectorAll('.hero [data-reveal]');
  gsap.to(heroReveals, {
    opacity: 1, y: 0,
    duration: 1.0,
    ease: 'expo.out',
    stagger: 0.14,
    delay: 0.35,
    onStart: () => heroReveals.forEach(el => el.classList.add('is-in'))
  });
})();

/* ==== HERO: cinematic scene motion (light drift + silhouette breathing + parallax) ==== */
(() => {
  const scene = document.querySelector('.hero__scene');
  if (!scene || prefersReduced) return;

  // Continuous ambient motion — subtle light ray drift
  const rays = scene.querySelector('.hero__rays');
  if (rays) {
    gsap.to(rays, {
      x: 40, y: 20,
      duration: 14,
      ease: 'sine.inOut',
      yoyo: true, repeat: -1
    });
  }

  // Silhouette breathing
  scene.querySelectorAll('[data-breathe]').forEach((group, i) => {
    gsap.to(group, {
      scale: 1.006,
      transformOrigin: '50% 100%',
      duration: 4 + i * 0.6,
      ease: 'sine.inOut',
      yoyo: true, repeat: -1
    });
  });

  // Attorney hand micro-gesture
  const hands = scene.querySelector('.hero__hands');
  if (hands) {
    gsap.to(hands, {
      y: -4, rotation: -0.8,
      transformOrigin: '50% 100%',
      duration: 3.4,
      ease: 'sine.inOut',
      yoyo: true, repeat: -1
    });
  }

  // Scroll-linked parallax: scene scales & drifts down as user scrolls out
  gsap.to(scene, {
    scale: 1.08,
    y: 40,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5
    }
  });

  // Hero content fade + lift on scroll
  gsap.to('.hero__content', {
    opacity: 0.2,
    y: -60,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5
    }
  });
})();

/* ==== SCROLL REVEALS ==== */
(() => {
  const stagger = (elements) => {
    if (prefersReduced) { elements.forEach(el => el.classList.add('is-in')); return; }
    elements.forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: 'expo.out',
        delay: i * 0.06,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => el.classList.add('is-in')
        }
      });
    });
  };

  // Standalone reveals (outside hero)
  const single = document.querySelectorAll('[data-reveal]:not(.hero [data-reveal])');
  single.forEach(el => {
    if (prefersReduced) { el.classList.add('is-in'); return; }
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.9,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => el.classList.add('is-in')
      }
    });
  });

  // Group reveals (children stagger)
  document.querySelectorAll('[data-reveal-group]').forEach(group => {
    const kids = Array.from(group.children);
    if (prefersReduced) { kids.forEach(k => k.classList.add('is-in')); return; }
    ScrollTrigger.create({
      trigger: group,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(kids, {
          opacity: 1, y: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.08,
          onStart: () => kids.forEach(k => k.classList.add('is-in'))
        });
      }
    });
  });
})();

/* ============================================================
   WHY CHOOSE US — motion checklist
   Each item "checks off" independently as it scrolls into view
   (CSS handles the ring/checkmark stroke-draw + text lift, keyed off
   the .is-in class) — a per-item trigger rather than one grouped
   stagger, so it reads as progressively ticking down a list while
   scrolling rather than all five checking at once.
   ============================================================ */
(() => {
  const items = document.querySelectorAll('.why__item');
  if (!items.length) return;

  if (prefersReduced) {
    items.forEach(item => item.classList.add('is-in'));
    return;
  }

  items.forEach(item => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 85%',
      once: true,
      onEnter: () => item.classList.add('is-in')
    });
  });
})();

/* ==== TRUST STRIP: number counter ==== */
(() => {
  const cells = document.querySelectorAll('[data-count]');
  cells.forEach(el => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = (target % 1 !== 0) ? 1 : 0;

    const format = (v) => {
      // es-CO uses "." as the thousands separator (2.000, not 2,000) —
      // matters for the indemnizaciones counter (2000), a no-op for
      // the smaller ones (9, 50, 97).
      const n = decimals ? v.toFixed(1) : Math.round(v).toLocaleString('es-CO');
      return `${prefix}${n}${suffix}`;
    };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        if (prefersReduced) { el.textContent = format(target); return; }
        const proxy = { v: 0 };
        gsap.to(proxy, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = format(proxy.v); }
        });
      }
    });
  });
})();

/* ==== AREA CARDS: mouse-glow tracking ==== */
(() => {
  document.querySelectorAll('.area-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
})();

/* ==== MAGNETIC BUTTONS ==== */
(() => {
  if (prefersReduced) return;
  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    const strength = 0.28;
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power3.out' });
      btn.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      btn.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    btn.addEventListener('pointerleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });
})();

/* ==== FAQ ACCORDION ==== */
(() => {
  document.querySelectorAll('[data-faq]').forEach(btn => {
    const answer = btn.nextElementSibling;
    if (!answer) return;

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      // Close siblings for cleaner UX
      const list = btn.closest('.faq__list');
      if (list && !expanded) {
        list.querySelectorAll('[data-faq][aria-expanded="true"]').forEach(other => {
          if (other === btn) return;
          other.setAttribute('aria-expanded', 'false');
          const a = other.nextElementSibling;
          if (a) a.style.maxHeight = '0px';
        });
      }
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (expanded) {
        answer.style.maxHeight = '0px';
      } else {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // Recalc on resize
  window.addEventListener('resize', () => {
    document.querySelectorAll('[data-faq][aria-expanded="true"]').forEach(btn => {
      const answer = btn.nextElementSibling;
      if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
    });
  });
})();

/* ==== CONTACT FORM ==== */
(() => {
  const form = document.querySelector('.contacto__form');
  if (!form) return;
  const note = form.querySelector('[data-form-status]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      note.textContent = 'Por favor complete todos los campos requeridos.';
      note.className = 'contacto__form-note is-error';
      form.reportValidity();
      return;
    }

    // Simulate send — replace with real backend later
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>Enviando…</span>';
    note.textContent = '';
    note.className = 'contacto__form-note';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.innerHTML = original;
      note.textContent = '✓ Recibimos su consulta. Un abogado le responderá en menos de 24 horas hábiles.';
      note.className = 'contacto__form-note is-success';
    }, 1000);
  });
})();

/* ============================================================
   CUSTOM CURSOR — desktop pointer-fine devices only
   ============================================================ */
(() => {
  if (prefersReduced) return;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (!finePointer) return;

  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.innerHTML = '<span class="cursor__ring"></span><span class="cursor__dot"></span>';
  document.body.appendChild(cursor);

  const state = { x: 0, y: 0, tx: 0, ty: 0 };
  const ring = cursor.querySelector('.cursor__ring');
  const dot = cursor.querySelector('.cursor__dot');

  window.addEventListener('pointermove', (e) => {
    state.x = e.clientX;
    state.y = e.clientY;
    if (!cursor.classList.contains('is-visible')) cursor.classList.add('is-visible');
    // Instant dot position
    gsap.set(dot, { x: state.x, y: state.y });
  }, { passive: true });

  window.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
  window.addEventListener('pointerenter', () => cursor.classList.add('is-visible'));
  window.addEventListener('pointerdown', () => cursor.classList.add('is-press'));
  window.addEventListener('pointerup', () => cursor.classList.remove('is-press'));

  // Smoothly trail the ring
  gsap.ticker.add(() => {
    state.tx += (state.x - state.tx) * 0.18;
    state.ty += (state.y - state.ty) * 0.18;
    gsap.set(ring, { x: state.tx, y: state.ty });
  });

  // Hover state on interactive elements
  const hoverables = 'a, button, [role="button"], input, textarea, select, label, [data-magnetic], .faq__q, .area-card, .caso, .testimonio, .casos-hero__card, .lightbox__close, .lightbox__nav';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(hoverables)) cursor.classList.add('is-hover');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(hoverables) && !e.relatedTarget?.closest?.(hoverables)) {
      cursor.classList.remove('is-hover');
    }
  });
})();

/* ============================================================
   HERO MOUSE PARALLAX — layered depth from cursor
   ============================================================ */
(() => {
  if (prefersReduced) return;
  const hero = document.querySelector('.hero');
  const scene = document.querySelector('.hero__scene');
  if (!hero || !scene) return;

  const family = scene.querySelector('.hero__group--family');
  const attorney = scene.querySelector('.hero__group--attorney');
  const rays = scene.querySelector('.hero__rays');
  const rim = scene.querySelector('.hero__rim');

  const state = { x: 0, y: 0 };
  const layers = [
    { el: rays, depth: -12 },       // background rays drift opposite
    { el: family, depth: 8 },        // family shifts a bit
    { el: attorney, depth: -10 },    // attorney shifts opposite (parallax depth)
    { el: rim, depth: -14 }
  ].filter(l => l.el);

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    // Normalized -1..1 from center
    state.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    state.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    layers.forEach(({ el, depth }) => {
      gsap.to(el, {
        x: state.x * depth,
        y: state.y * depth * 0.6,
        duration: 1.2,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
  });

  hero.addEventListener('pointerleave', () => {
    layers.forEach(({ el }) => {
      gsap.to(el, { x: 0, y: 0, duration: 1.6, ease: 'expo.out' });
    });
  });
})();

/* ============================================================
   CARD 3D TILT — cases + areas + testimonials
   ============================================================ */
(() => {
  if (prefersReduced) return;
  const tiltCards = document.querySelectorAll('.caso, .testimonio');
  tiltCards.forEach(card => {
    const strength = 8; // max degrees
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, {
        rotationY: nx * strength,
        rotationX: -ny * strength,
        transformPerspective: 900,
        transformOrigin: 'center',
        duration: 0.6,
        ease: 'power3.out'
      });
    });
    card.addEventListener('pointerleave', () => {
      gsap.to(card, {
        rotationY: 0, rotationX: 0,
        duration: 0.9,
        ease: 'expo.out'
      });
    });
  });
})();

/* ============================================================
   PORTRAIT SPOTLIGHT — cursor-follow warm light on About
   ============================================================ */
(() => {
  const frame = document.querySelector('.sobre__portrait-frame');
  if (!frame) return;
  frame.addEventListener('pointermove', (e) => {
    const r = frame.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    frame.style.setProperty('--px', `${px}%`);
    frame.style.setProperty('--py', `${py}%`);
  });
})();

/* ============================================================
   NAV LINK: inject data-label attr for the wipe underline
   ============================================================ */
(() => {
  document.querySelectorAll('.nav__links a').forEach(a => {
    a.setAttribute('data-label', a.textContent.trim());
  });
})();

/* ============================================================
   TRUST NUMBERS: re-scrub on hover
   ============================================================ */
(() => {
  if (prefersReduced) return;
  document.querySelectorAll('.trust__cell').forEach(cell => {
    const numEl = cell.querySelector('[data-count]');
    if (!numEl) return;
    cell.addEventListener('pointerenter', () => {
      const target = parseFloat(numEl.dataset.count);
      const prefix = numEl.dataset.prefix || '';
      const suffix = numEl.dataset.suffix || '';
      const proxy = { v: target * 0.65 };
      gsap.to(proxy, {
        v: target,
        duration: 0.9,
        ease: 'expo.out',
        onUpdate: () => { numEl.textContent = `${prefix}${Math.round(proxy.v)}${suffix}`; }
      });
    });
  });
})();

/* ============================================================
   EDITORIAL MARKER: cycling proof track + index counter
   ============================================================ */
(() => {
  const track = document.querySelector('[data-eyebrow-track]');
  if (!track) return;
  const items = Array.from(track.querySelectorAll('.marker__item'));
  if (items.length < 2) return;

  const marker = track.closest('.marker');
  const currentEl = marker?.querySelector('[data-marker-current]');
  const totalEl = marker?.querySelector('[data-marker-total]');
  const pad = n => String(n).padStart(2, '0');
  if (totalEl) totalEl.textContent = pad(items.length);

  // Lock the track width to the widest item so nothing jitters
  const setTrackWidth = () => {
    const widths = items.map(el => {
      const clone = el.cloneNode(true);
      clone.style.cssText = 'position:absolute;opacity:0;transform:none;filter:none;white-space:nowrap;visibility:hidden;font-family:' + getComputedStyle(el).fontFamily + ';font-size:' + getComputedStyle(el).fontSize + ';font-style:italic;';
      document.body.appendChild(clone);
      const w = clone.getBoundingClientRect().width;
      clone.remove();
      return w;
    });
    const max = Math.ceil(Math.max(...widths));
    track.style.minWidth = max + 'px';
  };
  setTrackWidth();
  window.addEventListener('resize', setTrackWidth);

  let idx = 0;
  let paused = false;

  const setIndex = (n) => {
    if (!currentEl) return;
    // Micro-transition on the counter itself: brief fade
    currentEl.style.opacity = '0.3';
    setTimeout(() => {
      currentEl.textContent = pad(n + 1);
      currentEl.style.opacity = '1';
    }, 200);
  };

  const advance = () => {
    if (paused || prefersReduced) return;
    const current = items[idx];
    const nextIdx = (idx + 1) % items.length;
    const next = items[nextIdx];
    current.classList.remove('is-active');
    current.classList.add('is-leaving');
    next.classList.remove('is-leaving');
    next.classList.add('is-active');
    setTimeout(() => current.classList.remove('is-leaving'), 700);
    idx = nextIdx;
    setIndex(idx);
  };

  const INTERVAL = 4200;
  setInterval(advance, INTERVAL);

  // Pause on hover so users can read
  if (marker) {
    marker.addEventListener('pointerenter', () => { paused = true; });
    marker.addEventListener('pointerleave', () => { paused = false; });
  }

  // Init: counter is a smooth transition for the fade
  if (currentEl) currentEl.style.transition = 'opacity 200ms ease';
})();

/* ============================================================
   HERO: casos reales carousel — buttons + drag-to-scroll
   ============================================================ */
(() => {
  const track = document.querySelector('[data-casos-track]');
  const prevBtn = document.querySelector('[data-casos-prev]');
  const nextBtn = document.querySelector('[data-casos-next]');
  if (!track) return;

  const cardGap = 16;
  const cardStep = () => (track.querySelector('.casos-hero__card')?.offsetWidth || 320) + cardGap;

  const updateArrows = () => {
    if (!prevBtn || !nextBtn) return;
    const max = track.scrollWidth - track.clientWidth - 1;
    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = track.scrollLeft >= max;
  };
  updateArrows();
  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);

  prevBtn?.addEventListener('click', () => track.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
  nextBtn?.addEventListener('click', () => track.scrollBy({ left: cardStep(), behavior: 'smooth' }));

  // Drag to scroll (desktop mouse)
  let isDown = false, startX = 0, startScroll = 0, dragged = false;
  track.addEventListener('pointerdown', e => {
    isDown = true; dragged = false;
    startX = e.clientX;
    startScroll = track.scrollLeft;
  });
  window.addEventListener('pointermove', e => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) dragged = true;
    track.scrollLeft = startScroll - dx;
  });
  window.addEventListener('pointerup', () => { isDown = false; });
  // Suppress the click on a link/card if the pointer actually dragged
  track.addEventListener('click', e => {
    if (dragged) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  // Continuous marquee: drifts slowly and NEVER stops on its own.
  //
  // Rather than trying to catch every event that can mean "the user is
  // interacting" (pointerdown/up/cancel, focus, drag, native touch-scroll,
  // mouse wheel, keyboard arrows on a focused scrollable div...) — which is
  // exactly the whack-a-mole that caused this to freeze permanently on
  // mobile (a touch fires 'pointerdown' but the browser hands the gesture to
  // native scrolling and fires 'pointercancel', not 'pointerup', so the old
  // resume-on-release listener never ran) — this instead compares the
  // track's ACTUAL scrollLeft each frame against what the ticker itself set
  // last frame. Any mismatch, from any cause whatsoever, means something
  // else is driving the scroll right now: back off and resync silently. Once
  // the position has been externally-undisturbed for a short grace period,
  // resume the drift from wherever it was left. No event listeners, no
  // pause/resume state machine, no platform-specific gaps to miss.
  //
  // Deliberately NOT gated on prefersReduced: this is a slow (26px/s), linear,
  // non-flashing drift with full manual override — unlike the parallax/zoom
  // effects elsewhere on the site, which DO respect prefers-reduced-motion.
  {
    const SPEED = 26;              // px/sec — slow, elegant drift
    const IDLE_BEFORE_RESUME = 500; // ms of undisturbed position before resuming
    const DRIFT_TOLERANCE = 1;      // px — ignores float rounding, not real interaction
    let direction = 1;
    let expected = track.scrollLeft;
    let idleSince = 0;
    let lastTime = null;

    const tick = (time) => {
      requestAnimationFrame(tick);
      if (lastTime === null) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      if (document.hidden) return;

      const max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return;

      const actual = track.scrollLeft;
      if (Math.abs(actual - expected) > DRIFT_TOLERANCE) {
        // Something else (touch, native momentum scroll, drag, wheel,
        // keyboard, an arrow-button's smooth scrollBy) is moving it right
        // now. Track along with it and reset the idle clock.
        expected = actual;
        idleSince = time;
        return;
      }

      if (time - idleSince < IDLE_BEFORE_RESUME) return;

      let next = expected + direction * SPEED * dt;
      if (next >= max) { next = max; direction = -1; }
      else if (next <= 0) { next = 0; direction = 1; }
      track.scrollLeft = next;
      expected = next;
    };
    requestAnimationFrame(tick);

    // Reset the frame-delta baseline when the tab regains visibility so a
    // long background stint doesn't produce one huge jump on return.
    document.addEventListener('visibilitychange', () => { lastTime = null; });
  }
})();

/* ============================================================
   LIGHTBOX — full-size sentencia/conciliación viewer
   ============================================================ */
(() => {
  const lightbox = document.querySelector('[data-lightbox]');
  if (!lightbox) return;
  const imgEl = lightbox.querySelector('[data-lightbox-img]');
  const captionEl = lightbox.querySelector('[data-lightbox-caption-el]');
  const closeBtn = lightbox.querySelector('[data-lightbox-close]');
  const prevBtn = lightbox.querySelector('[data-lightbox-prev]');
  const nextBtn = lightbox.querySelector('[data-lightbox-next]');

  let pages = [];
  let pageIndex = 0;
  let lastFocused = null;

  const render = () => {
    imgEl.src = pages[pageIndex];
    const multi = pages.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;
  };

  const open = trigger => {
    const src = trigger.getAttribute('data-lightbox-src') || '';
    pages = src.split(',').map(s => s.trim()).filter(Boolean);
    if (!pages.length) return;
    pageIndex = 0;
    captionEl.textContent = trigger.getAttribute('data-lightbox-caption') || '';
    render();
    lastFocused = document.activeElement;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const close = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocused?.focus?.();
  };

  document.querySelectorAll('[data-lightbox-src]').forEach(trigger => {
    trigger.addEventListener('click', () => open(trigger));
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });
  prevBtn.addEventListener('click', () => { pageIndex = (pageIndex - 1 + pages.length) % pages.length; render(); });
  nextBtn.addEventListener('click', () => { pageIndex = (pageIndex + 1) % pages.length; render(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft' && pages.length > 1) { pageIndex = (pageIndex - 1 + pages.length) % pages.length; render(); }
    if (e.key === 'ArrowRight' && pages.length > 1) { pageIndex = (pageIndex + 1) % pages.length; render(); }
  });
})();

/* ==== SMOOTH ANCHOR SCROLL WITH NAV OFFSET ==== */
(() => {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const nav = document.querySelector('.nav');
      const offset = nav ? nav.offsetHeight + 12 : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });
})();
