/* Mirthy: header state, scroll reveal, active nav link and the signature-dish carousel. No dependencies. */
(() => {
  const SLIDE_MS = 6000;      // time each dish stays on screen
  const FADE_MS = 1300;       // must be a bit longer than the .slide opacity transition
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);

  /* Header gets a frosted background once the page scrolls */
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 12);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach((el) => io.observe(el));

    /* Highlight the nav link of the section in view */
    const links = new Map([...document.querySelectorAll("[data-link]")].map((a) => [a.dataset.link, a]));
    const spy = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a, key) => a.classList.toggle("is-current", key === e.target.id));
      }
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["home", "cakes", "about"].forEach((id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* Background gradient animation: stop when hero is off-screen or the user prefers reduced motion */
  const hero = $(".hero");
  const flows = hero.querySelectorAll("svg");
  const setFlow = (on) => {
    hero.classList.toggle("is-off", !on);
    flows.forEach((svg) => (on ? svg.unpauseAnimations() : svg.pauseAnimations()));
  };
  if (reduceMotion) setFlow(false);
  else if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => setFlow(e.isIntersecting)).observe(hero);
  }

  /* Signature dishes carousel. The active dot's progress bar is a CSS animation;
     when it ends, we move on. That keeps timing, pausing and the visuals in sync. */
  const root = $("#carousel");
  if (!root) return;
  const slides = [...root.querySelectorAll(".slide")];
  if (slides.length < 2) return;

  const dotsEl = $(".dots", root);
  const capTxt = $(".caption__txt", root);
  const capNo = $("#cap-no");
  const capName = $("#cap-name");
  const capNote = $("#cap-note");
  const pauseBtn = $(".pause", root);
  const pad = (n) => String(n).padStart(2, "0");

  root.style.setProperty("--dur", SLIDE_MS + "ms");
  const dots = slides.map((slide, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Show ${slide.dataset.name} (${i + 1} of ${slides.length})`);
    b.addEventListener("click", () => go(i));
    li.appendChild(b);
    dotsEl.appendChild(li);
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${i + 1} of ${slides.length}`);
    return b;
  });

  let current = 0;
  const halt = { user: reduceMotion, hover: false, away: false };
  const syncHalt = () => root.classList.toggle("is-halt", halt.user || halt.hover || halt.away);

  function markDot(i) {
    dots.forEach((d, n) => {
      d.removeAttribute("aria-current");
      if (n === i) { void d.offsetWidth; d.setAttribute("aria-current", "true"); }   // reflow restarts the progress bar
    });
  }

  function go(next) {
    if (next === current) return;
    const out = slides[current];
    const incoming = slides[next];
    out.classList.remove("is-active");
    out.classList.add("is-prev");
    setTimeout(() => out.classList.remove("is-prev"), FADE_MS);
    incoming.classList.add("is-active");
    slides.forEach((s, n) => s.setAttribute("aria-hidden", n === next ? "false" : "true"));
    current = next;
    markDot(next);

    capTxt.classList.add("is-swap");
    setTimeout(() => {
      capNo.textContent = pad(next + 1);
      capName.textContent = incoming.dataset.name;
      capNote.textContent = incoming.dataset.note;
      capTxt.classList.remove("is-swap");
    }, 320);
  }

  slides.forEach((s, n) => s.setAttribute("aria-hidden", n === 0 ? "false" : "true"));
  markDot(0);

  /* Advance when the active progress bar finishes */
  dotsEl.addEventListener("animationend", (e) => {
    if (e.animationName === "fill") go((current + 1) % slides.length);
  });

  /* Pause on hover / keyboard focus (WCAG 2.2.2) and while the tab is hidden */
  root.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { halt.hover = true; syncHalt(); } });
  root.addEventListener("pointerleave", () => { halt.hover = false; syncHalt(); });
  root.addEventListener("focusin", () => { halt.hover = true; syncHalt(); });
  root.addEventListener("focusout", () => { halt.hover = false; syncHalt(); });
  document.addEventListener("visibilitychange", () => { halt.away = document.hidden; syncHalt(); });

  /* Explicit pause / play control (hidden for reduced-motion users, who get manual navigation only) */
  if (reduceMotion) {
    pauseBtn.hidden = true;
  } else {
    pauseBtn.addEventListener("click", () => {
      halt.user = !halt.user;
      pauseBtn.setAttribute("aria-pressed", String(halt.user));
      pauseBtn.setAttribute("aria-label", halt.user ? "Play slideshow" : "Pause slideshow");
      syncHalt();
    });
  }
  syncHalt();
})();
