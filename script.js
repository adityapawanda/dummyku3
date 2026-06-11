/* =========================================================
   Aditya Pawanda — Portfolio  ·  interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Language toggle (ID / EN) ---------- */
  const STORE_KEY = "ap_lang";
  const toggle = document.querySelector(".lang-toggle");
  const i18nEls = Array.from(document.querySelectorAll("[data-en]"));

  function applyLang(lang) {
    document.documentElement.setAttribute("lang", lang === "en" ? "en" : "id");
    if (toggle) toggle.setAttribute("data-lang", lang);
    i18nEls.forEach((el) => {
      // Cache the original (Indonesian) text the first time we switch.
      if (el.dataset.id === undefined) el.dataset.id = el.innerHTML;
      el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.id;
    });
    // Swap placeholders (data-en-ph holds the English placeholder)
    document.querySelectorAll("[data-en-ph]").forEach((el) => {
      if (el.dataset.idPh === undefined) el.dataset.idPh = el.getAttribute("placeholder") || "";
      el.setAttribute("placeholder", lang === "en" ? el.dataset.enPh : el.dataset.idPh);
    });
    document.querySelectorAll(".lang-toggle button").forEach((b) =>
      b.classList.toggle("on", b.dataset.lang === lang)
    );
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
  }

  let startLang = "id";
  try { startLang = localStorage.getItem(STORE_KEY) || "id"; } catch (e) {}
  applyLang(startLang);

  if (toggle) {
    toggle.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => applyLang(btn.dataset.lang));
    });
  }

  /* ---------- Sticky nav state ---------- */
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
    // back to top
    const tt = document.querySelector(".to-top");
    if (tt) tt.classList.toggle("show", window.scrollY > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.querySelector(".nav-burger");
  if (burger) {
    burger.addEventListener("click", () => nav.classList.toggle("menu-open"));
  }
  document.querySelectorAll(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("menu-open"))
  );

  /* ---------- Scroll reveal (scroll-position based — robust everywhere) ---------- */
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const counters = Array.from(document.querySelectorAll("[data-count]"));
  const counted = new WeakSet();

  function animateCount(el) {
    if (counted.has(el)) return;
    counted.add(el);
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1500;
    const start = performance.now();
    const isFloat = !Number.isInteger(target);
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
    }
    requestAnimationFrame(tick);
  }

  function reveal(el) {
    el.classList.add("in");
    // Failsafe: if the entrance transition doesn't progress (some embedded
    // preview contexts pause transitions), snap to the final state.
    setTimeout(() => {
      if (parseFloat(getComputedStyle(el).opacity) < 0.95) {
        el.style.transition = "none";
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    }, 900);
  }

  function checkReveal() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach((el) => {
      if (el.classList.contains("in")) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) reveal(el);
    });
    counters.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) animateCount(el);
    });
  }
  checkReveal();
  window.addEventListener("scroll", checkReveal, { passive: true });
  window.addEventListener("resize", checkReveal);
  window.addEventListener("load", checkReveal);
  setTimeout(checkReveal, 300);

  /* ---------- Scrollspy (scroll-position based) ---------- */
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const linkFor = (id) => navLinks.find((l) => l.getAttribute("href") === "#" + id);
  function spy() {
    const mid = window.scrollY + window.innerHeight * 0.4;
    let current = sections[0];
    for (const s of sections) {
      if (s.offsetTop <= mid) current = s;
    }
    navLinks.forEach((l) => l.classList.remove("active"));
    if (current) {
      const link = linkFor(current.id);
      if (link) link.classList.add("active");
    }
  }
  if (sections.length) {
    spy();
    window.addEventListener("scroll", spy, { passive: true });
  }

  /* ---------- Smooth anchor offset (account for fixed nav) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (ev) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const tgt = document.querySelector(id);
      if (!tgt) return;
      ev.preventDefault();
      const y = tgt.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  /* ---------- Contact form validation ---------- */
  const form = document.querySelector(".contact-form");
  if (form) {
    const okMsg = form.querySelector(".form-ok");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll("[data-required]").forEach((f) => {
        const field = f.closest(".field");
        const val = f.value.trim();
        let bad = !val;
        if (f.type === "email" && val) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        field.classList.toggle("invalid", bad);
        if (bad) valid = false;
      });
      if (valid) {
        form.querySelectorAll("input, textarea, select").forEach((f) => { if (f.type !== "submit") f.value = ""; });
        if (okMsg) {
          okMsg.classList.add("show");
          setTimeout(() => okMsg.classList.remove("show"), 5000);
        }
      }
    });
    form.querySelectorAll("[data-required]").forEach((f) => {
      f.addEventListener("input", () => {
        const field = f.closest(".field");
        if (field.classList.contains("invalid") && f.value.trim()) field.classList.remove("invalid");
      });
    });
  }

  /* ---------- Milestone carousel (auto-advance + manual + swipe) ---------- */
  (function () {
    const vp = document.getElementById("msViewport");
    const track = vp && vp.querySelector(".ms-track");
    if (!vp || !track) return;
    const items = Array.from(track.children);
    const prev = document.getElementById("msPrev");
    const next = document.getElementById("msNext");
    const dotsWrap = document.getElementById("msDots");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // build dots
    items.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "ms-dot" + (i === 0 ? " on" : "");
      d.type = "button";
      d.setAttribute("aria-label", "Slide " + (i + 1));
      d.addEventListener("click", () => { stop(); scrollToIndex(i); restartSoon(); });
      dotsWrap.appendChild(d);
    });
    const dots = Array.from(dotsWrap.children);

    const itemW = () => items[0].offsetWidth + 26; // width + gap
    function currentIndex() { return Math.round(vp.scrollLeft / itemW()); }
    function scrollToIndex(i, smooth = true) {
      const max = items.length - 1;
      const idx = Math.max(0, Math.min(max, i));
      vp.scrollTo({ left: idx * itemW(), behavior: smooth ? "smooth" : "auto" });
    }
    function syncDots() {
      const i = currentIndex();
      dots.forEach((d, k) => d.classList.toggle("on", k === i));
    }
    vp.addEventListener("scroll", () => { window.requestAnimationFrame(syncDots); }, { passive: true });

    if (prev) prev.addEventListener("click", () => { stop(); scrollToIndex(currentIndex() - 1); restartSoon(); });
    if (next) next.addEventListener("click", () => { stop(); step(); restartSoon(); });

    function step() {
      const i = currentIndex();
      if (i >= items.length - 1) scrollToIndex(0);
      else scrollToIndex(i + 1);
    }

    // auto-advance
    let timer = null, restartT = null;
    function start() { if (reduce || timer) return; timer = setInterval(step, 3200); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restartSoon() { clearTimeout(restartT); restartT = setTimeout(start, 4500); }

    // pause on interaction
    ["mouseenter", "pointerdown", "touchstart", "focusin"].forEach((e) =>
      vp.addEventListener(e, stop, { passive: true })
    );
    ["mouseleave", "touchend", "pointerup"].forEach((e) =>
      vp.addEventListener(e, restartSoon, { passive: true })
    );
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else restartSoon(); });

    // start once visible
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        es.forEach((en) => { if (en.isIntersecting) start(); else stop(); });
      }, { threshold: 0.2 });
      io.observe(vp);
    } else { start(); }
  })();

  /* ---------- Network interactive map ---------- */
  (function () {
    const world = document.getElementById("netmapWorld");
    const arcsSvg = document.getElementById("netmapArcs");
    const markersWrap = document.getElementById("netmapMarkers");
    if (!world || !arcsSvg || !markersWrap) return;

    // country data — x,y in viewBox 1010x666 units (calibrated to the map)
    const VBW = 1010, VBH = 666;
    const pts = [
      { id: "id", name: "Indonesia", region: { id: "Asia Tenggara", en: "Southeast Asia" }, x: 74.5, y: 58, home: true },
      { id: "sy", name: "Suriah", en: "Syria", region: { id: "Timur Tengah", en: "Middle East" }, x: 57.5, y: 30 },
      { id: "tr", name: "Türkiye", region: { id: "Timur Tengah", en: "Middle East" }, x: 55, y: 27 },
      { id: "ps", name: "Palestina", en: "Palestine", region: { id: "Timur Tengah", en: "Middle East" }, x: 56.4, y: 33 },
      { id: "lb", name: "Lebanon", region: { id: "Timur Tengah", en: "Middle East" }, x: 56, y: 31.4 },
      { id: "jo", name: "Yordania", en: "Jordan", region: { id: "Timur Tengah", en: "Middle East" }, x: 58, y: 33 },
      { id: "ye", name: "Yaman", en: "Yemen", region: { id: "Timur Tengah", en: "Middle East" }, x: 61, y: 43 },
      { id: "eg", name: "Mesir", en: "Egypt", region: { id: "Afrika", en: "Africa" }, x: 54, y: 37 },
      { id: "ug", name: "Uganda", region: { id: "Afrika", en: "Africa" }, x: 57, y: 51 },
      { id: "af", name: "Afghanistan", region: { id: "Asia Selatan", en: "South Asia" }, x: 64, y: 30 },
      { id: "bd", name: "Bangladesh", region: { id: "Asia Selatan", en: "South Asia" }, x: 70, y: 37 }
    ];
    const home = pts.find((p) => p.home);
    const SVGNS = "http://www.w3.org/2000/svg";
    const curLang = () => (document.documentElement.getAttribute("lang") === "en" ? "en" : "id");

    function build() {
      // arcs from home to each
      arcsSvg.innerHTML = "";
      const hx = home.x / 100 * VBW, hy = home.y / 100 * VBH;
      pts.forEach((p) => {
        if (p.home) return;
        const x = p.x / 100 * VBW, y = p.y / 100 * VBH;
        const mx = (hx + x) / 2, my = (hy + y) / 2 - Math.abs(x - hx) * 0.28 - 30;
        const path = document.createElementNS(SVGNS, "path");
        path.setAttribute("d", `M ${hx} ${hy} Q ${mx} ${my} ${x} ${y}`);
        path.setAttribute("class", "nm-arc");
        arcsSvg.appendChild(path);
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        path.style.transition = "stroke-dashoffset 1.2s var(--ease)";
        p._arc = path;
      });
      // markers
      markersWrap.innerHTML = "";
      pts.forEach((p) => {
        const m = document.createElement("div");
        m.className = "nm-marker" + (p.home ? " home" : "");
        m.style.left = p.x + "%";
        m.style.top = p.y + "%";
        const reg = curLang() === "en" ? (p.region.en || p.region.id) : p.region.id;
        const nm = curLang() === "en" ? (p.en || p.name) : p.name;
        m.innerHTML = `<span class="nm-pin"></span><span class="nm-tip">${nm}<i>${reg}</i></span>`;
        m.tabIndex = 0;
        m.addEventListener("click", (e) => {
          e.stopPropagation();
          const wasActive = m.classList.contains("active");
          markersWrap.querySelectorAll(".nm-marker.active").forEach((x) => x.classList.remove("active"));
          if (!wasActive) m.classList.add("active");
        });
        markersWrap.appendChild(m);
      });
      document.addEventListener("click", () => {
        markersWrap.querySelectorAll(".nm-marker.active").forEach((x) => x.classList.remove("active"));
      });
    }

    function drawArcs() {
      pts.forEach((p) => { if (p._arc) p._arc.style.strokeDashoffset = "0"; });
    }

    // load + inject the world map silhouette
    fetch("worldmap.svg")
      .then((r) => r.text())
      .then((svg) => { world.innerHTML = svg; })
      .catch(() => {});

    build();
    // rebuild marker labels on language change
    const langToggle = document.querySelector(".lang-toggle");
    if (langToggle) langToggle.addEventListener("click", () => setTimeout(build, 30));

    // draw arcs when section scrolls into view
    let drawn = false;
    const stage = document.getElementById("netmapStage");
    function maybeDraw() {
      if (drawn) return;
      const r = stage.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.85 && r.bottom > 0) { drawn = true; drawArcs(); }
    }
    window.addEventListener("scroll", maybeDraw, { passive: true });
    maybeDraw();
    setTimeout(maybeDraw, 400);
  })();

  /* ---------- Theme / background switcher ---------- */
  const THEME_KEY = "ap_theme";
  const fab = document.getElementById("themeFab");
  const themeBtn = document.getElementById("themeBtn");
  const swatches = Array.from(document.querySelectorAll(".swatch[data-theme-val]"));

  function applyTheme(val) {
    if (val === "light") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", val);
    swatches.forEach((s) => s.classList.toggle("on", s.dataset.themeVal === val));
    try { localStorage.setItem(THEME_KEY, val); } catch (e) {}
  }

  let startTheme = "light";
  try { startTheme = localStorage.getItem(THEME_KEY) || "light"; } catch (e) {}
  applyTheme(startTheme);

  if (themeBtn && fab) {
    themeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      fab.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (!fab.contains(e.target)) fab.classList.remove("open");
    });
  }
  swatches.forEach((s) =>
    s.addEventListener("click", () => { applyTheme(s.dataset.themeVal); })
  );

  /* ---------- Scroll progress bar ---------- */
  const progress = document.getElementById("scrollProgress");
  if (progress) {
    const setProgress = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? (window.scrollY / max) : 0;
      progress.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
    };
    window.addEventListener("scroll", setProgress, { passive: true });
    window.addEventListener("resize", setProgress);
    setProgress();
  }
})();
