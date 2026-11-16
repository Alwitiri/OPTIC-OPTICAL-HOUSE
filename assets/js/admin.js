/* ==========================================================
   Admin dashboard (DEMO: data lives in this browser's localStorage)
   IMPORTANT: client-side login is for demonstration only and is
   NOT secure. Before going live, move data + auth to a backend
   such as Supabase (see README.md → "Phase 2: backend").
   ========================================================== */
(function () {
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "opticare-demo"; // demo only — replace with server-side auth
  const SKEY = "oc_admin_session";
  let view = "overview";
  const root = () => $("#admin");
  const authed = () => { try { const s = JSON.parse(sessionStorage.getItem(SKEY)); return s && Date.now() - s.at < 4 * 3600e3; } catch (e) { return false; } };
  const pill = s => `<span class="pill ${{ New: "amber", Requested: "amber", Confirmed: "green", Completed: "dark", Resolved: "green", Cancelled: "red", "In progress": "amber", Published: "green", Hidden: "" }[s] || ""}">${esc(s)}</span>`;
  const when = iso => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  function login() {
    root().innerHTML = `<form class="form-card" id="lf" style="max-width:420px;margin:0 auto">
      <div class="f-icon" style="width:54px;height:54px;border-radius:50%;background:var(--beige);color:var(--gold-deep);display:grid;place-items:center;margin-bottom:16px">${ICONS.settings}</div>
      <h2 style="font-size:32px">Staff login</h2>
      <label class="field" style="margin-bottom:14px"><span>Username</span><input name="u" autocomplete="username" required></label>
      <label class="field"><span>Password</span><input name="p" type="password" autocomplete="current-password" required></label>
      <button class="btn btn-dark btn-block" style="margin-top:18px">Log in</button><div id="lm"></div>
      <p class="muted" style="font-size:12.5px;margin-top:14px">Demo dashboard — credentials are in README.md. Data is stored only in this browser.</p></form>`;
    $("#lf").onsubmit = e => {
      e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
      if (f.u === ADMIN_USER && f.p === ADMIN_PASS) { sessionStorage.setItem(SKEY, JSON.stringify({ at: Date.now() })); render(); }
      else $("#lm").innerHTML = `<div class="form-msg err">Invalid username or password.</div>`;
    };
  }

  function modal(title, html, onSave, saveLabel = "Save") {
    const bg = document.createElement("div"); bg.className = "modal-bg";
    bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><h3>${esc(title)}</h3><button class="icon-btn" data-x aria-label="Close">${ICONS.close}</button></div><form class="modal-body">${html}</form><div class="modal-foot"><button class="btn btn-outline btn-sm" data-x>Cancel</button>${onSave ? `<button class="btn btn-dark btn-sm" data-save>${saveLabel}</button>` : ""}</div></div>`;
    document.body.appendChild(bg);
    const close = () => bg.remove();
    $$("[data-x]", bg).forEach(b => b.onclick = close);
    bg.onclick = e => { if (e.target === bg) close(); };
    const form = $("form", bg);
    if (onSave) { const save = async () => { if (await onSave(form) !== false) close(); }; $("[data-save]", bg).onclick = save; form.onsubmit = e => { e.preventDefault(); save(); }; }
    return bg;
  }

  function shell() {
    const enq = DB.get("enquiries", []), appts = DB.get("appointments", []), revs = DB.get("reviews", []);
    const nav = [
      ["overview", "grid", "Overview"], ["products", "frame", "Products"], ["collections", "tag", "Collections"],
      ["enquiries", "inbox", "Enquiries", enq.filter(x => x.status === "New").length],
      ["appointments", "cal", "Appointments", appts.filter(x => x.status === "Requested").length],
      ["reviews", "star", "Reviews", revs.filter(r => !r.published).length],
      ["store", "store", "Store info"], ["analytics", "chart", "Analytics"]
    ];
    root().innerHTML = `<div class="admin-shell"><nav class="admin-nav">${nav.map(([id, ic, l, c]) => `<button data-v="${id}" class="${view === id ? "on" : ""}">${ICONS[ic]}${l}${c ? `<span class="count">${c}</span>` : ""}</button>`).join("")}<button data-logout>${ICONS.logout}Log out</button></nav><div class="admin-main" id="am"></div></div>`;
    $$(".admin-nav [data-v]").forEach(b => b.onclick = () => { view = b.dataset.v; render(); });
    $(".admin-nav [data-logout]").onclick = () => { sessionStorage.removeItem(SKEY); render(); };
  }

  const V = {};
  V.overview = () => {
    const enq = DB.get("enquiries", []), appts = DB.get("appointments", []), a = DB.get("analytics", { views: {}, events: {}, products: {}, days: {} });
    const views = Object.values(a.views).reduce((x, y) => x + y, 0);
    const today = isoDate(new Date());
    const up = appts.filter(x => x.date >= today && x.status !== "Cancelled").sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time)).slice(0, 6);
    return `<h2>Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}.</h2><p class="muted">${esc(STORE.name)} · ${esc(openStatus().text)}</p>
      <div class="kpis"><div class="kpi"><strong>${getProducts().length}</strong><span>Products</span></div><div class="kpi"><strong>${enq.filter(x => x.status === "New").length}</strong><span>New enquiries</span></div><div class="kpi"><strong>${up.length}</strong><span>Upcoming tests</span></div><div class="kpi"><strong>${views}</strong><span>Page views (this browser)</span></div></div>
      <div class="grid g2"><div><h4>Upcoming appointments</h4>${up.length ? `<table class="table">${up.map(x => `<tr><td>${fmtDate(x.date)}<br><small class="muted">${fmtTime(x.time)}</small></td><td>${esc(x.name)}<br><small class="muted">${esc(x.reason)}</small></td><td>${pill(x.status)}</td></tr>`).join("")}</table>` : `<p class="muted">No upcoming appointments.</p>`}</div>
      <div><h4>Latest enquiries</h4>${enq.length ? `<table class="table">${enq.slice(0, 6).map(x => `<tr><td>${esc(x.type)}<br><small class="muted">${when(x.createdAt)}</small></td><td>${esc(x.name)}</td><td>${pill(x.status)}</td></tr>`).join("")}</table>` : `<p class="muted">No enquiries yet.</p>`}</div></div>`;
  };

  V.products = () => {
    const ps = getProducts();
    return `<div class="toolbar"><h2 style="margin:0;flex:1">Products</h2><input id="pq" placeholder="Search…"><button class="btn btn-dark btn-sm" id="addP">${ICONS.plus} Add product</button><button class="btn btn-outline btn-sm" id="resetP">Restore defaults</button></div>
      <table class="table"><thead><tr><th></th><th>Name</th><th>Collections</th><th>Shape</th><th>Price</th><th>Media</th><th></th></tr></thead><tbody>${ps.map(p => `<tr data-row="${esc(p.name.toLowerCase())}"><td><div class="thumb">${productMedia(p)}</div></td><td><b>${esc(p.name)}</b><br><small class="muted">${esc(p.id)} · ${esc(p.colorName)}</small></td><td>${p.cats.map(esc).join(", ")}</td><td>${SHAPE_LABELS[p.shape]}</td><td>${rupee(p.price)}</td><td>${p.photo ? pill("Photo") : ""} ${p.tryonImg ? pill("Try-on PNG") : ""}</td><td class="tbl-actions"><button data-e="${esc(p.id)}">Edit</button><a href="product.html?id=${encodeURIComponent(p.id)}" target="_blank">View</a><button data-d="${esc(p.id)}">Delete</button></td></tr>`).join("")}</tbody></table>`;
  };
  function bindProducts() {
    $("#pq").oninput = e => $$("tr[data-row]").forEach(r => r.style.display = r.dataset.row.includes(e.target.value.toLowerCase()) ? "" : "none");
    $("#addP").onclick = () => editProduct();
    $("#resetP").onclick = () => { if (confirm("Restore the default sample products? Your product changes will be lost.")) { localStorage.removeItem("oc_products"); render(); } };
    $$("[data-e]").forEach(b => b.onclick = () => editProduct(getProducts().find(p => p.id === b.dataset.e)));
    $$("[data-d]").forEach(b => b.onclick = () => { if (confirm("Delete this product?")) { saveProducts(getProducts().filter(p => p.id !== b.dataset.d)); render(); } });
  }
  function saveProducts(list) { if (!DB.set("products", list)) { alert("Storage is full — try smaller images."); return false; } return true; }
  function editProduct(p) {
    const isNew = !p; p = p || { id: "oc-" + Date.now().toString(36).slice(-4), name: "", cats: ["prescription"], shape: "rectangle", material: "Acetate", color: "#1E1D1B", colorName: "", lens: "clear", price: 1990, style: [], desc: "" };
    const cats = getCollections();
    let photo = p.photo || "", tryon = p.tryonImg || "";
    const bg = modal(isNew ? "Add product" : "Edit product", `<div class="form-grid">
      <label class="field"><span>Name</span><input name="name" value="${esc(p.name)}" required></label>
      <label class="field"><span>Code</span><input name="id" value="${esc(p.id)}" ${isNew ? "" : "readonly"}></label>
      <div class="field full"><span>Collections</span><div class="chips">${cats.map(c => `<label class="chip"><input type="checkbox" name="cats" value="${c.id}" ${p.cats.includes(c.id) ? "checked" : ""}> ${esc(c.short)}</label>`).join("")}</div></div>
      <label class="field"><span>Shape</span><select name="shape">${Object.keys(FRAME_SHAPES).map(s => `<option value="${s}" ${p.shape === s ? "selected" : ""}>${SHAPE_LABELS[s]}</option>`).join("")}</select></label>
      <label class="field"><span>Material</span><input name="material" value="${esc(p.material)}"></label>
      <label class="field"><span>Frame colour</span><input name="color" type="color" value="${esc(p.color)}"></label>
      <label class="field"><span>Colour name</span><input name="colorName" value="${esc(p.colorName)}"></label>
      <label class="field"><span>Lens</span><select name="lensType"><option value="clear" ${p.lens === "clear" ? "selected" : ""}>Clear (optical)</option><option value="tint" ${p.lens !== "clear" ? "selected" : ""}>Tinted (sunglasses)</option></select></label>
      <label class="field"><span>Tint colour</span><input name="tint" type="color" value="${p.lens !== "clear" ? esc(p.lens) : "#2f3b45"}"></label>
      <label class="field"><span>Price from (₹)</span><input name="price" type="number" min="0" step="10" value="${p.price}"></label>
      <label class="field"><span>Badge</span><input name="badge" value="${esc(p.badge || "")}" placeholder="e.g. New, Bestseller"></label>
      <label class="field full"><span>Style tags (comma separated)</span><input name="style" value="${esc((p.style || []).join(", "))}" placeholder="classic, minimal, bold, vintage, sporty"></label>
      <label class="field full"><span>Description</span><textarea name="desc">${esc(p.desc)}</textarea></label>
      <div class="field"><span>Product photo</span><div class="upload-zone" id="upP"><input type="file" accept="image/*" hidden>Upload photo<div class="up-preview">${photo ? `<img src="${photo}">` : ""}</div></div><button type="button" class="chip" id="rmP" style="margin-top:6px">Remove photo</button></div>
      <div class="field"><span>Try-on overlay (transparent PNG, front view)</span><div class="upload-zone" id="upT"><input type="file" accept="image/png" hidden>Upload PNG<div class="up-preview">${tryon ? `<img src="${tryon}">` : ""}</div></div><button type="button" class="chip" id="rmT" style="margin-top:6px">Remove overlay</button></div>
      <div class="full notice">Try-on PNG tips: front-facing frame only, transparent background, cropped tightly to the frame's outer edges (temples to temples), the lens centres level with the image's vertical middle.</div>
      <div class="full"><span class="p-cat">Live preview</span><div id="pv" style="background:#fff;border:1px solid var(--line);padding:10px;max-width:360px"></div></div>
    </div>`, async form => {
      const f = new FormData(form);
      const out = {
        id: (f.get("id") || "").trim() || p.id, name: f.get("name").trim(), cats: f.getAll("cats"), shape: f.get("shape"), material: f.get("material").trim(),
        color: f.get("color"), colorName: f.get("colorName").trim(), lens: f.get("lensType") === "clear" ? "clear" : f.get("tint"), price: +f.get("price") || 0,
        badge: f.get("badge").trim(), style: f.get("style").split(",").map(s => s.trim().toLowerCase()).filter(Boolean), desc: f.get("desc").trim()
      };
      if (!out.name) { alert("Please enter a name."); return false; }
      if (!out.cats.length) out.cats = ["prescription"];
      if (photo) out.photo = photo; if (tryon) out.tryonImg = tryon;
      const list = getProducts().slice();
      if (isNew && list.some(x => x.id === out.id)) { alert("That code is already used."); return false; }
      const i = list.findIndex(x => x.id === p.id); if (i >= 0) list[i] = out; else list.unshift(out);
      if (!saveProducts(list)) return false; render(); toast("Product saved");
    });
    const form = $("form", bg);
    const preview = () => { const f = new FormData(form); $("#pv", bg).innerHTML = photo ? `<img src="${photo}" style="max-height:140px;margin:auto">` : frameSVG({ ...p, shape: f.get("shape"), material: f.get("material"), color: f.get("color"), lens: f.get("lensType") === "clear" ? "clear" : f.get("tint") }); };
    form.addEventListener("input", preview); preview();
    const up = (id, max, cb) => { const z = $(id, bg), i = $("input", z); z.onclick = e => { if (e.target !== i) i.click(); }; i.onchange = async () => { const fl = i.files[0]; if (!fl) return; const url = await fileToDataURL(fl, max, .85); cb(url); $(".up-preview", z).innerHTML = `<img src="${url}">`; preview(); }; };
    up("#upP", 900, u => photo = u); up("#upT", 900, u => tryon = u);
    $("#rmP", bg).onclick = () => { photo = ""; $("#upP .up-preview", bg).innerHTML = ""; preview(); };
    $("#rmT", bg).onclick = () => { tryon = ""; $("#upT .up-preview", bg).innerHTML = ""; };
  }

  V.collections = () => `<div class="toolbar"><h2 style="margin:0;flex:1">Collections</h2><button class="btn btn-outline btn-sm" id="resetC">Restore defaults</button></div>
    <table class="table"><thead><tr><th>ID</th><th>Name</th><th>Short name</th><th>Description</th><th>Products</th><th></th></tr></thead><tbody>${getCollections().map(c => `<tr><td>${esc(c.id)}</td><td>${esc(c.name)}</td><td>${esc(c.short)}</td><td style="max-width:340px">${esc(c.blurb)}</td><td>${getProducts().filter(p => p.cats.includes(c.id)).length}</td><td class="tbl-actions"><button data-c="${c.id}">Edit</button></td></tr>`).join("")}</tbody></table>`;
  function bindCollections() {
    $("#resetC").onclick = () => { localStorage.removeItem("oc_collections"); render(); };
    $$("[data-c]").forEach(b => b.onclick = () => {
      const list = getCollections().map(c => ({ ...c })); const c = list.find(x => x.id === b.dataset.c);
      modal("Edit collection", `<div class="form-grid"><label class="field"><span>Name</span><input name="name" value="${esc(c.name)}"></label><label class="field"><span>Short name</span><input name="short" value="${esc(c.short)}"></label><label class="field full"><span>Description</span><textarea name="blurb">${esc(c.blurb)}</textarea></label><label class="field"><span>Accent colour</span><input type="color" name="tone" value="${esc(c.tone)}"></label></div>`, form => {
        const f = Object.fromEntries(new FormData(form)); Object.assign(c, f); DB.set("collections", list); render(); toast("Collection saved");
      });
    });
  }

  function listView(key, title, cols, statuses) {
    const items = DB.get(key, []);
    return `<div class="toolbar"><h2 style="margin:0;flex:1">${title}</h2><select id="fs"><option value="">All statuses</option>${statuses.map(s => `<option>${s}</option>`).join("")}</select><button class="btn btn-outline btn-sm" id="csv">${ICONS.download} Export CSV</button></div>
      ${items.length ? `<table class="table"><thead><tr>${cols.map(c => `<th>${c[0]}</th>`).join("")}<th>Status</th><th></th></tr></thead><tbody>${items.map(x => `<tr data-s="${esc(x.status)}">${cols.map(c => `<td>${c[1](x)}</td>`).join("")}<td><select data-st="${x.id}">${statuses.map(s => `<option ${x.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></td><td class="tbl-actions"><button data-view="${x.id}">View</button><a target="_blank" rel="noopener" href="${waLink(`Hello ${x.name || ""}, this is ${STORE.name} regarding your ${(x.type || "eye test").toLowerCase()} request (ref ${x.id}).`, "91" + String(x.phone || "").replace(/\D/g, "").slice(-10))}">WhatsApp</a><button data-del="${x.id}">Delete</button></td></tr>`).join("")}</tbody></table>` : `<p class="muted">Nothing here yet. Submissions from the website forms appear here (in this browser).</p>`}`;
  }
  function bindList(key) {
    const items = () => DB.get(key, []);
    $("#fs").onchange = e => $$("tr[data-s]").forEach(r => r.style.display = !e.target.value || r.dataset.s === e.target.value ? "" : "none");
    $$("[data-st]").forEach(s => s.onchange = () => { const l = items(); l.find(x => x.id === s.dataset.st).status = s.value; DB.set(key, l); toast("Status updated"); shellCounts(); });
    $$("[data-del]").forEach(b => b.onclick = () => { if (confirm("Delete this record?")) { DB.set(key, items().filter(x => x.id !== b.dataset.del)); render(); } });
    $$("[data-view]").forEach(b => b.onclick = () => { const x = items().find(i => i.id === b.dataset.view); modal("Details", `<table class="spec-table">${Object.entries(x).filter(([k]) => k !== "photo").map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(Array.isArray(v) ? v.join(", ") : v)}</td></tr>`).join("")}</table>${x.photo ? `<img src="${x.photo}" style="max-height:300px;border:1px solid var(--line)">` : ""}`); });
    $("#csv").onclick = () => {
      const l = items(); if (!l.length) return; const keys = [...new Set(l.flatMap(o => Object.keys(o)))].filter(k => k !== "photo");
      const csv = [keys.join(","), ...l.map(o => keys.map(k => `"${String(o[k] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = `opticare-${key}-${isoDate(new Date())}.csv`; a.click();
    };
  }
  const shellCounts = () => { const v = view; render(); view = v; };

  V.enquiries = () => listView("enquiries", "Enquiries", [["Received", x => when(x.createdAt)], ["Type", x => `<b>${esc(x.type)}</b>`], ["Name", x => esc(x.name)], ["Phone", x => `<a href="tel:${esc(x.phone)}">${esc(x.phone)}</a>`], ["Details", x => `<small>${esc(x.message || x.details || x.problem || x.need || x.lens || x.deliveryType || "").slice(0, 80)}</small>${x.photo ? " 📎" : ""}`]], ["New", "In progress", "Resolved", "Cancelled"]);
  V.appointments = () => listView("appointments", "Eye-test appointments", [["Date", x => `<b>${fmtDate(x.date)}</b><br><small>${fmtTime(x.time)}</small>`], ["Name", x => esc(x.name)], ["Phone", x => `<a href="tel:${esc(x.phone)}">${esc(x.phone)}</a>`], ["For", x => esc(x.reason)]], ["Requested", "Confirmed", "Completed", "Cancelled"]);

  V.reviews = () => {
    const rs = DB.get("reviews", []);
    return `<div class="toolbar"><h2 style="margin:0;flex:1">Reviews</h2><button class="btn btn-dark btn-sm" id="addR">${ICONS.plus} Add a Google review</button><button class="btn btn-outline btn-sm" id="addPh">${ICONS.upload} Customer photo</button></div>
      <p class="muted">Only publish reviews you have permission to show. Website feedback arrives here hidden until you publish it.</p>
      ${rs.length ? `<table class="table"><thead><tr><th>Name</th><th>Rating</th><th>Review</th><th>Consent</th><th>Status</th><th></th></tr></thead><tbody>${rs.map(r => `<tr><td><b>${esc(r.name)}</b><br><small class="muted">${esc(r.place || "")}</small></td><td class="stars">${starStr(r.rating)}</td><td style="max-width:360px"><small>${esc(r.text)}</small></td><td>${r.consent ? "Yes" : "No"}</td><td>${pill(r.published ? "Published" : "Hidden")}</td><td class="tbl-actions"><button data-pub="${r.id}">${r.published ? "Hide" : "Publish"}</button><button data-rd="${r.id}">Delete</button></td></tr>`).join("")}</tbody></table>` : `<p class="muted">No reviews yet.</p>`}
      <h4 style="margin-top:30px">Customer photos (${DB.get("customerPhotos", []).length})</h4><div class="grid g4">${DB.get("customerPhotos", []).map(ph => `<div><img src="${ph.src}" style="aspect-ratio:1;object-fit:cover;border:1px solid var(--line)"><button class="chip" data-phd="${ph.id}" style="margin-top:6px">Remove</button></div>`).join("")}</div>`;
  };
  function bindReviews() {
    const rs = () => DB.get("reviews", []);
    $$("[data-pub]").forEach(b => b.onclick = () => { const l = rs(); const r = l.find(x => x.id === b.dataset.pub); r.published = !r.published; DB.set("reviews", l); render(); });
    $$("[data-rd]").forEach(b => b.onclick = () => { if (confirm("Delete review?")) { DB.set("reviews", rs().filter(x => x.id !== b.dataset.rd)); render(); } });
    $$("[data-phd]").forEach(b => b.onclick = () => { DB.set("customerPhotos", DB.get("customerPhotos", []).filter(x => x.id !== b.dataset.phd)); render(); });
    $("#addR").onclick = () => modal("Add review", `<div class="form-grid"><label class="field"><span>Name (as on Google)</span><input name="name" required></label><label class="field"><span>Place / source</span><input name="place" value="Google review"></label><label class="field"><span>Rating</span><select name="rating">${[5, 4, 3, 2, 1].map(n => `<option>${n}</option>`).join("")}</select></label><label class="field full"><span>Review text</span><textarea name="text" required></textarea></label><label class="check full"><input type="checkbox" name="consent" required> I have permission to display this review.</label></div>`, form => {
      const f = Object.fromEntries(new FormData(form)); if (!f.name || !f.text || !f.consent) { alert("Name, text and permission are required."); return false; }
      DB.push("reviews", { name: f.name, place: f.place, rating: +f.rating, text: f.text, consent: true, published: true }); render();
    }, "Add & publish");
    $("#addPh").onclick = () => {
      const i = document.createElement("input"); i.type = "file"; i.accept = "image/*";
      i.onchange = async () => { const f = i.files[0]; if (!f) return; if (!confirm("Confirm the customer has given permission to feature this photo.")) return; const src = await fileToDataURL(f, 700, .8); const l = DB.get("customerPhotos", []); l.unshift({ id: Date.now().toString(36), src }); if (!DB.set("customerPhotos", l)) alert("Storage full."); render(); };
      i.click();
    };
  }

  V.store = () => {
    const s = STORE;
    return `<h2>Store information</h2><p class="muted">Changes apply across the website (in this browser). For the public site, also update <code>assets/js/data.js</code> — see README.</p>
    <form id="sf" class="form-grid" style="max-width:820px">
      <label class="field"><span>Phone (display)</span><input name="phone" value="${esc(s.phone)}"></label>
      <label class="field"><span>Phone (digits, with 91)</span><input name="phoneRaw" value="${esc(s.phoneRaw)}"></label>
      <label class="field"><span>WhatsApp (digits, with 91)</span><input name="whatsappRaw" value="${esc(s.whatsappRaw)}"></label>
      <label class="field"><span>Email</span><input name="email" value="${esc(s.email)}"></label>
      <label class="field full"><span>Announcement bar</span><input name="announcement" value="${esc(s.announcement)}"></label>
      <label class="field full"><span>Google reviews link</span><input name="googleReviewUrl" value="${esc(s.googleReviewUrl)}"></label>
      <label class="field"><span>Rating</span><input name="rating" type="number" step=".1" min="0" max="5" value="${s.rating}"></label>
      <label class="field"><span>Review count</span><input name="reviewCount" type="number" value="${s.reviewCount}"></label>
      <div class="field full"><span>Opening hours</span><table class="table">${[1, 2, 3, 4, 5, 6, 0].map(d => `<tr><td>${DAYS[d]}</td><td><label class="check"><input type="checkbox" name="open${d}" ${s.hours[d] ? "checked" : ""}> Open</label></td><td><input type="time" name="from${d}" value="${s.hours[d] ? s.hours[d][0] : "09:30"}"></td><td><input type="time" name="to${d}" value="${s.hours[d] ? s.hours[d][1] : "20:30"}"></td></tr>`).join("")}</table></div>
      <div class="full btn-row"><button class="btn btn-dark">Save store info</button><button type="button" class="btn btn-outline" id="resetS">Restore defaults</button></div></form>`;
  };
  function bindStore() {
    $("#sf").onsubmit = e => {
      e.preventDefault(); const f = new FormData(e.target); const hours = {};
      for (let d = 0; d < 7; d++) hours[d] = f.get("open" + d) ? [f.get("from" + d), f.get("to" + d)] : null;
      const o = { phone: f.get("phone"), phoneRaw: f.get("phoneRaw").replace(/\D/g, ""), whatsappRaw: f.get("whatsappRaw").replace(/\D/g, ""), email: f.get("email"), announcement: f.get("announcement"), googleReviewUrl: f.get("googleReviewUrl"), rating: +f.get("rating"), reviewCount: +f.get("reviewCount"), hours };
      DB.set("store", o); Object.assign(STORE, o); toast("Store info saved"); setTimeout(() => location.reload(), 600);
    };
    $("#resetS").onclick = () => { localStorage.removeItem("oc_store"); location.reload(); };
  }

  V.analytics = () => {
    const a = DB.get("analytics", { views: {}, events: {}, products: {}, days: {} });
    const bars = (obj, label = k => k) => { const e = Object.entries(obj).sort((x, y) => y[1] - x[1]).slice(0, 10); const m = Math.max(1, ...e.map(x => x[1])); return e.length ? e.map(([k, v]) => `<div class="bar-row"><span>${esc(label(k))}</span><div class="bar"><i style="width:${v / m * 100}%"></i></div><b>${v}</b></div>`).join("") : `<p class="muted">No data yet.</p>`; };
    const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push([isoDate(d).slice(5), a.days[isoDate(d)] || 0]); }
    const m = Math.max(1, ...days.map(d => d[1]));
    return `<h2>Analytics</h2><div class="notice" style="margin-bottom:22px">These counts are from <b>this browser only</b> (demo). For real visitor analytics, add Google Analytics 4 — set <code>gaId</code> in <code>assets/js/data.js</code> (see README).</div>
      <h4>Page views — last 14 days</h4><div style="display:flex;align-items:flex-end;gap:6px;height:140px;border-bottom:1px solid var(--line);margin-bottom:6px">${days.map(([d, v]) => `<div title="${d}: ${v}" style="flex:1;background:var(--gold);height:${v / m * 100}%;min-height:2px"></div>`).join("")}</div><div style="display:flex;justify-content:space-between;font-size:11px" class="muted"><span>${days[0][0]}</span><span>${days[13][0]}</span></div>
      <div class="grid g2" style="margin-top:30px"><div><h4>Pages</h4>${bars(a.views)}</div><div><h4>Actions</h4>${bars(a.events, k => k.replace(/_/g, " "))}</div><div><h4>Most viewed products</h4>${bars(a.products, k => (getProducts().find(p => p.id === k) || { name: k }).name)}</div></div>`;
  };

  function render() {
    if (!authed()) return login();
    shell(); $("#am").innerHTML = V[view](); hydrateIcons($("#am"));
    ({ products: bindProducts, collections: bindCollections, enquiries: () => bindList("enquiries"), appointments: () => bindList("appointments"), reviews: bindReviews, store: bindStore }[view] || (() => { }))();
  }
  document.addEventListener("DOMContentLoaded", render);
})();
