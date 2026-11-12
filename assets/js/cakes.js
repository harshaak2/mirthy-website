// Cakes turntable + enquiry modal. No dependencies. Without JS (or with reduced motion / fewer than 5 cakes) the section stays a scroll-snap row.
(function () {
  "use strict";
  // TODO (placeholders until the cafe confirms): WhatsApp number in international format without "+", phone and email.
  var CONTACT = { whatsapp: "910000000000", phone: "+910000000000", email: "hello@mirthy.in" };

  var section = document.getElementById("cakes");
  var stage = section && section.querySelector(".cakes__stage");
  var ring = section && section.querySelector(".cakes__ring");
  var dlg = document.getElementById("cake-modal");
  if (!section || !ring || !dlg) return;
  var cakes = Array.prototype.slice.call(ring.querySelectorAll(".cake"));
  var N = cakes.length;
  var live = section.querySelector(".cakes__live");

  /* ---------- Modal ---------- */
  var cur = 0, opener = null;
  var el = function (s) { return dlg.querySelector(s); };
  function fill(i) {
    cur = (i + N) % N;
    var c = cakes[cur], d = c.dataset, img = c.querySelector("img"), name = c.querySelector(".cake__name").textContent;
    el(".cmodal__img").src = img.currentSrc || img.src; el(".cmodal__img").alt = img.alt;
    el("#cake-modal-title").textContent = name;
    var more = c.querySelector(".cake__more"); el(".cmodal__desc").innerHTML = more ? more.innerHTML : "";
    var facts = [["Serves", d.serves], ["Sizes", d.sizes], ["Flavours", d.flavours], ["Lead time", d.lead], ["Customisation", d.custom]];
    el(".cmodal__facts").innerHTML = facts.filter(function (f) { return f[1]; }).map(function (f) { return "<dt>" + f[0] + "</dt><dd></dd>"; }).join("");
    var dds = el(".cmodal__facts").querySelectorAll("dd"); facts.filter(function (f) { return f[1]; }).forEach(function (f, k) { dds[k].textContent = f[1]; });
    var msg = "Hi Mirthy, I'd like to know more about the " + name;
    el("[data-wa]").href = "https://wa.me/" + CONTACT.whatsapp + "?text=" + encodeURIComponent(msg);
    el("[data-call]").href = "tel:" + CONTACT.phone;
    el("[data-mail]").href = "mailto:" + CONTACT.email + "?subject=" + encodeURIComponent("Enquiry: " + name) + "&body=" + encodeURIComponent(msg);
  }
  function open(i, from) {
    opener = from || null; fill(i);
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    document.documentElement.style.overflow = "hidden";
  }
  function close() { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); }
  dlg.addEventListener("close", function () { document.documentElement.style.overflow = ""; if (opener) opener.focus(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.hasAttribute("data-close")) close(); });
  el("[data-prev]").addEventListener("click", function () { fill(cur - 1); });
  el("[data-next]").addEventListener("click", function () { fill(cur + 1); });
  cakes.forEach(function (c, i) { c.querySelector(".cake__card").addEventListener("click", function (e) { if (!moved) { if (turntable) goto(i, true); open(i, e.currentTarget); } }); });

  /* ---------- Turntable ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var turntable = false, angle = 0, th = 360 / N, front = 0, moved = false, userMoved = false, auto = null, visible = true, hovering = false, focusing = false, keyboard = false;

  function layout() {
    var card = cakes[0].querySelector(".cake__card");
    var w = Math.min(card.offsetWidth || 240, 280);
    var r = (w / 2) / Math.tan(Math.PI / N) + 36;
    var h = w * 1.25 + 52;
    section.style.setProperty("--cw", w + "px"); section.style.setProperty("--ch", h + "px");
    section.style.setProperty("--r", r + "px"); section.style.setProperty("--th", th + "deg");
    ring.style.setProperty("--r", r + "px");
    draw();
  }
  function draw() {
    ring.style.transform = "translateZ(calc(var(--r) * -1)) rotateY(" + -angle + "deg)";
    front = ((Math.round(angle / th) % N) + N) % N;
    cakes.forEach(function (c, i) {
      var d = Math.abs(((i - angle / th) % N + N) % N); d = Math.min(d, N - d);
      c.style.setProperty("--o", Math.max(.35, 1 - d * .28).toFixed(2)); c.style.setProperty("--s", d < .5 ? "1.06" : "0.94");
      c.classList.toggle("is-front", i === front);
    });
  }
  function goto(i, announce) {
    var diff = ((i - angle / th) % N + N) % N; if (diff > N / 2) diff -= N;
    angle = Math.round(angle / th + diff) * th; draw();
    if (announce) say();
  }
  function say() { if (live) live.textContent = cakes[front].querySelector(".cake__name").textContent + ", cake " + (front + 1) + " of " + N; }
  function step(dir) { userMoved = true; goto(Math.round(angle / th) + dir, true); }

  function enable() {
    if (turntable || N < 5 || reduce.matches) return;
    turntable = true; section.classList.add("cakes--3d");
    cakes.forEach(function (c, i) { c.style.setProperty("--i", i); var im = c.querySelector("img"); if (i === 0) im.loading = "eager"; });
    layout(); startAuto();
  }
  function disable() { turntable = false; section.classList.remove("cakes--3d"); ring.style.transform = ""; stopAuto(); }

  // Drag / swipe (vertical scrolling still works: touch-action: pan-y)
  var down = null, startAngle = 0;
  stage.addEventListener("pointerdown", function (e) {
    if (!turntable || e.button > 0) return;
    down = { x: e.clientX, id: e.pointerId }; startAngle = angle; moved = false;
  });
  stage.addEventListener("pointermove", function (e) {
    if (!down) return;
    var dx = e.clientX - down.x;
    if (!moved && Math.abs(dx) > 6) { moved = true; userMoved = true; stage.classList.add("is-drag"); try { stage.setPointerCapture(down.id); } catch (_) {} }
    if (moved) { angle = startAngle - dx * (th / 150); draw(); }
  });
  function end() {
    if (!down) return; down = null; stage.classList.remove("is-drag");
    if (moved) { goto(Math.round(angle / th), true); setTimeout(function () { moved = false; }, 0); }
  }
  stage.addEventListener("pointerup", end); stage.addEventListener("pointercancel", end);
  stage.addEventListener("keydown", function (e) {
    if (!turntable) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); keyboard = true; step(-1); } else if (e.key === "ArrowRight") { e.preventDefault(); keyboard = true; step(1); }
  });
  section.querySelectorAll(".cakes__btn").forEach(function (b) { b.addEventListener("click", function () { step(Number(b.dataset.dir)); }); });

  // Slow auto-rotate: pauses on hover, focus, drag, hidden tab, off-screen; stops for good once a keyboard user takes over.
  function canAuto() { return turntable && visible && !hovering && !focusing && !keyboard && !document.hidden && !down && !dlg.open; }
  function startAuto() { stopAuto(); auto = setInterval(function () { if (canAuto()) goto(Math.round(angle / th) + 1, false); }, 4500); }
  function stopAuto() { if (auto) clearInterval(auto); auto = null; }
  stage.addEventListener("mouseenter", function () { hovering = true; }); stage.addEventListener("mouseleave", function () { hovering = false; });
  stage.addEventListener("focusin", function () { focusing = true; }); stage.addEventListener("focusout", function () { focusing = false; });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: .2 }).observe(section);
  if ("ResizeObserver" in window) new ResizeObserver(function () { if (turntable) layout(); }).observe(stage);
  (reduce.addEventListener ? reduce.addEventListener.bind(reduce, "change") : reduce.addListener.bind(reduce))(function () { reduce.matches ? disable() : enable(); });

  enable();
})();
