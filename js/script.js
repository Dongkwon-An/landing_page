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

/* ── S2: Problem Sentences (sticky scroll) ── */
(function () {
  var section   = document.querySelector('.problem');
  var sentences = Array.from(document.querySelectorAll('.problem-sentence'));
  var n = sentences.length;

  function update() {
    var rect       = section.getBoundingClientRect();
    var scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var progress = Math.max(0, Math.min(1, -rect.top / scrollable));

    sentences.forEach(function (s, i) {
      var threshold = (i / n) * 0.82 + 0.05;
      if (progress >= threshold) {
        s.classList.add('is-visible');
      } else {
        s.classList.remove('is-visible');
      }
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── S3-A: Tech Gallery 2-up 슬라이더 ── */
(function () {
  var wrap    = document.getElementById('techGalleryWrap');
  var track   = document.getElementById('techGalleryTrack');
  var pages   = Array.from(track ? track.querySelectorAll('.tech-gallery-page') : []);
  var items   = Array.from(document.querySelectorAll('.tech-item'));
  var panes   = Array.from(document.querySelectorAll('.tech-detail-pane'));
  var prevBtn = document.getElementById('techGalleryPrev');
  var nextBtn = document.getElementById('techGalleryNext');
  if (!wrap || !track || !pages.length) return;

  var page = 0;

  /* 래퍼 너비를 픽셀로 각 페이지와 트랙에 직접 주입 */
  function setup() {
    var w = wrap.offsetWidth;
    pages.forEach(function (p) { p.style.width = w + 'px'; });
    track.style.width = (w * pages.length) + 'px';
  }

  function slideTo(p) {
    page = Math.max(0, Math.min(pages.length - 1, p));
    track.style.transform = 'translateX(-' + (page * wrap.offsetWidth) + 'px)';
    prevBtn.disabled = (page === 0);
    nextBtn.disabled = (page === pages.length - 1);
  }

  function activateItem(idx) {
    items.forEach(function (b, i) { b.classList.toggle('is-active', i === idx); });
    panes.forEach(function (p, i) { p.classList.toggle('is-active', i === idx); });
  }

  items.forEach(function (b, i) {
    b.addEventListener('click', function () { activateItem(i); });
  });

  prevBtn.addEventListener('click', function () { slideTo(page - 1); });
  nextBtn.addEventListener('click', function () { slideTo(page + 1); });

  window.addEventListener('resize', function () { setup(); slideTo(page); }, { passive: true });

  setup();
  slideTo(0);
})();

/* ── S3-B: Onboarding Slider ── */
(function () {
  var track    = document.getElementById('onboardingTrack');
  var cards    = Array.from(track.querySelectorAll('.onboarding-card'));
  var dotsWrap = document.getElementById('onboardingDots');
  var prevBtn  = document.getElementById('onboardingPrev');
  var nextBtn  = document.getElementById('onboardingNext');
  var cur      = 0;
  var timer    = null;

  var dots = cards.map(function (_, i) {
    var btn = document.createElement('button');
    btn.className = 'onboarding-dot';
    btn.setAttribute('aria-label', (i + 1) + '번 슬라이드');
    btn.addEventListener('click', function () { slideTo(i); resetTimer(); });
    dotsWrap.appendChild(btn);
    return btn;
  });

  function slideTo(idx) {
    cur = ((idx % cards.length) + cards.length) % cards.length;
    var cardW = cards[0].offsetWidth + 14;
    track.style.transform  = 'translateX(' + (-cur * cardW) + 'px)';
    track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === cur); });
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(function () { slideTo(cur + 1); }, 5000);
  }

  prevBtn.addEventListener('click', function () { slideTo(cur - 1); resetTimer(); });
  nextBtn.addEventListener('click', function () { slideTo(cur + 1); resetTimer(); });

  slideTo(0);
  resetTimer();
})();

/* ── Technology Stacking Scroll ── */
(function () {
  var scenes = Array.from(document.querySelectorAll('.stack-scene'));
  if (!scenes.length) return;

  function setSizes() {
    scenes.forEach(function (scene) {
      var panel = scene.querySelector('.stack-panel');
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
      if (sec && sec.offsetTop <= scrollY) current = i;
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
