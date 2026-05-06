/* ── Hero: mouse parallax on paint layers ── */
(function () {
  var hero   = document.querySelector('.hero');
  var paints = Array.from(document.querySelectorAll('.hero-paint'));
  if (!hero || !paints.length) return;

  /* 각 레이어마다 다른 시차 강도 (px) */
  var depths = [18, -14, 20, -16, 12, -20];

  var mx = 0, my = 0; /* 정규화된 마우스 위치 (-0.5 ~ 0.5) */
  var cx = 0, cy = 0; /* lerp된 현재 위치 */

  hero.addEventListener('mousemove', function (e) {
    var r = hero.getBoundingClientRect();
    mx = (e.clientX - r.left)  / r.width  - 0.5;
    my = (e.clientY - r.top)   / r.height - 0.5;
  });

  hero.addEventListener('mouseleave', function () { mx = 0; my = 0; });

  (function loop() {
    cx += (mx - cx) * 0.07;
    cy += (my - cy) * 0.07;
    paints.forEach(function (el, i) {
      var d = depths[i] || 15;
      el.style.marginLeft = (cx * d) + 'px';
      el.style.marginTop  = (cy * d) + 'px';
    });
    requestAnimationFrame(loop);
  })();
})();

/* ── S2: Problem Sentences (scroll-lit) ── */
(function () {
  var section   = document.querySelector('.problem');
  var sentences = Array.from(document.querySelectorAll('.problem-sentence'));
  var n = sentences.length;
  var autoScrollFired = false;
  var lastProgress    = 0;

  function update() {
    var rect       = section.getBoundingClientRect();
    var scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var progress     = Math.max(0, Math.min(1, -rect.top / scrollable));
    var scrollingDown = progress > lastProgress;
    lastProgress      = progress;

    var current = -1;
    sentences.forEach(function (s, i) {
      if (progress >= (i / n) * 0.82 + 0.05) current = i;
    });
    sentences.forEach(function (s, i) {
      s.classList.toggle('is-lit', i === current);
    });

    /* 마지막 문장 활성화 시 technology 섹션으로 자동 스크롤 */
    if (current === n - 1 && scrollingDown && !autoScrollFired) {
      autoScrollFired = true;
      setTimeout(function () {
        var tech = document.getElementById('technology');
        if (!tech) return;
        var startY    = window.scrollY;
        var endY      = tech.getBoundingClientRect().top + window.scrollY;
        var duration  = 2000; /* ms — 느리고 부드럽게 */
        var startTime = null;
        function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
        function frame(now) {
          if (!startTime) startTime = now;
          var t = Math.min(1, (now - startTime) / duration);
          window.scrollTo(0, startY + (endY - startY) * ease(t));
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }, 600);
    }
    if (progress < 0.5) autoScrollFired = false; /* 위로 스크롤 시 리셋 */
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── S3-A: Tech Gallery 타일 슬라이더 ── */
(function () {
  var wrap    = document.getElementById('techGalleryWrap');
  var track   = document.getElementById('techGalleryTrack');
  var tiles   = Array.from(track ? track.querySelectorAll('.tech-tile') : []);
  var prevBtn = document.getElementById('techGalleryPrev');
  var nextBtn = document.getElementById('techGalleryNext');
  if (!wrap || !track || !tiles.length) return;

  var page = 0;
  var GAP  = 20;

  function tileStep() { return tiles[0] ? tiles[0].offsetWidth + GAP : 0; }

  function slideTo(p) {
    page = Math.max(0, Math.min(tiles.length - 1, p));
    track.style.transform = 'translateX(-' + (page * tileStep()) + 'px)';
    prevBtn.disabled = (page === 0);
    nextBtn.disabled = (page === tiles.length - 1);
    tiles.forEach(function (tile, i) {
      tile.classList.toggle('is-gallery-dim', i !== page && i !== page + 1);
    });
  }

  prevBtn.addEventListener('click', function () { slideTo(page - 1); });
  nextBtn.addEventListener('click', function () { slideTo(page + 1); });

  /* ── 터치: 드래그 중 실시간 이동 → 손 떼면 스냅 ── */
  var touchStartX = 0;
  var touchStartY = 0;
  var dragging    = false;
  var baseOffset  = 0;

  wrap.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    baseOffset  = page * tileStep();
    dragging    = false;
  }, { passive: true });

  wrap.addEventListener('touchmove', function (e) {
    var dx = e.touches[0].clientX - touchStartX;
    var dy = e.touches[0].clientY - touchStartY;
    if (!dragging && Math.abs(dx) < Math.abs(dy)) return;
    dragging = true;
    track.style.transition = 'none';
    track.style.transform  = 'translateX(' + (-baseOffset + dx * 0.85) + 'px)';
  }, { passive: true });

  wrap.addEventListener('touchend', function (e) {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    var dx = e.changedTouches[0].clientX - touchStartX;
    var threshold = tileStep() * 0.22;
    slideTo(Math.abs(dx) > threshold ? (dx < 0 ? page + 1 : page - 1) : page);
  }, { passive: true });

  /* ── 트랙패드 가로 스와이프 ── */
  var wheelLocked = false;
  wrap.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (wheelLocked) return;
    if (Math.abs(e.deltaX) > 8) {
      slideTo(e.deltaX > 0 ? page + 1 : page - 1);
      wheelLocked = true;
      setTimeout(function () { wheelLocked = false; }, 550);
    }
  }, { passive: false });

  window.addEventListener('resize', function () { slideTo(page); }, { passive: true });

  slideTo(0);
})();

/* ── S3-B: Onboarding Scroll-Pin ── */
(function () {
  var pin    = document.querySelector('.onboarding-pin');
  var panels = Array.from(document.querySelectorAll('.onboarding-panel'));
  var dots   = Array.from(document.querySelectorAll('.onboarding-step-dot'));
  if (!pin || !panels.length) return;

  var current = 0;

  function goTo(step) {
    if (step === current) return;
    var prev = current;
    panels[prev].classList.remove('is-active');
    panels[prev].classList.add('is-out');
    (function (idx) {
      setTimeout(function () { panels[idx].classList.remove('is-out'); }, 650);
    })(prev);
    current = step;
    panels[current].classList.add('is-active');
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
  }

  function update() {
    var rect     = pin.getBoundingClientRect();
    var scrolled = -rect.top;
    var total    = pin.offsetHeight - window.innerHeight;
    var progress = Math.max(0, Math.min(0.9999, scrolled / total));
    var step     = Math.min(panels.length - 1, Math.floor(progress * panels.length));
    goTo(step);
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── Technology Stacking Scroll ── */
(function () {
  var scenes = Array.from(document.querySelectorAll('.stack-scene'));
  if (!scenes.length) return;

  function setSizes() {
    scenes.forEach(function (scene, i) {
      var panel = scene.querySelector('.stack-panel');
      var next  = scenes[i + 1];
      if (!next) { scene.style.minHeight = ''; return; }
      scene.style.minHeight = (panel.offsetHeight + window.innerHeight * 0.38) + 'px';
    });
  }

  function update() {
    scenes.forEach(function (scene, i) {
      var panel = scene.querySelector('.stack-panel');
      var next  = scenes[i + 1];
      if (!next) { panel.style.transform = ''; panel.style.opacity = ''; return; }
      var top = next.getBoundingClientRect().top;
      var vh  = window.innerHeight;
      var p   = Math.max(0, Math.min(1, (vh - top) / (vh * 0.55)));
      if (p > 0) {
        panel.style.transform = 'scale(' + (1 - p * 0.07) + ') translateY(' + (-p * 30) + 'px)';
        panel.style.opacity   = String(Math.max(0, 1 - p * 0.65));
      } else {
        panel.style.transform = '';
        panel.style.opacity   = '';
      }
    });
  }

  setSizes();
  window.addEventListener('resize', setSizes, { passive: true });
  window.addEventListener('scroll', update,   { passive: true });
  update();
})();

/* ── S3-C: Board Step Scroll Reveal ── */
(function () {
  var targets = Array.from(document.querySelectorAll('.step-visual, .step-content'));
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  targets.forEach(function (el) { obs.observe(el); });
})();

/* ── Scroll Reveal ── */
(function () {
  var els = Array.from(document.querySelectorAll('.js-reveal'));
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(function (el) { obs.observe(el); });
})();

/* ── CTA Form ── */
document.getElementById('ctaForm').addEventListener('submit', function (e) {
  e.preventDefault();
  this.style.display = 'none';
  document.getElementById('formNote').style.display   = 'none';
  document.getElementById('successMsg').classList.add('on');
});

/* ── Trust Marquee: JS-driven infinite scroll ── */
(function () {
  var marquee = document.querySelector('.trust-marquee');
  var track   = document.querySelector('.trust-track');
  if (!track) return;

  var PX_PER_SEC = 45;
  var offset    = 0;
  var loopWidth = 0;
  var lastStamp = null;
  var paused    = false;

  function setup() {
    // 현재 DOM에 있는 카드 전체가 원본 (HTML 클론 없음)
    var originals = Array.from(track.children);

    loopWidth = originals.reduce(function (sum, el) {
      var mr = parseFloat(getComputedStyle(el).marginRight) || 0;
      return sum + el.offsetWidth + mr;
    }, 0);

    // 화면 너비의 3배 이상 채울 때까지 세트 복제
    var target = Math.max(window.innerWidth * 3, loopWidth * 3);
    while (track.scrollWidth < target) {
      originals.forEach(function (card) {
        track.appendChild(card.cloneNode(true));
      });
    }
  }

  function step(stamp) {
    if (lastStamp === null) lastStamp = stamp;

    if (!paused) {
      var delta = stamp - lastStamp;
      offset += PX_PER_SEC * (delta / 1000);
      if (offset >= loopWidth) offset -= loopWidth;
      track.style.transform = 'translateX(-' + offset.toFixed(2) + 'px)';
    }

    lastStamp = stamp; // 항상 갱신 → resume 시 순간이동 없음
    requestAnimationFrame(step);
  }

  // 커서 진입 시 일시정지, 벗어나면 재개
  if (marquee) {
    marquee.addEventListener('mouseenter', function () { paused = true; });
    marquee.addEventListener('mouseleave', function () { paused = false; });
  }

  requestAnimationFrame(function (stamp) {
    setup();
    lastStamp = stamp;
    requestAnimationFrame(step);
  });
})();

/* ── "더 알아보기" → Problem 첫 문장 위치로 스크롤 ── */
(function () {
  var btn = document.querySelector('a.btn-ghost[href="#problem"]');
  if (!btn) return;
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var section   = document.querySelector('.problem');
    if (!section) return;
    var sectionTop = section.getBoundingClientRect().top + window.scrollY;
    var scrollable = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: sectionTop + scrollable * 0.06, behavior: 'smooth' });
  });
})();

/* ── Navigation: Scroll Spy + Hamburger ── */
(function () {
  var navLinks  = Array.from(document.querySelectorAll('.nav-link[data-section]'));
  var hamburger = document.getElementById('navHamburger');
  var navMenu   = document.getElementById('navLinks');
  var sections  = navLinks.map(function (l) {
    return document.getElementById(l.dataset.section);
  });

  function updateSpy() {
    var scrollY = window.scrollY + 80;
    var current = -1;
    sections.forEach(function (sec, i) {
      if (!sec) return;
      var top = sec.getBoundingClientRect().top + window.scrollY;
      if (top <= scrollY) current = i;
    });
    navLinks.forEach(function (l, i) {
      l.classList.toggle('is-active', i === current);
    });
  }

  window.addEventListener('scroll', updateSpy, { passive: true });
  updateSpy();

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      var open = navMenu.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
