/* Haven Power — site interactions (vanilla JS, no dependencies) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => innerWidth <= 900;
  const ROOT = document.body.dataset.root || "";
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ICON = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  };

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
    t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600);
  }
  window.havenToast = toast;

  /* ---------- header ---------- */
  const hdr = $(".hdr");
  if (hdr) {
    const onScroll = () => hdr.classList.toggle("solid", scrollY > 8 || document.body.classList.contains("mega-on") || document.body.classList.contains("menu-open"));
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    // mega menus
    const items = $$(".nav-i[data-mega]");
    let closeT;
    const closeAll = () => { items.forEach((i) => { i.classList.remove("open"); $(".nav-b", i)?.setAttribute("aria-expanded", "false"); }); document.body.classList.remove("mega-on"); onScroll(); };
    const open = (it) => { clearTimeout(closeT); items.forEach((i) => i !== it && i.classList.remove("open")); it.classList.add("open"); $(".nav-b", it).setAttribute("aria-expanded", "true"); document.body.classList.add("mega-on"); onScroll(); };
    items.forEach((it) => {
      const b = $(".nav-b", it);
      b.addEventListener("click", (e) => { e.preventDefault(); it.classList.contains("open") ? closeAll() : open(it); });
      it.addEventListener("mouseenter", () => matchMedia("(hover:hover)").matches && open(it));
      it.addEventListener("mouseleave", () => { if (matchMedia("(hover:hover)").matches) closeT = setTimeout(closeAll, 140); });
    });
    document.addEventListener("keydown", (e) => e.key === "Escape" && closeAll());
    document.addEventListener("click", (e) => { if (!e.target.closest(".nav-i")) closeAll(); });
    // mobile
    const burger = $(".burger");
    burger?.addEventListener("click", () => {
      const on = document.body.classList.toggle("menu-open");
      document.body.classList.toggle("lock", on); burger.setAttribute("aria-expanded", on); burger.setAttribute("aria-label", on ? "Close menu" : "Open menu"); onScroll();
    });
    $$(".mnav-acc>button").forEach((b) => b.addEventListener("click", () => { const p = b.parentElement; const on = p.classList.toggle("open"); b.setAttribute("aria-expanded", on); }));
    $$(".mnav a").forEach((a) => a.addEventListener("click", () => { document.body.classList.remove("menu-open", "lock"); }));
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  $$(".rv-up").forEach((el) => io.observe(el));

  /* ---------- marquee duplicate ---------- */
  $$(".marquee").forEach((m) => { const t = $(".marquee-track", m); if (t && m.children.length === 1) { const c = t.cloneNode(true); c.setAttribute("aria-hidden", "true"); m.append(c); } });

  /* ---------- scroll-driven sections ---------- */
  const progressOf = (el) => { const r = el.getBoundingClientRect(); const total = r.height - innerHeight; return total <= 0 ? 0 : clamp(-r.top / total, 0, 1); };
  const scrollers = [];
  // grid toggle stage
  $$(".toggle-stage").forEach((st) => {
    const card = $(".house-card", st);
    const sw = $(".grid-pill", st);
    let manual = null;
    sw?.addEventListener("click", () => { manual = !card.classList.contains("is-off"); card.classList.toggle("is-off", manual); });
    scrollers.push(() => { if (isMobile() && manual === null) return; const p = progressOf(st); const off = p > 0.5; if (manual !== null && Math.abs(p - 0.5) > 0.3) manual = null; if (manual === null) card.classList.toggle("is-off", off); });
  });
  // generic standalone house cards (click to toggle)
  $$(".house-card[data-click]").forEach((c) => $(".grid-pill", c)?.addEventListener("click", () => c.classList.toggle("is-off")));
  // feature rail
  $$(".rail").forEach((rail) => {
    const items = $$(".rail-item", rail), imgs = $$(".rail-media img", rail), bar = $(".rail-bar", rail), list = $(".rail-list", rail);
    let cur = -1, manual = false;
    const set = (i) => {
      if (i === cur) return; cur = i;
      items.forEach((it, k) => it.classList.toggle("on", k === i)); imgs.forEach((im, k) => im.classList.toggle("on", k === i));
      requestAnimationFrame(() => setTimeout(() => { const it = items[i]; if (bar && it) { bar.style.top = it.offsetTop + "px"; bar.style.height = it.offsetHeight - (it.classList.contains("on") ? 0 : 34) + "px"; } }, 260));
    };
    items.forEach((it, k) => it.addEventListener("click", () => {
      if (isMobile()) { set(k); return; }
      const r = rail.getBoundingClientRect(); const total = rail.offsetHeight - innerHeight; const y = scrollY + r.top + (total * (k + 0.5)) / items.length; scrollTo({ top: y, behavior: RM ? "auto" : "smooth" });
    }));
    set(0);
    scrollers.push(() => { if (isMobile()) return; const p = progressOf(rail); set(Math.min(items.length - 1, Math.floor(p * items.length))); });
    if (isMobile()) { let k = 0; setInterval(() => { if (!document.hidden && rail.getBoundingClientRect().top < innerHeight) { k = (cur + 1) % items.length; set(k); } }, 4200); }
  });
  // dark rail (solar / generator)
  $$(".dark-rail").forEach((dr) => {
    const panes = $$(".pane", dr), art = $(".dark-art", dr);
    const set = (i) => { panes.forEach((p, k) => p.classList.toggle("on", k === i)); art.dataset.hl = panes[i].dataset.hl; };
    set(0);
    if (isMobile()) { let i = 0; setInterval(() => { i = (i + 1) % panes.length; set(i); }, 3800); }
    scrollers.push(() => { if (isMobile()) return; const p = progressOf(dr); set(Math.min(panes.length - 1, Math.floor(p * panes.length))); });
  });
  // numbered story steps (how it works)
  $$(".story-rail").forEach((sr) => {
    const panes = $$(".sr-pane", sr), dots = $$(".sr-dots button", sr), card = $(".sr-card", sr), art = $(".sr-art", sr), cta = $(".sr-next", sr);
    let cur = -1;
    const set = (i) => {
      if (i === cur) return; cur = i;
      panes.forEach((p, k) => p.classList.toggle("on", k === i)); dots.forEach((d, k) => d.classList.toggle("on", k === i));
      const st = panes[i].dataset; card.classList.toggle("is-off", st.off === "1"); card.dataset.tone = st.tone || ""; art.dataset.bat = st.bat || ""; art.dataset.stage = i;
      if (cta) cta.textContent = i === panes.length - 1 ? "Keep going" : "Scroll to explore";
    };
    dots.forEach((d, k) => d.addEventListener("click", () => { const total = sr.offsetHeight - innerHeight; scrollTo({ top: scrollY + sr.getBoundingClientRect().top + (total * (k + 0.5)) / panes.length, behavior: RM ? "auto" : "smooth" }); }));
    set(0);
    if (isMobile()) { let i = 0; setInterval(() => { i = (i + 1) % panes.length; set(i); }, 4000); }
    scrollers.push(() => { if (isMobile()) return; const p = progressOf(sr); set(Math.min(panes.length - 1, Math.floor(p * panes.length))); });
  });
  // word reveal (core)
  $$(".words").forEach((w) => {
    const spans = $$(".w", w);
    scrollers.push(() => { const r = w.getBoundingClientRect(); const p = clamp((innerHeight * 0.85 - r.top) / (innerHeight * 0.55), 0, 1); const n = Math.round(p * spans.length); spans.forEach((s, k) => s.classList.toggle("lit", k < n)); });
  });
  // tile assemble (core)
  $$(".tiles").forEach((t) => {
    const cells = $$(".tile", t);
    scrollers.push(() => { const p = progressOf(t.closest(".tiles-stage") || t); cells.forEach((c) => { const d = +c.dataset.d; const local = clamp((p - d * 0.5) / 0.4, 0, 1); c.style.opacity = local; c.style.transform = `translate(${(1 - local) * c.dataset.x}px,${(1 - local) * c.dataset.y}px) scale(${0.9 + local * 0.1})`; c.style.gap = ""; }); t.style.gap = (1 - clamp((p - 0.7) / 0.25, 0, 1)) * 8 + "px"; });
  });
  // night city reveal
  $$(".night").forEach((n) => { const a = $(".night-a", n), b = $(".night-b", n); scrollers.push(() => { const p = progressOf(n); if (a) a.style.opacity = 1 - clamp((p - 0.25) / 0.3, 0, 1); if (b) b.style.opacity = clamp((p - 0.25) / 0.3, 0, 1); $$(".nt", n).forEach((x, k) => x.classList.toggle("on", Math.floor(p * 3) === k || (k === 2 && p > 0.66))); }); });
  // parallax
  $$("[data-parallax]").forEach((el) => scrollers.push(() => { const r = el.parentElement.getBoundingClientRect(); const k = +el.dataset.parallax || 0.15; el.style.transform = `translate3d(0,${(r.top + r.height / 2 - innerHeight / 2) * -k}px,0) scale(1.15)`; }));
  let ticking = false;
  const runScroll = () => { ticking = false; scrollers.forEach((f) => f()); };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(runScroll); } }, { passive: true });
  addEventListener("resize", runScroll); runScroll();

  /* ---------- steps switcher (auto-advance) ---------- */
  $$(".steps-sw").forEach((sw) => {
    const steps = $$(".step", sw), imgs = $$(".media img", sw); let i = 0, t;
    const set = (k) => { i = k; steps.forEach((s, n) => s.classList.toggle("on", n === k)); imgs.forEach((im, n) => im.classList.toggle("on", n === (k % imgs.length))); clearTimeout(t); t = setTimeout(() => set((i + 1) % steps.length), 5200); };
    steps.forEach((s, k) => s.addEventListener("click", () => set(k)));
    new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting ? set(i) : clearTimeout(t))).observe(sw);
  });

  /* ---------- accordions ---------- */
  $$(".qa>button").forEach((b) => b.addEventListener("click", () => { const q = b.parentElement; const grp = q.closest("[data-single]"); const on = !q.classList.contains("open"); if (grp) $$(".qa.open", grp).forEach((o) => { o.classList.remove("open"); $("button", o).setAttribute("aria-expanded", "false"); }); q.classList.toggle("open", on); b.setAttribute("aria-expanded", on); }));
  $$(".acc-mini>button").forEach((b) => b.addEventListener("click", () => b.parentElement.classList.toggle("open")));

  /* ---------- carousels ---------- */
  $$(".carousel").forEach((c) => {
    const tr = $(".car-track", c), prev = $("[data-prev]", c), next = $("[data-next]", c);
    const step = () => { const f = tr.children[1] || tr.children[0]; return f ? f.getBoundingClientRect().width + 16 : 300; };
    const upd = () => { if (prev) prev.disabled = tr.scrollLeft < 4; if (next) next.disabled = tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 4; };
    prev?.addEventListener("click", () => tr.scrollBy({ left: -step(), behavior: "smooth" }));
    next?.addEventListener("click", () => tr.scrollBy({ left: step(), behavior: "smooth" }));
    tr.addEventListener("scroll", upd, { passive: true }); upd();
    // drag to scroll (mouse)
    let down = false, sx = 0, sl = 0, moved = false;
    tr.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = tr.scrollLeft; });
    addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; tr.classList.add("drag"); } tr.scrollLeft = sl - dx; });
    addEventListener("pointerup", () => { if (!down) return; down = false; tr.classList.remove("drag"); });
    tr.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  });

  /* ---------- modals ---------- */
  let lastFocus;
  function openModal(m) {
    lastFocus = document.activeElement; m.classList.add("open"); m.setAttribute("aria-hidden", "false"); document.body.classList.add("lock");
    setTimeout(() => ($("[autofocus]", m) || $(".modal-x", m))?.focus(), 60);
  }
  function closeModal(m) {
    m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); if (!$(".modal.open")) document.body.classList.remove("lock");
    $$("video", m).forEach((v) => v.pause()); lastFocus?.focus?.();
  }
  window.havenModal = { open: openModal, close: closeModal };
  document.addEventListener("click", (e) => {
    const x = e.target.closest(".modal-x,.modal-bg,[data-close]"); if (x) { closeModal(x.closest(".modal")); return; }
    const o = e.target.closest("[data-modal]"); if (o) { e.preventDefault(); const m = document.getElementById(o.dataset.modal); if (m) { if (m.id === "m-review") fillReview(o); if (m.id === "m-video") fillVideo(o); if (m.dataset.reset !== undefined) resetModal(m); openModal(m); } }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { const m = $$(".modal.open").pop(); if (m) closeModal(m); } if (e.key === "Tab") { const m = $$(".modal.open").pop(); if (!m) return; const f = $$("a,button,input,select,textarea,video,[tabindex]:not([tabindex='-1'])", m).filter((n) => !n.disabled && n.offsetParent); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } });
  function fillReview(o) { const m = $("#m-review"); $(".rvm-q", m).textContent = o.dataset.text; $(".rvm-by", m).textContent = o.dataset.by; }
  function fillVideo(o) { const m = $("#m-video"); const v = $("video", m); v.src = ROOT + "assets/video/" + (o.dataset.video || "family") + ".mp4"; v.poster = ROOT + "assets/video/" + (o.dataset.video || "family") + ".jpg"; $(".mv-t", m).textContent = o.dataset.title || ""; setTimeout(() => v.play().catch(() => {}), 200); }
  function resetModal(m) { $$("[data-step]", m).forEach((s) => (s.hidden = s.dataset.step !== "1")); $$("form", m).forEach((f) => f.reset()); $$(".field.bad", m).forEach((f) => f.classList.remove("bad")); }

  /* ---------- zip availability ---------- */
  const PLANS = [
    { k: "energy", name: "Haven Energy", d: "Fixed, low electricity rate. No battery.", p: "13.9¢", u: "/kWh" },
    { k: "both", name: "Energy + Backup", d: "Whole-home backup with a lower rate.", p: "14.6¢", u: "/kWh" },
    { k: "backup", name: "Backup Only", d: "Keep your provider, add Haven One.", p: "$22", u: "/mo" },
  ];
  const zipOk = (z) => /^\d{5}$/.test(z);
  const served = (z) => /^(7[5-9]|88)/.test(z) || /^(60|61|62)/.test(z);
  $$("form.zip").forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault();
    const inp = $("input", f), z = inp.value.trim(), err = f.parentElement.querySelector(".zip-err");
    if (!zipOk(z)) { f.classList.add("err"); if (err) { err.hidden = false; err.textContent = "Please enter a valid 5-digit zip code."; } inp.focus(); return; }
    f.classList.remove("err"); if (err) err.hidden = true;
    openZip(z);
  }));
  $$("form.zip input").forEach((i) => i.addEventListener("input", () => { i.value = i.value.replace(/\D/g, "").slice(0, 5); i.closest("form").classList.remove("err"); }));
  function openZip(z) {
    const m = $("#m-zip"); if (!m) return;
    const load = $("[data-step='load']", m), ok = $("[data-step='ok']", m), no = $("[data-step='no']", m), done = $("[data-step='done']", m);
    [ok, no, done].forEach((s) => (s.hidden = true)); load.hidden = false; $$(".zip-val", m).forEach((s) => (s.textContent = z));
    openModal(m);
    setTimeout(() => {
      load.hidden = true;
      if (served(z)) {
        const list = $(".modal-plans", ok); list.innerHTML = "";
        PLANS.filter((p) => !(/^6/.test(z) && p.k === "energy")).forEach((p, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "mplan" + (i === 1 ? " on" : ""); b.innerHTML = `<div><b>${p.name}</b><span>${p.d}</span></div><div class="pr">${p.p}<small style="font-size:12px;color:var(--muted);font-weight:500">${p.u}</small></div>`; b.addEventListener("click", () => { $$(".mplan", list).forEach((x) => x.classList.remove("on")); b.classList.add("on"); }); list.append(b); });
        ok.hidden = false;
      } else no.hidden = false;
    }, 900);
  }
  window.havenZip = openZip;

  /* ---------- local-only forms (never sent anywhere) ---------- */
  $$("form[data-local]").forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault(); let bad = false;
    $$("[required]", f).forEach((i) => { const fl = i.closest(".field"); const v = i.value.trim(); const okv = i.type === "email" ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) : i.type === "tel" ? v.replace(/\D/g, "").length >= 10 : v.length > 0; fl?.classList.toggle("bad", !okv); if (!okv) bad = true; });
    if (bad) { $(".field.bad input,.field.bad select,.field.bad textarea", f)?.focus(); return; }
    const host = f.closest("[data-flow]") || f.parentElement;
    const succ = $("[data-step='done']", host.closest(".modal") || host) || $(".form-done", host);
    const btn = $("button[type=submit]", f); if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner" style="border-top-color:currentColor"></span>'; }
    setTimeout(() => { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || "Submit"; } if (succ) { $$("[data-step]", succ.parentElement).forEach((s) => (s.hidden = true)); succ.hidden = false; } else toast("Thanks! We'll be in touch."); f.reset(); }, 800);
  }));
  $$("form[data-local] button[type=submit]").forEach((b) => (b.dataset.label = b.textContent));
  $$("[data-goto]").forEach((b) => b.addEventListener("click", () => { const m = b.closest(".modal"); $$("[data-step]", m).forEach((s) => (s.hidden = s.dataset.step !== b.dataset.goto)); }));

  /* ---------- custom dropdowns (utility select) ---------- */
  $$(".dd").forEach((dd) => {
    const btn = $(".dd-btn", dd), list = $(".dd-list", dd), opts = $$("button", list);
    let k = -1;
    const close = () => { dd.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
    btn.addEventListener("click", (e) => { e.stopPropagation(); const on = dd.classList.toggle("open"); btn.setAttribute("aria-expanded", on); });
    btn.addEventListener("keydown", (e) => { if (["ArrowDown", "ArrowUp"].includes(e.key)) { e.preventDefault(); dd.classList.add("open"); k = clamp(k + (e.key === "ArrowDown" ? 1 : -1), 0, opts.length - 1); opts.forEach((o, n) => o.classList.toggle("kb", n === k)); opts[k].scrollIntoView({ block: "nearest" }); } if (e.key === "Enter" && dd.classList.contains("open") && k > -1) { e.preventDefault(); opts[k].click(); } });
    opts.forEach((o) => o.addEventListener("click", () => { $("span", btn).textContent = o.dataset.label || o.firstChild.textContent; close(); dd.dispatchEvent(new CustomEvent("pick", { detail: o.dataset, bubbles: true })); }));
    document.addEventListener("click", (e) => { if (!dd.contains(e.target)) close(); });
  });

  /* ---------- pricing gate ---------- */
  const UTIL = window.HAVEN_UTILITIES || {};
  $$(".gate").forEach((g) => {
    g.addEventListener("pick", (e) => {
      const u = UTIL[e.detail.u]; if (!u) return;
      if (u.served === false) { toast(`${u.name} isn't served yet — we'll notify you when it is.`); return; }
      g.classList.add("done"); renderPrice(g, e.detail.u);
    });
    $$(".utility-chip", g).forEach((c) => c.addEventListener("click", () => renderPrice(g, c.dataset.u)));
    g.addEventListener("click", (e) => { if (e.target.closest("[data-reset-gate]")) { g.classList.remove("done"); $(".dd-btn span", g).textContent = "Who is your utility provider?"; } });
  });
  function renderPrice(g, key) {
    const u = UTIL[key]; if (!u) return;
    $$(".utility-chip", g).forEach((c) => c.classList.toggle("on", c.dataset.u === key));
    $$("[data-f]", g).forEach((el) => { const v = u[el.dataset.f]; if (v !== undefined) el.textContent = v; });
    $$("[data-show]", g).forEach((el) => (el.hidden = !(u.plans || []).includes(el.dataset.show)));
  }

  /* ---------- filter chips + search (areas, blog, press, roles) ---------- */
  $$("[data-filter]").forEach((wrap) => {
    const items = $$("[data-tags]", wrap), chips = $$(".chip", wrap), q = $("input[type=search]", wrap), count = $(".f-count", wrap), empty = $(".f-empty", wrap), sels = $$("select[data-key]", wrap);
    let tag = "all";
    const apply = () => {
      const s = (q?.value || "").trim().toLowerCase(); let n = 0;
      items.forEach((it) => {
        const okT = tag === "all" || it.dataset.tags.split(" ").includes(tag);
        const okS = !s || it.textContent.toLowerCase().includes(s);
        const okSel = sels.every((se) => !se.value || it.dataset[se.dataset.key] === se.value);
        const show = okT && okS && okSel; it.hidden = !show; if (show) n++;
      });
      $$("[data-group]", wrap).forEach((gr) => (gr.hidden = !$$("[data-tags]", gr).some((i) => !i.hidden)));
      if (count) count.textContent = n + (count.dataset.unit || "");
      if (empty) empty.hidden = n > 0;
    };
    chips.forEach((c) => c.addEventListener("click", () => { tag = c.dataset.tag; chips.forEach((x) => { x.classList.toggle("on", x === c); x.setAttribute("aria-pressed", x === c); }); apply(); }));
    q?.addEventListener("input", apply); sels.forEach((s) => s.addEventListener("change", apply));
    $("[data-clear]", wrap)?.addEventListener("click", () => { sels.forEach((s) => (s.value = "")); if (q) q.value = ""; apply(); });
    apply();
  });

  /* ---------- load more ---------- */
  $$("[data-more]").forEach((b) => {
    const grid = document.getElementById(b.dataset.more), step = +b.dataset.step || 6;
    const upd = () => { const hid = $$(".is-more", grid); if (!hid.length) b.hidden = true; };
    b.addEventListener("click", () => { $$(".is-more", grid).slice(0, step).forEach((el, i) => { el.classList.remove("is-more"); el.style.animation = `fadeUp .6s var(--ease-out) ${i * 0.05}s both`; }); upd(); });
    upd();
  });

  /* ---------- tabs ---------- */
  $$("[data-tabs]").forEach((t) => {
    const btns = $$("[data-tab]", t), panes = $$("[data-pane]", t);
    btns.forEach((b) => b.addEventListener("click", () => { btns.forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); }); panes.forEach((p) => (p.hidden = p.dataset.pane !== b.dataset.tab)); }));
  });

  /* ---------- reviews expand inline ---------- */
  $$(".rv .more").forEach((m) => m.setAttribute("aria-label", "Read full review"));

  /* ---------- count up ---------- */
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; const el = e.target; cio.unobserve(el);
    const end = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length, pre = el.dataset.pre || "", suf = el.dataset.suf || ""; const t0 = performance.now(), D = RM ? 1 : 1400;
    const tick = (t) => { const p = Math.min(1, (t - t0) / D), v = end * (1 - Math.pow(1 - p, 3)); el.textContent = pre + v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suf; if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: 0.4 });
  $$("[data-count]").forEach((el) => cio.observe(el));

  /* ---------- value cards (+ expand) ---------- */
  $$(".vcard").forEach((c) => $(".vplus", c)?.addEventListener("click", (e) => { e.stopPropagation(); c.classList.toggle("open"); $(".vplus", c).setAttribute("aria-expanded", c.classList.contains("open")); }));

  /* ---------- duration calculator ---------- */
  const calc = $("#calc");
  if (calc) {
    const st = { bat: 1, use: "reduced", charge: 100 };
    const USE = { low: 1.05, reduced: 2.15, everyday: 3.4 }; // kW avg
    const upd = () => {
      const kwh = 41 * st.bat * (st.charge / 100) * 0.95; const hrs = kwh / USE[st.use];
      $("#c-hours").textContent = hrs.toFixed(1); $("#c-pct").textContent = Math.min(99.6, 72 + hrs * 1.45).toFixed(1);
      $$("[data-bat]", calc).forEach((b) => b.classList.toggle("on", +b.dataset.bat === st.bat)); $$("[data-use]", calc).forEach((b) => b.classList.toggle("on", b.dataset.use === st.use));
      $("#c-charge-v").textContent = st.charge + "%"; $("#c-gauge").style.setProperty("--p", Math.min(1, hrs / 72));
      $$(".c-tag", calc).forEach((t) => t.classList.toggle("on", t.dataset.k === st.use));
    };
    $$("[data-bat]", calc).forEach((b) => b.addEventListener("click", () => { st.bat = +b.dataset.bat; upd(); }));
    $$("[data-use]", calc).forEach((b) => b.addEventListener("click", () => { st.use = b.dataset.use; upd(); }));
    $("#c-charge")?.addEventListener("input", (e) => { st.charge = +e.target.value; upd(); });
    upd();
  }

  /* ---------- bill advisor chat (scripted, local) ---------- */
  $$(".chat").forEach((ch) => {
    const log = $(".chat-log", ch), form = $("form", ch), inp = $("input[type=text]", form), file = $("input[type=file]", ch);
    const add = (who, html) => { const d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = html; log.append(d); log.scrollTop = log.scrollHeight; return d; };
    const typing = () => add("bot typing", "<i></i><i></i><i></i>");
    const reply = (q) => {
      const t = typing();
      setTimeout(() => {
        t.remove(); const s = q.toLowerCase(); let a;
        const m = s.match(/(\d{1,2}(?:\.\d+)?)\s*(¢|c|cents)/) || s.match(/0?\.(\d{2,3})/);
        if (m) { const rate = m[2] ? parseFloat(m[1]) : parseFloat("0." + m[1]) * 100; const kwh = (s.match(/(\d{3,5})\s*kwh/) || [, 1200])[1]; const diff = (rate - 13.9) * kwh / 100; a = diff > 0 ? `At <b>${rate.toFixed(1)}¢/kWh</b> and ${kwh} kWh a month, you'd pay about <b>$${(rate * kwh / 100).toFixed(0)}</b>. On Haven Energy that's roughly <b>$${(13.9 * kwh / 100).toFixed(0)}</b> — a saving near <b>$${diff.toFixed(0)}/mo</b>.` : `Nice — ${rate.toFixed(1)}¢ is already a sharp rate. Check your delivery charges and contract end date before switching.`; }
        else if (/provider|retail|current/.test(s)) a = "Got it. Most providers in your area land between 15¢ and 19¢ all-in. Share your rate (e.g. “16.4¢”) and monthly usage and I'll do the math.";
        else if (/hidden|fee|base charge/.test(s)) a = "Haven has one all-in rate: energy plus your utility's delivery, no monthly base fee, no usage thresholds.";
        else a = "I can compare your bill in seconds. Upload a PDF, or type your rate and usage — like “16.2¢, 1,400 kWh”.";
        add("bot", a);
      }, 1100);
    };
    form.addEventListener("submit", (e) => { e.preventDefault(); const v = inp.value.trim(); if (!v) return; add("me", v.replace(/</g, "&lt;")); inp.value = ""; reply(v); });
    $$("[data-ask]", ch).forEach((b) => b.addEventListener("click", () => { add("me", b.dataset.ask); reply(b.dataset.ask); }));
    file?.addEventListener("change", () => { const f = file.files[0]; if (!f) return; add("me", `📄 ${f.name.replace(/</g, "&lt;")}`); const t = typing(); setTimeout(() => { t.remove(); add("bot", "Thanks! I read your bill locally in this demo. Based on a typical 1,400 kWh month at 16.8¢, you'd save about <b>$41/mo</b> with Haven Energy."); }, 1500); file.value = ""; });
    $$("[data-chat-tab]", ch).forEach((b) => b.addEventListener("click", () => { $$("[data-chat-tab]", ch).forEach((x) => x.classList.toggle("on", x === b)); toast(b.dataset.chatTab === "how" ? "We compare your all-in rate against Haven's posted price for your utility." : "Savings dashboard opens once you're a member."); }));
  });

  /* ---------- bar chart grow ---------- */
  const bio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("grow"); bio.unobserve(e.target); } }), { threshold: 0.3 });
  $$(".bars").forEach((b) => bio.observe(b));

  /* ---------- energy utility tabs ---------- */
  $$("[data-rates]").forEach((w) => {
    const data = JSON.parse(w.dataset.rates); const chips = $$(".utility-chip", w);
    const set = (k) => { const d = data[k]; chips.forEach((c) => c.classList.toggle("on", c.dataset.k === k)); $$("[data-r]", w).forEach((el) => (el.textContent = d[el.dataset.r])); $$(".bar[data-i]", w).forEach((b) => b.style.setProperty("--h", d.bars[+b.dataset.i])); };
    chips.forEach((c) => c.addEventListener("click", () => set(c.dataset.k))); set(chips[0].dataset.k);
  });

  /* ---------- copy link (share) ---------- */
  $$("[data-share]").forEach((b) => b.addEventListener("click", () => { navigator.clipboard?.writeText(location.href).then(() => toast("Link copied"), () => toast("Copy the address bar to share")); }));

  /* ---------- video inline toggle (sound/replay pills) ---------- */
  $$("[data-vid-toggle]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); const v = b.closest(".vid-wrap").querySelector("video"); if (b.dataset.vidToggle === "replay") { v.currentTime = 0; v.play(); } else { v.muted = !v.muted; b.querySelector("span").textContent = v.muted ? b.dataset.offText : b.dataset.onText; } }));


  /* ---------- paint stage (Haven One) + solar stage ---------- */
  [[".paint-stage", "[data-paint-toggle]"], [".solar-stage", "[data-solar-toggle]"]].forEach(([sel, tg]) => {
    $$(sel).forEach((st) => {
      let manual = null;
      $(tg, st)?.addEventListener("click", () => { manual = !st.classList.contains("off"); st.classList.toggle("off", manual); });
      const f = () => { const r = st.getBoundingClientRect(); const total = r.height - innerHeight; const p = total > 0 ? clamp(-r.top / total, 0, 1) : 0; if (manual !== null && Math.abs(p - 0.5) > 0.3) manual = null; if (manual === null && !isMobile()) st.classList.toggle("off", p > 0.5); };
      addEventListener("scroll", () => requestAnimationFrame(f), { passive: true }); f();
      if (isMobile()) setInterval(() => { if (manual === null) st.classList.toggle("off"); }, 3500);
    });
  });
  /* tiles caption */
  $$(".tiles-stage").forEach((t) => { const cap = $(".tiles-cap", t); addEventListener("scroll", () => { const r = t.getBoundingClientRect(); const p = clamp(-r.top / (r.height - innerHeight), 0, 1); cap?.classList.toggle("on", p > 0.82); }, { passive: true }); });
  /* collage spread */
  $$(".collage").forEach((c) => io.observe(c));

  /* ---------- timeline connectors ---------- */
  function drawTL(tl) {
    const svg = $(".tl-line svg", tl), steps = $$(".tl-step", tl), tags = $$(".tl-tag", tl), box = tl.getBoundingClientRect();
    if (!svg || isMobile()) return;
    const W = box.width; let d = "";
    const head = $("h2", tl).getBoundingClientRect(); let x0 = W / 2, y0 = head.bottom - box.top + 12;
    steps.forEach((s, k) => {
      const ph = $(".ph", s).getBoundingClientRect(); const tx = $(".tx", s).getBoundingClientRect();
      const left = !s.classList.contains("r"); const cx = (left ? ph.left + ph.width / 2 : ph.left + ph.width / 2) - box.left; const top = ph.top - box.top;
      const midY = k === 0 ? y0 + (top - y0) / 2 : top - 40;
      d += `M${x0} ${y0} L${x0} ${midY - 12} Q${x0} ${midY} ${x0 + (cx > x0 ? 12 : -12)} ${midY} L${cx + (cx > x0 ? -12 : 12)} ${midY} Q${cx} ${midY} ${cx} ${midY + 12} L${cx} ${top} `;
      if (tags[k - 1]) { tags[k - 1].style.top = midY + "px"; tags[k - 1].style.left = (x0 + cx) / 2 + "px"; }
      x0 = cx; y0 = ph.bottom - box.top;
      const nx = steps[k + 1];
      if (nx) { const n = $(".ph", nx).getBoundingClientRect(); y0 = Math.max(ph.bottom, tx.bottom) - box.top - 0; }
    });
    const last = $(".center", tl); if (last) { const lb = last.getBoundingClientRect(); const ty = lb.top - box.top - 8; const midY = y0 + (ty - y0) / 2; d += `M${x0} ${y0} L${x0} ${midY - 12} Q${x0} ${midY} ${x0 + (W / 2 > x0 ? 12 : -12)} ${midY} L${W / 2 + (W / 2 > x0 ? -12 : 12)} ${midY} Q${W / 2} ${midY} ${W / 2} ${midY + 12} L${W / 2} ${ty}`; if (tags[steps.length - 1]) { tags[steps.length - 1].style.top = midY + "px"; tags[steps.length - 1].style.left = (x0 + W / 2) / 2 + "px"; } }
    svg.setAttribute("viewBox", `0 0 ${W} ${box.height}`); svg.innerHTML = `<path d="${d}"/><circle cx="${W / 2}" cy="${head.bottom - box.top + 12}" r="3.5"/>`;
    const path = $("path", svg), len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = len; path.dataset.len = len;
  }
  $$("[data-tl]").forEach((tl) => {
    const go = () => drawTL(tl); go(); addEventListener("resize", go); addEventListener("load", go);
    addEventListener("scroll", () => { const path = $(".tl-line path", tl); if (!path) return; const r = tl.getBoundingClientRect(); const p = clamp((innerHeight * 0.7 - r.top) / r.height, 0, 1); path.style.strokeDashoffset = path.dataset.len * (1 - p); }, { passive: true });
  });

  /* ---------- utility picker result ---------- */
  $$("[data-util-pick]").forEach((w) => w.addEventListener("pick", (e) => {
    const u = UTIL[e.detail.u], res = $(".util-res", w); res.hidden = false;
    if (!u || u.served === false) { res.innerHTML = `Haven isn't available with that utility yet. <a class="u-link" href="${ROOT}get-started.html">Join the waitlist →</a>`; return; }
    const names = { both: "Energy + Backup", energy: "Haven Energy", backup: "Backup Only" };
    res.innerHTML = `In <b>${u.region}</b>, Haven offers <b>${u.plans.map((p) => names[p]).join("</b> and <b>")}</b>. <a class="u-link" href="${ROOT}pricing.html">See pricing →</a>`;
  }));

  /* ---------- area modal ---------- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-modal='m-area']"); if (!a) return; const m = $("#m-area"), u = UTIL[a.dataset.u]; if (!m || !u) return;
    const names = { both: "Energy + Backup", energy: "Energy only", backup: "Backup Only" };
    const price = a.dataset.plan === "energy" ? [u.eRate, "/kWh all-in"] : a.dataset.plan === "both" ? [u.rate, "/kWh + battery " + u.bat + "/mo"] : [u.bat, "/month"];
    const set = (k, v) => { const el = $(`[data-a='${k}']`, m); if (el) el.textContent = v; };
    set("plan", names[a.dataset.plan]); set("name", u.name); set("region", u.region); set("price", price[0]); set("unit", price[1]);
  }, true);

  /* ---------- sign in demo ---------- */
  const si = $("#si-form");
  if (si) {
    const box = si.closest("[data-flow]"); const show = (k) => $$("[data-step]", box).forEach((s) => (s.hidden = s.dataset.step !== k));
    si.addEventListener("submit", (e) => { e.preventDefault(); const i = $("input", si), f = i.closest(".field"); const ok = i.value.replace(/\D/g, "").length >= 10; f.classList.toggle("bad", !ok); if (ok) { show("2"); $(".otp input", box).focus(); } });
    const otp = $$(".otp input", box);
    otp.forEach((o, k) => { o.addEventListener("input", () => { o.value = o.value.replace(/\D/g, "").slice(0, 1); if (o.value && otp[k + 1]) otp[k + 1].focus(); }); o.addEventListener("keydown", (e) => { if (e.key === "Backspace" && !o.value && otp[k - 1]) otp[k - 1].focus(); }); });
    $("#si-go")?.addEventListener("click", () => { if (otp.every((o) => o.value)) show("done"); else { otp.find((o) => !o.value).focus(); toast("Enter all 4 digits"); } });
    $("[data-back]", box)?.addEventListener("click", () => show("1"));
  }

  /* subnav active */
  $$(".subnav").forEach((n) => { const links = $$("a", n); const secs = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean); addEventListener("scroll", () => { let k = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < 160) k = i; }); links.forEach((l, i) => l.classList.toggle("on", i === k)); }, { passive: true }); });

  /* year */
  $$("[data-year]").forEach((y) => (y.textContent = new Date().getFullYear()));
})();
