/* ==========================================================
   Shared layout: icons, header, footer, drawer, WhatsApp,
   chat assistant, toast, reveal animations, helpers
   ========================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rupee = n => "₹" + Number(n || 0).toLocaleString("en-IN");
const pad = n => String(n).padStart(2, "0");
const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDate = s => new Date(s + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const fmtTime = t => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? "AM" : "PM"}`; };
const qs = k => new URLSearchParams(location.search).get(k);
const waLink = (text, num = STORE.whatsappRaw) => `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
const telLink = () => `tel:+${STORE.phoneRaw}`;
const mapEmbed = () => `https://www.google.com/maps?q=${encodeURIComponent(STORE.mapQuery)}&output=embed`;
const mapDir = () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE.mapQuery)}`;
const validPhone = s => /^(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(String(s).trim());
const starStr = n => "★★★★★".slice(0, Math.round(n)) + "☆☆☆☆☆".slice(0, 5 - Math.round(n));
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const I = (p, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${p}</svg>`;
const ICONS = {
  pin: I('<path d="M12 22s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/>'),
  phone: I('<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"/>'),
  clock: I('<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3 2"/>'),
  mail: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
  chev: I('<path d="M6 9l6 6 6-6"/>', 'stroke-width="2.2"'),
  arrow: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  menu: I('<path d="M4 7h16M4 12h16M4 17h10"/>'),
  close: I('<path d="M6 6l12 12M18 6L6 18"/>'),
  eye: I('<path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3.2"/>'),
  tool: I('<path d="M14.7 6.3a4 4 0 00-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 005.2-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>'),
  bolt: I('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
  drop: I('<path d="M12 2.7S5.5 10 5.5 14.5a6.5 6.5 0 0013 0C18.5 10 12 2.7 12 2.7z"/>'),
  spark: I('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>'),
  box: I('<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>'),
  frame: I('<circle cx="6.5" cy="13" r="3.8"/><circle cx="17.5" cy="13" r="3.8"/><path d="M10.3 12.5c1-1 2.4-1 3.4 0M2.7 12L1.5 9M21.3 12l1.2-3"/>'),
  users: I('<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.2c3 0 5.5 2 5.5 5.3"/>'),
  tag: I('<path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L2.5 12.5V2.5h10l8.1 8.1a2 2 0 010 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
  cal: I('<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>'),
  camera: I('<path d="M3 8a2 2 0 012-2h2.5l1.5-2h6l1.5 2H19a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><circle cx="12" cy="13" r="4"/>'),
  upload: I('<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/>'),
  download: I('<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>'),
  shield: I('<path d="M12 2.5l8 3v6c0 5-3.4 9-8 10.5C7.4 20.5 4 16.5 4 11.5v-6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
  chat: I('<path d="M21 12a8.5 8.5 0 01-12.4 7.6L3 21l1.4-5.4A8.5 8.5 0 1121 12z"/><path d="M8 11h.01M12 11h.01M16 11h.01" stroke-width="2.4"/>'),
  send: I('<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>'),
  search: I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  filter: I('<path d="M3 5h18M6 12h12M10 19h4"/>'),
  star: I('<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2 6.4 20.2l1.1-6.3L2.9 9.5l6.3-.9z"/>'),
  compare: I('<rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/>'),
  sliders: I('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
  reset: I('<path d="M3 12a9 9 0 109-9 9.7 9.7 0 00-6.7 2.8L3 8"/><path d="M3 3v5h5"/>'),
  flip: I('<path d="M12 3v18M8 7l-5 5 5 5M16 7l5 5-5 5"/>'),
  settings: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.6 1.6 0 009 19.4a1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1A1.6 1.6 0 004.6 9a1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z"/>'),
  grid: I('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'),
  inbox: I('<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6z"/>'),
  chart: I('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>'),
  store: I('<path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6"/>'),
  logout: I('<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>'),
  trash: I('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
  edit: I('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  insta: I('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01" stroke-width="2.4"/>'),
  fb: I('<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>'),
  google: I('<path d="M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5a4.3 4.3 0 01-1.9 2.8v2.3h3A9 9 0 0021 12.2z"/><path d="M12 21a8.9 8.9 0 006.1-2.2l-3-2.3a5.6 5.6 0 01-8.3-2.9H3.7v2.4A9 9 0 0012 21z"/><path d="M6.8 13.6a5.4 5.4 0 010-3.4V7.8H3.7a9 9 0 000 8.2z"/><path d="M12 6.6a4.9 4.9 0 013.4 1.3l2.6-2.6A8.7 8.7 0 0012 3a9 9 0 00-8.3 4.8l3.1 2.4A5.4 5.4 0 0112 6.6z"/>'),
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1112 21.8zm8.4-18.2A11.8 11.8 0 002 17.8L.3 24l6.4-1.7A11.8 11.8 0 0024 12a11.7 11.7 0 00-3.6-8.4z"/></svg>`
};
const LOGO_SVG = `<svg class="brand-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="22.5" stroke="#B8975A" stroke-width="1"/><circle cx="15.5" cy="25" r="6.2" stroke="currentColor" stroke-width="2"/><circle cx="32.5" cy="25" r="6.2" stroke="currentColor" stroke-width="2"/><path d="M21.6 24.2c1.5-1.4 3.3-1.4 4.8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9.3 23.5L7 20.5M38.7 23.5l2.3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M24 7.5l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#B8975A"/></svg>`;
const HILLS_SVG = `<svg class="hills" viewBox="0 0 1600 360" preserveAspectRatio="none" aria-hidden="true"><path data-depth="0.08" d="M0 210 C 160 150 260 120 400 160 S 640 90 800 140 S 1080 80 1220 130 S 1460 110 1600 150 V360 H0Z" fill="#EADFCB" opacity=".75"/><path data-depth="0.16" d="M0 260 C 180 210 330 190 480 220 S 760 170 920 210 S 1200 180 1360 215 S 1520 200 1600 210 V360 H0Z" fill="#E1D2B8" opacity=".75"/><path data-depth="0.26" d="M0 300 C 200 270 380 260 560 285 S 900 250 1100 280 S 1420 265 1600 285 V360 H0Z" fill="#D9C6A5" opacity=".6"/></svg>`;

/* ---------------- Helpers ---------------- */
function toast(msg, ms = 3200) {
  let t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), ms);
}
function hydrateIcons(root = document) { $$("[data-icon]", root).forEach(n => { if (!n.dataset.done) { n.insertAdjacentHTML("afterbegin", ICONS[n.dataset.icon] || ""); n.dataset.done = 1; } }); }
function track(event, detail) {
  const a = DB.get("analytics", { views: {}, events: {}, products: {}, days: {} });
  const day = isoDate(new Date());
  if (event === "view") { a.views[detail] = (a.views[detail] || 0) + 1; a.days[day] = (a.days[day] || 0) + 1; }
  else if (event === "product") a.products[detail] = (a.products[detail] || 0) + 1;
  else a.events[event] = (a.events[event] || 0) + 1;
  DB.set("analytics", a);
}

/* Opening status from STORE.hours */
function openStatus(now = new Date()) {
  const h = STORE.hours[now.getDay()];
  const mins = now.getHours() * 60 + now.getMinutes();
  const toM = t => { const [a, b] = t.split(":").map(Number); return a * 60 + b; };
  if (h && mins >= toM(h[0]) && mins < toM(h[1])) return { open: true, text: `Open now · until ${fmtTime(h[1])}` };
  for (let i = 0; i < 8; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i); const hh = STORE.hours[d.getDay()];
    if (hh && (i > 0 || mins < toM(hh[0]))) return { open: false, text: `Closed · opens ${i === 0 ? "today" : i === 1 ? "tomorrow" : DAYS[d.getDay()]} ${fmtTime(hh[0])}` };
  }
  return { open: false, text: "Closed" };
}
function hoursTable() {
  const today = new Date().getDay();
  return `<table class="hours-table">${[1, 2, 3, 4, 5, 6, 0].map(d => { const h = STORE.hours[d]; return `<tr class="${d === today ? "today" : ""}"><td>${DAYS[d]}</td><td>${h ? fmtTime(h[0]) + " – " + fmtTime(h[1]) : "Closed"}</td></tr>`; }).join("")}</table>`;
}

/* Enquiry submit: saves locally (admin dashboard) and opens WhatsApp with details */
function submitEnquiry(type, data, { whatsapp = true } = {}) {
  const rec = DB.push("enquiries", Object.assign({ type, status: "New" }, data));
  track("enquiry_" + type);
  const lines = [`Hello ${STORE.shortName}, I'd like to make a ${type.toLowerCase()} enquiry.`];
  Object.entries(data).forEach(([k, v]) => { if (v && typeof v === "string" && !v.startsWith("data:")) lines.push(`${k[0].toUpperCase() + k.slice(1)}: ${v}`); });
  lines.push(`Ref: ${rec.id}`);
  if (whatsapp) window.open(waLink(lines.join("\n")), "_blank", "noopener");
  return rec;
}

/* Product card */
function productCard(p, i = 0) {
  const cats = getCollections();
  const catName = (cats.find(c => c.id === p.cats[0]) || {}).short || "";
  return `<article class="product-card reveal reveal-d${i % 4}">
    <div class="p-media" data-cursor="View">${p.badge ? `<span class="p-badge ${/premium|titanium/i.test(p.badge) ? "gold" : ""}">${esc(p.badge)}</span>` : ""}${productMedia(p, "front", { ratio: 1 })}
      <div class="p-quick">
        <a href="try-on.html?frame=${encodeURIComponent(p.id)}" aria-label="Try ${esc(p.name)} on with camera">${ICONS.camera} Try on</a>
        <a class="wa" href="${waLink(`Hello ${STORE.shortName}, is the "${p.name}" (${p.id}, ${p.colorName}) available?`)}" target="_blank" rel="noopener" aria-label="Enquire about ${esc(p.name)} on WhatsApp">${ICONS.whatsapp} Enquire</a>
      </div>
    </div>
    <div class="p-body">
      <span class="p-cat">${esc(catName)} · ${esc(SHAPE_LABELS[p.shape] || "")}</span>
      <h3 class="p-name">${esc(p.name)}</h3>
      <div class="p-foot">
        <div class="p-meta"><span class="swatch" style="background:${esc(p.color)}"></span>${esc(p.colorName)}</div>
        <div class="p-price">${rupee(p.price)}</div>
      </div>
    </div>
    <a class="p-link" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="View ${esc(p.name)}"></a>
  </article>`;
}

/* ---------------- Chrome (header/footer) ---------------- */
function renderChrome() {
  const page = document.body.dataset.page || "";
  const cats = getCollections();
  const nav = [
    ["home", "index.html", "Home"],
    ["collections", "collections.html", "Collections", true],
    ["lenses", "lenses.html", "Lenses & Vision"],
    ["eye-testing", "eye-testing.html", "Eye Testing"],
    ["try-on", "try-on.html", "Virtual Try-On"],
    ["about", "about.html", "About"],
    ["reviews", "reviews.html", "Reviews"],
    ["contact", "contact.html", "Visit Us"]
  ];
  const st = openStatus();
  const mega = `<div class="mega" role="menu">
      <div><h5>Shop by</h5>${cats.slice(0, 4).map(c => `<a href="collections.html?c=${c.id}">${esc(c.name)}</a>`).join("")}<a href="collections.html">All Eyewear</a></div>
      <div><h5>Explore</h5>${cats.slice(4).map(c => `<a href="collections.html?c=${c.id}">${esc(c.name)}</a>`).join("")}<a href="collections.html#finder">Frame Finder</a><a href="services.html">Repairs & Enquiries</a><a href="services.html#consult">Frame Consultation</a></div>
      <div class="mega-feature"><div><h4>Try frames on your face</h4><p>Use your camera — processed privately in your browser — to preview frames instantly.</p></div><a href="try-on.html">Open the studio →</a></div>
    </div>`;
  const header = `
    ${STORE.announcement ? `<div class="announce">${esc(STORE.announcement)} · <a href="try-on.html">Try frames virtually</a></div>` : ""}
    <div class="topbar"><div class="container">
      <div class="tb-group"><a href="${mapDir()}" target="_blank" rel="noopener">${ICONS.pin}<span>Commercial Road, Upper Bazar, Ooty</span></a><a class="hide-sm" href="${telLink()}">${ICONS.phone}${esc(STORE.phone)}</a></div>
      <div class="tb-group"><span>${ICONS.clock}${esc(st.text)}</span><a class="hide-sm" href="${STORE.googleReviewUrl}" target="_blank" rel="noopener">${ICONS.star}${STORE.rating} on Google · ${STORE.reviewCount} reviews</a></div>
    </div></div>
    <header class="site-header" id="siteHeader"><div class="container nav">
      <a class="brand" href="index.html" aria-label="${esc(STORE.name)} home">${LOGO_SVG}<span class="brand-text"><span class="brand-name">OPTI<b>CARE</b></span><span class="brand-sub">Optical House · Ooty</span></span></a>
      <nav aria-label="Main"><ul class="nav-links">${nav.map(([id, href, label, hasMega]) => hasMega
        ? `<li class="has-mega"><button aria-haspopup="true" aria-expanded="false" class="${page === id ? "active" : ""}">${label}${ICONS.chev}</button>${mega}</li>`
        : `<li><a href="${href}" class="${page === id ? "active" : ""}" ${page === id ? 'aria-current="page"' : ""}>${label}</a></li>`).join("")}</ul></nav>
      <div class="nav-cta">
        <a class="btn btn-dark btn-sm" href="appointment.html">Book Eye Test</a>
        <button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu"><span class="menu-label">MENU</span>${ICONS.menu}</button>
      </div>
    </div></header>
    <div class="drawer-bg" id="drawerBg"></div>
    <aside class="drawer" id="drawer" aria-label="Menu">
      <div class="drawer-head"><a class="brand" href="index.html">${LOGO_SVG}<span class="brand-text"><span class="brand-name">OPTI<b>CARE</b></span><span class="brand-sub">Optical House</span></span></a><button class="icon-btn" id="drawerClose" aria-label="Close menu">${ICONS.close}</button></div>
      <nav>${nav.map(([id, href, label, m], i) => `<a href="${href}">${label}<small>0${i + 1}</small></a>${m ? `<div class="sub">${cats.map(c => `<a href="collections.html?c=${c.id}">${esc(c.name)}</a>`).join("")}<a href="services.html">Repairs & Enquiries</a></div>` : ""}`).join("")}</nav>
      <div class="drawer-foot">
        <a class="btn btn-wa btn-block" href="${waLink(`Hello ${STORE.shortName}, I have an enquiry.`)}" target="_blank" rel="noopener">${ICONS.whatsapp} WhatsApp Us</a>
        <a class="btn btn-outline btn-block" href="${telLink()}">${ICONS.phone} Call the Store</a>
      </div>
    </aside>`;

  const hrs = [1, 2, 3, 4, 5, 6, 0].map(d => `<li class="${d === new Date().getDay() ? "today" : ""}"><span>${DAYS[d].slice(0, 3)}</span><span>${STORE.hours[d] ? fmtTime(STORE.hours[d][0]) + " – " + fmtTime(STORE.hours[d][1]) : "Closed"}</span></li>`).join("");
  const footer = `
    <footer class="site-footer">
      <div class="foot-cta"><div class="foot-cta-bg"><img src="${typeof U === "function" ? U(IMG.wallGold, 1800, 700) : ""}" alt="" loading="lazy"></div>
        <div class="container foot-cta-in">
          <div><span class="eyebrow" style="color:var(--gold-soft)">Your next pair is waiting</span><h2 class="mega-title">Come see us<br><em>in Ooty.</em></h2></div>
          <div class="foot-cta-actions">
            <a class="fc-btn" href="appointment.html" data-cursor="Book"><span class="fc-ic">${ICONS.cal}</span><span><b>Book an eye test</b><small>Pick a time online</small></span>${ICONS.arrow}</a>
            <a class="fc-btn" href="try-on.html" data-cursor="Try"><span class="fc-ic">${ICONS.camera}</span><span><b>Virtual try-on</b><small>See frames on your face</small></span>${ICONS.arrow}</a>
            <a class="fc-btn" href="${mapDir()}" target="_blank" rel="noopener" data-cursor="Go"><span class="fc-ic">${ICONS.pin}</span><span><b>Get directions</b><small>Commercial Rd, Upper Bazar</small></span>${ICONS.arrow}</a>
          </div>
        </div>
      </div>
      <div class="container">
      <div class="foot-grid">
        <div>
          <a class="brand" href="index.html">${LOGO_SVG}<span class="brand-text"><span class="brand-name">OPTI<b>CARE</b></span><span class="brand-sub">Optical House · Ooty</span></span></a>
          <p class="foot-tagline">${esc(STORE.tagline)}</p>
          <div class="foot-rating"><span class="stars">★★★★★</span><b>${STORE.rating}</b><span>from ${STORE.reviewCount} Google reviews</span></div>
          <div class="social"><a href="${STORE.social.instagram}" aria-label="Instagram">${ICONS.insta}</a><a href="${STORE.social.facebook}" aria-label="Facebook">${ICONS.fb}</a><a href="${STORE.googleReviewUrl}" target="_blank" rel="noopener" aria-label="Google reviews">${ICONS.google}</a><a href="${waLink("Hello Opticare")}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.whatsapp}</a></div>
        </div>
        <div><h5>Shop</h5><ul class="foot-links">${cats.map(c => `<li><a href="collections.html?c=${c.id}">${esc(c.short)}</a></li>`).join("")}<li><a href="collections.html#finder">Frame Finder</a></li></ul></div>
        <div><h5>Care</h5><ul class="foot-links">
          <li><a href="appointment.html">Book Appointment</a></li><li><a href="eye-testing.html">Eye Testing</a></li><li><a href="lenses.html">Lenses</a></li><li><a href="lenses.html#contacts">Contact Lenses</a></li><li><a href="services.html#repair">Repairs</a></li><li><a href="services.html#prescription">Prescription Enquiry</a></li><li><a href="services.html#delivery">Delivery</a></li></ul></div>
        <div><h5>Opticare</h5><ul class="foot-links"><li><a href="about.html">Our Story</a></li><li><a href="reviews.html">Reviews</a></li><li><a href="try-on.html">Virtual Try-On</a></li><li><a href="contact.html">Contact</a></li></ul></div>
        <div class="foot-visit"><h5>Visit the Showroom</h5>
          <p>${STORE.addressLines.map(esc).join("<br>")}</p>
          <p><a href="${telLink()}">${esc(STORE.phone)}</a><br><a href="mailto:${esc(STORE.email)}">${esc(STORE.email)}</a></p>
          <ul class="foot-hours">${hrs}</ul>
        </div>
      </div>
      <div class="foot-word" aria-hidden="true"><span>OPTI<b>CARE</b></span></div>
      <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${esc(STORE.name)}, Ooty. All rights reserved.</span><span class="fb-links"><a href="contact.html">Contact</a><a href="sitemap.xml">Sitemap</a><a href="admin.html">Staff login</a></span><button class="to-top" id="toTop" aria-label="Back to top">${ICONS.arrow}</button></div>
    </div></footer>
    <div class="fab-wrap">
      ${page !== "try-on" ? `<a class="fab fab-tryon" href="try-on.html" aria-label="Virtual try-on">${ICONS.camera}<span>Try On</span></a>` : ""}
      <button class="fab fab-chat" id="chatFab" aria-label="Open chat assistant">${ICONS.chat}</button>
      <a class="fab fab-wa" href="${waLink(`Hello ${STORE.shortName}, I have a question.`)}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ICONS.whatsapp}</a>
    </div>`;

  const top = $("#chrome-top"), bottom = $("#chrome-bottom");
  if (top) top.outerHTML = header;
  if (bottom) bottom.outerHTML = footer;

  $("#toTop") && ($("#toTop").onclick = () => scrollTo({ top: 0, behavior: "smooth" }));
  // header behaviour
  const hdr = $("#siteHeader");
  const onScroll = () => hdr && hdr.classList.toggle("scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  $$(".has-mega > button").forEach(b => b.addEventListener("click", e => {
    const li = b.parentElement; const o = li.classList.toggle("open"); b.setAttribute("aria-expanded", o);
    e.stopPropagation();
  }));
  document.addEventListener("click", e => { if (!e.target.closest(".has-mega")) $$(".has-mega.open").forEach(l => l.classList.remove("open")); });
  const toggle = o => document.body.classList.toggle("drawer-open", o);
  $("#menuBtn") && ($("#menuBtn").onclick = () => toggle(true));
  $("#drawerClose") && ($("#drawerClose").onclick = () => toggle(false));
  $("#drawerBg") && ($("#drawerBg").onclick = () => toggle(false));
  document.addEventListener("keydown", e => { if (e.key === "Escape") { toggle(false); $(".chat")?.classList.remove("open"); } });
}

/* ---------------- Reveal + parallax ---------------- */
function initMotion() {
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -40px 0px" }) : null;
  const scan = () => $$(".reveal:not(.in), .img-reveal:not(.in)").forEach(el => io ? io.observe(el) : el.classList.add("in"));
  scan(); window.rescanReveal = scan;
  const layers = $$("[data-depth]");
  if (layers.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let ticking = false;
    const run = () => {
      layers.forEach(l => {
        const r = l.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const off = (r.top + r.height / 2 - innerHeight / 2) * parseFloat(l.dataset.depth);
        l.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
      });
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true }); run();
  }
}

/* ---------------- Luxe: photo heroes, preloader, cursor ---------------- */
function initLuxe() {
  // Photo page heroes
  const ph = $(".page-hero[data-hero]");
  if (ph && typeof IMG !== "undefined" && IMG[ph.dataset.hero]) {
    ph.classList.add("photo"); document.body.classList.add("has-hero");
    ph.insertAdjacentHTML("afterbegin", `<div class="ph-bg"><img src="${U(IMG[ph.dataset.hero], 1600)}" srcset="${USET(IMG[ph.dataset.hero])}" sizes="100vw" alt="" fetchpriority="high"></div>`);
  }
  // Preloader (first visit per session only)
  let seen = false; try { seen = sessionStorage.getItem("oc_pl") === "1"; sessionStorage.setItem("oc_pl", "1"); } catch (e) { }
  const done = () => requestAnimationFrame(() => document.body.classList.add("is-loaded"));
  if (!seen && document.body.dataset.page === "home" && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const pl = document.createElement("div"); pl.className = "preloader"; pl.setAttribute("aria-hidden", "true");
    pl.innerHTML = `<div class="pl-inner"><svg viewBox="0 0 48 48" fill="none" stroke="#D9C49A" stroke-width="1.2"><circle cx="15.5" cy="25" r="6.2"/><circle cx="32.5" cy="25" r="6.2"/><path d="M21.6 24.2c1.5-1.4 3.3-1.4 4.8 0" stroke-linecap="round"/><circle cx="24" cy="24" r="22.5" stroke-opacity=".5"/></svg><div class="pl-word"><span>OPTI<b>CARE</b></span></div><small>Optical House · Ooty</small></div>`;
    document.body.appendChild(pl);
    const finish = () => { pl.classList.add("done"); setTimeout(done, 350); setTimeout(() => pl.remove(), 1400); };
    const t = setTimeout(finish, 2200);
    addEventListener("load", () => { clearTimeout(t); setTimeout(finish, 900); }, { once: true });
  } else done();
  // Custom cursor
  if (matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const dot = document.createElement("div"), ring = document.createElement("div");
    dot.className = "cursor-dot"; ring.className = "cursor-ring"; document.body.append(dot, ring); document.body.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("mousemove", e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; }, { passive: true });
    const loop = () => { rx += (x - rx) * .18; ry += (y - ry) * .18; ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); }; loop();
    document.addEventListener("mouseover", e => { const t = e.target.closest("[data-cursor]"); ring.classList.toggle("big", !!t); ring.textContent = t ? t.dataset.cursor : ""; });
    document.addEventListener("mouseleave", () => { dot.style.opacity = ring.style.opacity = 0; });
    document.addEventListener("mouseenter", () => { dot.style.opacity = ring.style.opacity = ""; });
  }
}

/* ---------------- Chat assistant (rule-based, offline) ---------------- */
function initChat() {
  const fab = $("#chatFab"); if (!fab) return;
  const box = document.createElement("div"); box.className = "chat"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Opticare assistant");
  box.innerHTML = `<div class="chat-head"><span class="avatar">O</span><div><b>Opticare Assistant</b><small>Usually replies instantly</small></div><button aria-label="Close chat">${ICONS.close}</button></div>
    <div class="chat-body"></div><div class="chat-chips"></div>
    <form class="chat-form"><input placeholder="Ask about frames, eye tests, repairs…" aria-label="Your message"><button aria-label="Send">${ICONS.send}</button></form>`;
  document.body.appendChild(box);
  const body = $(".chat-body", box), chips = $(".chat-chips", box);
  const st = () => openStatus().text;
  const KB = [
    { k: /hour|time|open|close|timing|today|sunday/, a: () => `We're ${st().toLowerCase()}.<br>${[1, 2, 3, 4, 5, 6, 0].map(d => `${DAYS[d].slice(0, 3)}: ${STORE.hours[d] ? fmtTime(STORE.hours[d][0]) + "–" + fmtTime(STORE.hours[d][1]) : "Closed"}`).join("<br>")}` },
    { k: /where|address|locat|direction|map|reach/, a: () => `We're at ${esc(STORE.address)}. <a href="${mapDir()}" target="_blank" rel="noopener">Get directions</a>.` },
    { k: /eye ?test|test|checkup|check-up|power|prescription|vision/, a: () => `We offer eye testing and prescription guidance in store. <a href="appointment.html">Request a time</a> or just walk in.` },
    { k: /repair|broken|screw|loose|pad|adjust|fix|bent/, a: () => `Yes — we handle loose screws, nose pads, adjustments and many quick repairs, often while you wait. <a href="services.html#repair">Send a repair request</a> with a photo.` },
    { k: /contact lens|contacts|toric|daily|monthly/, a: () => `We support ordering of daily, monthly and toric contact lenses. <a href="lenses.html#contacts">Learn more</a> or WhatsApp us your prescription.` },
    { k: /try|camera|virtual|ar\b|face/, a: () => `Our <a href="try-on.html">Virtual Try-On Studio</a> lets you preview frames on your face using your camera — processed privately in your browser. You can also upload a photo.` },
    { k: /price|cost|cheap|budget|₹|rupee|how much/, a: () => `Frames start from around ${rupee(Math.min(...getProducts().map(p => p.price)))} (indicative — lenses extra). Use the <a href="collections.html#finder">Frame Finder</a> to filter by budget, or ask us on WhatsApp.` },
    { k: /sun|uv|shade|polar/, a: () => `Browse our <a href="collections.html?c=sunglasses">sunglasses</a> — UV-protective styles, and prescription sunglasses on request.` },
    { k: /fast|urgent|quick|same day|hours|travel|tourist/, a: () => `Visiting Ooty and need glasses fast? Many single-vision prescriptions can be done quickly — one traveller reported getting glasses in about five hours. <a href="${waLink("Hello Opticare, I need glasses urgently.")}" target="_blank" rel="noopener">WhatsApp us</a> for an estimate.` },
    { k: /deliver|courier|ship|post/, a: () => `Ask us about local delivery and courier options via our <a href="services.html#delivery">delivery enquiry</a>.` },
    { k: /kid|child|school/, a: () => `We have flexible, durable <a href="collections.html?c=kids">kids' frames</a> made for everyday wear.` },
    { k: /progressive|bifocal|multifocal|blue|computer|screen|photochrom/, a: () => `See our <a href="lenses.html">lens options</a> — single-vision, progressive, blue-light filtering, photochromic and more.` },
    { k: /phone|call|number|whatsapp|contact/, a: () => `Call <a href="${telLink()}">${esc(STORE.phone)}</a> or <a href="${waLink("Hello Opticare")}" target="_blank" rel="noopener">message us on WhatsApp</a>.` },
    { k: /review|rating|google/, a: () => `We're rated ${STORE.rating}/5 from ${STORE.reviewCount} Google reviews. <a href="reviews.html">Read customer feedback</a>.` },
    { k: /^(hi|hello|hey|vanakkam|namaste)/, a: () => `Hello! 👋 How can we help you see better today?` }
  ];
  const reply = t => { const hit = KB.find(x => x.k.test(t.toLowerCase())); return hit ? hit.a() : `I'm not sure about that one — our team can help directly. <a href="${waLink("Hello Opticare, " + t)}" target="_blank" rel="noopener">Continue on WhatsApp</a>.`; };
  const push = (html, who) => { const m = document.createElement("div"); m.className = "msg " + who; m.innerHTML = html; body.appendChild(m); body.scrollTop = body.scrollHeight; };
  const ask = t => { push(esc(t), "me"); setTimeout(() => push(reply(t), "bot"), 380); track("chat_message"); };
  ["Opening hours", "Book an eye test", "Repair my glasses", "Virtual try-on", "Contact lenses", "Where are you?"].forEach(c => { const b = document.createElement("button"); b.type = "button"; b.textContent = c; b.onclick = () => ask(c); chips.appendChild(b); });
  let greeted = false;
  const open = o => { box.classList.toggle("open", o); if (o && !greeted) { greeted = true; push(`Welcome to <b>Opticare Optical House</b>, Ooty. ${st()}. Ask me anything about frames, lenses, eye tests or repairs.`, "bot"); } if (o) $("input", box).focus(); };
  fab.onclick = () => open(!box.classList.contains("open"));
  $(".chat-head button", box).onclick = () => open(false);
  $("form", box).onsubmit = e => { e.preventDefault(); const i = $("input", box); const v = i.value.trim(); if (v) { ask(v); i.value = ""; } };
}

/* ---------------- Accordion ---------------- */
function initAccordions(root = document) {
  $$(".acc-item > button", root).forEach(b => b.onclick = () => {
    const it = b.parentElement, p = it.querySelector(".acc-panel"); const o = it.classList.toggle("open");
    b.setAttribute("aria-expanded", o); p.style.maxHeight = o ? p.scrollHeight + "px" : 0;
  });
}
const faqHTML = list => `<div class="acc">${list.map(f => `<div class="acc-item"><button aria-expanded="false">${esc(f.q)}<i>+</i></button><div class="acc-panel"><div>${esc(f.a)}</div></div></div>`).join("")}</div>`;

/* ---------------- Boot ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  initLuxe();
  hydrateIcons();
  initChat();
  initAccordions();
  initMotion();
  track("view", document.body.dataset.page || location.pathname);
  if (STORE.gaId && /^G-[A-Z0-9]+$/.test(STORE.gaId) && document.body.dataset.page !== "admin") {
    const s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + STORE.gaId; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); }; gtag("js", new Date()); gtag("config", STORE.gaId);
  }
  $$("[data-store]").forEach(n => { const k = n.dataset.store; if (k === "phone") { n.textContent = STORE.phone; if (n.tagName === "A") n.href = telLink(); } else if (STORE[k] != null) n.textContent = STORE[k]; });
  $$("[data-wa]").forEach(a => { a.href = waLink(a.dataset.wa || `Hello ${STORE.shortName}`); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-dir]").forEach(a => { a.href = mapDir(); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-tel]").forEach(a => a.href = telLink());
});
