/* ==========================================================================
   CA Renovation & Painting LLC — interactions
   Vanilla JS, no dependencies. Everything degrades gracefully and respects
   prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- year */
  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------- nav ---- */
  var nav = $('#nav');
  var burger = $('#burger');
  var mmenu = $('#mobileMenu');

  /* stagger the mobile menu links */
  $$('#mobileMenu nav a').forEach(function (a, i) { a.style.setProperty('--i', i); });

  function closeMenu() {
    if (!mmenu || mmenu.hidden) return;
    mmenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('is-locked');
    window.setTimeout(function () { mmenu.hidden = true; }, reduced ? 0 : 340);
  }

  function openMenu() {
    mmenu.hidden = false;
    /* next frame so the transition runs */
    requestAnimationFrame(function () { mmenu.classList.add('is-open'); });
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('is-locked');
  }

  if (burger && mmenu) {
    burger.addEventListener('click', function () {
      burger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    });
    mmenu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* --------------------------------------------- scroll: nav + progress - */
  var progress = $('#scrollProgress');
  var heroImg = $('#heroImg');
  var heroIn = $('#heroIn');
  var lastY = window.pageYOffset;
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;

    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    if (nav) {
      nav.classList.toggle('is-stuck', y > 40);
      /* hide on scroll-down once past the hero, show on scroll-up */
      var goingDown = y > lastY;
      var pastHero = y > window.innerHeight * 0.9;
      var menuOpen = burger && burger.getAttribute('aria-expanded') === 'true';
      nav.classList.toggle('is-hidden', goingDown && pastHero && !menuOpen);
    }

    /* hero parallax + fade */
    if (!reduced && y < window.innerHeight * 1.2) {
      if (heroImg) heroImg.style.transform = 'translate3d(0,' + (y * 0.28).toFixed(2) + 'px,0)';
      if (heroIn) {
        heroIn.style.transform = 'translate3d(0,' + (y * -0.12).toFixed(2) + 'px,0)';
        heroIn.style.opacity = Math.max(0, 1 - y / (window.innerHeight * 0.72)).toFixed(3);
      }
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ------------------------------------------------------ reveal on view */
  var revealables = $$('[data-reveal], [data-curtain]');

  function revealAll() {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });

    /* Safety net. Anything at or above the fold gets revealed outright rather than
       waiting on an observer callback — covers deep links (#work), a restored scroll
       position, and any case where the observer doesn't fire. A hidden section is a
       far worse failure than a missed animation. */
    var sweep = function () {
      revealables.forEach(function (el) {
        if (el.classList.contains('in')) return;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.95) {
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    };
    window.addEventListener('load', sweep);
    window.setTimeout(sweep, 1200);
    window.setTimeout(sweep, 3000);
  } else {
    revealAll();
  }

  /* --------------------------------------- statement: word-by-word light */
  var stmt = $('[data-words]');
  if (stmt) {
    var words = stmt.textContent.trim().split(/\s+/);
    stmt.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      stmt.appendChild(s);
      if (i < words.length - 1) stmt.appendChild(document.createTextNode(' '));
    });

    if (!reduced) {
      var wEls = $$('.w', stmt);
      var lightUp = function () {
        var r = stmt.getBoundingClientRect();
        var start = window.innerHeight * 0.86;
        var end = window.innerHeight * 0.32;
        var p = (start - r.top) / (start - end);          /* 0 → 1 through the viewport */
        var n = Math.round(Math.max(0, Math.min(1, p)) * wEls.length);
        wEls.forEach(function (el, i) { el.classList.toggle('on', i < n); });
      };
      var st = false;
      window.addEventListener('scroll', function () {
        if (!st) { st = true; requestAnimationFrame(function () { lightUp(); st = false; }); }
      }, { passive: true });
      lightUp();
    } else {
      $$('.w', stmt).forEach(function (el) { el.classList.add('on'); });
    }
  }

  /* ------------------------------------------------------ stat count-ups */
  var stats = $$('[data-count]');
  if (stats.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      stats.forEach(function (el) {
        el.textContent = el.dataset.count + (el.dataset.suffix || '');
      });
    } else {
      var sIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          sIo.unobserve(el);
          var target = parseFloat(el.dataset.count);
          var suffix = el.dataset.suffix || '';
          var dur = 1250;
          var t0 = performance.now();
          (function step(now) {
            var p = Math.min(1, (now - t0) / dur);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
          })(t0);
        });
      }, { threshold: 0.5 });
      stats.forEach(function (el) { sIo.observe(el); });
    }
  }

  /* ------------------------------------- specialty cards: light parallax */
  var pxEls = $$('[data-parallax]');
  if (pxEls.length && !reduced) {
    var visible = [];
    var pIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var i = visible.indexOf(en.target);
        if (en.isIntersecting && i === -1) visible.push(en.target);
        else if (!en.isIntersecting && i > -1) visible.splice(i, 1);
      });
    }, { rootMargin: '15% 0px' });
    pxEls.forEach(function (el) { pIo.observe(el); });

    var pTick = false;
    var runPx = function () {
      var vh = window.innerHeight;
      visible.forEach(function (el) {
        var r = el.getBoundingClientRect();
        /* -1 (below fold) → 1 (above fold) */
        var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        el.style.setProperty('--py', (p * -3.6).toFixed(2) + '%');
      });
      pTick = false;
    };
    window.addEventListener('scroll', function () {
      if (!pTick) { pTick = true; requestAnimationFrame(runPx); }
    }, { passive: true });
    runPx();
  }

  /* -------------------------------------------- optional "before" photos */
  /* An <img data-optional> that 404s flips its pane to the labelled placeholder,
     so dropping the real file into /assets is all it takes to fill the slider in. */
  $$('img[data-optional]').forEach(function (img) {
    var markEmpty = function () {
      var pane = img.closest('[data-before]');
      if (pane) pane.classList.add('is-empty');
    };
    img.addEventListener('error', markEmpty);
    /* covers an error that already fired before this script ran */
    if (img.complete && img.naturalWidth === 0) markEmpty();
  });

  /* ------------------------------------------- before / after comparison */
  $$('[data-ba]').forEach(function (ba) {
    var range = $('.ba__range', ba);
    if (!range) return;

    var set = function (v) {
      ba.style.setProperty('--split', v + '%');
    };
    set(range.value);

    range.addEventListener('input', function () { set(range.value); });

    /* dragging anywhere on the image, not just the thumb */
    var dragging = false;
    var fromEvent = function (clientX) {
      var r = ba.getBoundingClientRect();
      var pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      range.value = pct;
      set(pct);
    };

    ba.addEventListener('pointerdown', function (e) {
      dragging = true;
      ba.setPointerCapture && ba.setPointerCapture(e.pointerId);
      fromEvent(e.clientX);
    });
    ba.addEventListener('pointermove', function (e) {
      if (dragging) fromEvent(e.clientX);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      ba.addEventListener(ev, function () { dragging = false; });
    });

    /* a gentle nudge the first time it scrolls into view, so it reads as draggable */
    if (!reduced && 'IntersectionObserver' in window) {
      var teased = false;
      var tIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting || teased) return;
          teased = true;
          tIo.disconnect();
          var t0 = performance.now();
          (function tease(now) {
            var p = Math.min(1, (now - t0) / 1500);
            var eased = 1 - Math.pow(1 - p, 3);
            var v = 50 + Math.sin(eased * Math.PI) * 20;
            range.value = v;
            set(v);
            if (p < 1 && !dragging) requestAnimationFrame(tease);
          })(t0);
        });
      }, { threshold: 0.45 });
      tIo.observe(ba);
    }
  });

  /* ------------------------------------------ nav: mark the active section */
  var sections = ['about', 'services', 'specialties', 'work', 'why']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var links = {};
    $$('.nav__links a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });

    var aIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (a) a.style.color = en.isIntersecting ? 'var(--cream)' : '';
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { aIo.observe(s); });
  }
})();
