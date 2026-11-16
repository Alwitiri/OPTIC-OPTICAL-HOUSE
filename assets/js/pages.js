/* ==========================================================
   Page logic — home, collections (frame finder), product,
   lenses, eye testing (booking), services, reviews, contact
   ========================================================== */
(function () {
  const page = document.body.dataset.page;
  const R = () => window.rescanReveal && window.rescanReveal();

  /* Downscale an image file to a JPEG data URL (keeps localStorage small) */
  window.fileToDataURL = (file, max = 640, q = .82) => new Promise((res, rej) => {
    if (!file) return res("");
    const fr = new FileReader();
    fr.onload = () => {
      if (file.type === "image/png" && max === 0) return res(fr.result);
      const img = new Image();
      img.onload = () => { const s = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", q)); };
      img.onerror = rej; img.src = fr.result;
    };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
  const bindUpload = (zone) => {
    if (!zone) return;
    const input = zone.querySelector("input[type=file]");
    zone.addEventListener("click", e => { if (e.target !== input) input.click(); });
    input.addEventListener("change", async () => {
      const f = input.files[0]; if (!f) return;
      if (!/^image\//.test(f.type)) { toast("Please choose an image file."); input.value = ""; return; }
      zone.dataset.img = await fileToDataURL(f, 480, .75);
      zone.querySelector(".up-preview").innerHTML = `<img src="${zone.dataset.img}" alt="Selected image preview">`;
    });
  };

  /* ---------------- HOME ---------------- */
  const imgTag = (id, w, ratio, alt = "", cls = "") => `<img class="${cls}" src="${U(id, w, ratio ? Math.round(w * ratio) : 0)}" srcset="${USET(id, ratio)}" sizes="(max-width: 900px) 100vw, 50vw" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  function home() {
    const prods = getProducts();
    // Hero
    const hero = $("#heroImg"); hero.src = U(IMG.hero, 1800); hero.srcset = USET(IMG.hero); hero.sizes = "100vw";
    const featured = ["oc-103", "oc-104", "oc-109", "oc-119", "oc-101"].map(id => prods.find(p => p.id === id)).filter(Boolean);
    const cycle = featured.length ? featured : prods.slice(0, 4);
    let gi = 0;
    $("#gcDots").innerHTML = cycle.map(() => "<i></i>").join("");
    const showCard = () => {
      const p = cycle[gi % cycle.length]; const media = $("#gcMedia");
      const old = media.querySelector("img"); if (old) { old.classList.add("out"); setTimeout(() => old.remove(), 600); }
      media.insertAdjacentHTML("beforeend", p.img ? `<img src="${U(p.img, 600, 450)}" alt="${esc(p.name)}">` : productThumb(p, 600));
      $("#gcName").textContent = p.name; $("#gcCat").textContent = `${SHAPE_LABELS[p.shape]} · ${rupee(p.price)}`;
      $("#gcLink").href = `product.html?id=${encodeURIComponent(p.id)}`;
      $$("#gcDots i").forEach((d, i) => d.classList.toggle("on", i === gi % cycle.length)); gi++;
    };
    showCard(); setInterval(showCard, 4500);
    const st = openStatus();
    $("#hxCount").textContent = prods.length + "+";
    $("#hxOpen").textContent = st.open ? "Open" : "Closed";
    $("#hxOpenSub").innerHTML = esc(st.text.replace(/^(Open now|Closed) · /, "")).replace(/ (\d)/, "<br>$1");
    const words = ["Spectacle frames", "Sunglasses", "Eye testing", "Contact lenses", "Quick repairs", "Progressive lenses", "Kids' eyewear", "Virtual try-on", "Commercial Road · Ooty"];
    $("#strip").innerHTML = [...words, ...words].map(w => `<span>${w}</span>`).join("");

    // Bento collections
    const cats = getCollections();
    // [collection, class, image, h/w ratio of tile, face-aware crop]
    const tiles = [["women", "b-women", IMG.women2, 1.15, true], ["men", "b-men", IMG.men, .56, true], ["sunglasses", "b-sun", IMG.sun2, .62, true], ["kids", "b-kids", IMG.kids, .9, true], ["premium", "b-premium", IMG.premium, .55, false], ["prescription", "b-rx", IMG.prescription, .7, false]];
    const tileImg = (id, ratio, faces, alt) => { const src = w => `${U(id, w, Math.round(w * ratio))}${faces ? "&crop=faces,center" : ""}`; return `<img src="${src(1000)}" srcset="${[500, 800, 1200, 1600].map(w => `${src(w)} ${w}w`).join(", ")}" sizes="(max-width: 900px) 100vw, 60vw" alt="${esc(alt)}" loading="lazy" decoding="async">`; };
    $("#bento").innerHTML = tiles.map(([id, cls, img, ratio, faces], i) => {
      const c = cats.find(x => x.id === id) || { short: id, blurb: "" };
      const n = prods.filter(p => p.cats.includes(id)).length;
      return `<a class="tile ${cls} reveal reveal-d${i % 3}" href="collections.html?c=${id}" data-cursor="Explore">${tileImg(img, ratio, faces, c.name)}<span class="t-num">0${i + 1}</span><span class="t-count">${n} styles</span><div class="t-info"><div><h3>${esc(c.short)}</h3><p>${esc(c.blurb)}</p></div><span class="t-go">${ICONS.arrow}</span></div></a>`;
    }).join("");

    // Collage


    // Face-shape finder
    const FACES = [
      { id: "oval", name: "Oval", sub: "Balanced proportions", path: '<ellipse cx="32" cy="33" rx="17" ry="24"/>', shapes: ["rectangle", "square", "aviator", "geometric", "cateye", "round"], tip: "Lucky you — most styles suit an oval face. Go bold with a strong square or keep it classic with an aviator." },
      { id: "round", name: "Round", sub: "Soft, full cheeks", path: '<circle cx="32" cy="33" r="21"/>', shapes: ["rectangle", "square", "wayfarer", "browline", "geometric"], tip: "Angular frames add definition. Rectangles, browlines and wayfarers sharpen and lengthen the face." },
      { id: "square", name: "Square", sub: "Strong jawline", path: '<path d="M14 15 Q14 11 18 11 H46 Q50 11 50 15 V45 Q50 55 40 56 H24 Q14 55 14 45 Z"/>', shapes: ["round", "oval", "aviator", "cateye"], tip: "Curves soften strong angles. Round, oval and cat-eye frames balance a defined jaw beautifully." },
      { id: "heart", name: "Heart", sub: "Wider forehead", path: '<path d="M12 18 Q12 10 22 10 H42 Q52 10 52 18 Q52 36 32 57 Q12 36 12 18 Z"/>', shapes: ["oval", "round", "aviator", "cateye"], tip: "Lighter, rounder frames and aviators balance a wider forehead with a narrower chin." }
    ];
    let face = FACES[0];
    const renderFace = () => {
      $("#faceTabs").innerHTML = FACES.map(f => `<button class="face-tab ${f.id === face.id ? "on" : ""}" role="tab" aria-selected="${f.id === face.id}" data-f="${f.id}"><svg class="face" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6">${f.path}<circle cx="25" cy="30" r="1.6" fill="currentColor"/><circle cx="39" cy="30" r="1.6" fill="currentColor"/><path d="M27 43 q5 3 10 0" stroke-linecap="round"/></svg><span><b>${f.name}</b><small>${f.sub}</small></span>${ICONS.arrow}</button>`).join("");
      $$("#faceTabs .face-tab").forEach(b => b.onclick = () => { face = FACES.find(f => f.id === b.dataset.f); renderFace(); });
      const picks = prods.filter(p => face.shapes.includes(p.shape)).sort((a, b) => face.shapes.indexOf(a.shape) - face.shapes.indexOf(b.shape));
      const uniq = []; picks.forEach(p => { if (uniq.length < 3 && !uniq.some(u => u.shape === p.shape)) uniq.push(p); }); picks.forEach(p => { if (uniq.length < 3 && !uniq.includes(p)) uniq.push(p); });
      $("#faceResult").innerHTML = `<h3>For ${/^[aeiou]/i.test(face.name) ? "an" : "a"} ${face.name.toLowerCase()} face</h3><p class="tip">${face.tip}</p><div class="shape-chips">${face.shapes.map(s => `<span>${SHAPE_LABELS[s]}</span>`).join("")}</div><div class="face-cards">${uniq.map(p => productCard(p).replace("reveal ", "")).join("")}</div><a class="link-arrow" style="margin-top:26px" href="collections.html#finder">Open the full Frame Finder ${ICONS.arrow}</a>`;
    };
    renderFace();

    // Animated counters
    const cio = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; cio.unobserve(e.target);
      const el = e.target, end = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, suf = el.dataset.suffix || ""; const t0 = performance.now();
      const tick = t => { const k = Math.min(1, (t - t0) / 1600), v = end * (1 - Math.pow(1 - k, 3)); el.textContent = v.toFixed(dec) + suf; if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), { threshold: .5 }) : null;
    $("#ctFrames").dataset.count = prods.length;
    $$("[data-count]").forEach(el => cio ? cio.observe(el) : (el.textContent = el.dataset.count + (el.dataset.suffix || "")));

    // Featured rail
    const feat = [...prods.filter(p => p.badge), ...prods.filter(p => !p.badge)].slice(0, 12);
    const rail = $("#rail"); rail.innerHTML = feat.map(productCard).join("");
    const bar = $("#railBar");
    const upd = () => { const max = rail.scrollWidth - rail.clientWidth; const w = rail.clientWidth / rail.scrollWidth * 100; bar.style.width = w + "%"; bar.style.left = (max ? rail.scrollLeft / max : 0) * (100 - w) + "%"; };
    rail.addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
    const step = () => (rail.firstElementChild?.getBoundingClientRect().width || 300) + 24;
    $("#railNext").onclick = () => rail.scrollBy({ left: step(), behavior: "smooth" });
    $("#railPrev").onclick = () => rail.scrollBy({ left: -step(), behavior: "smooth" });
    let drag = null, moved = false;
    rail.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") return; drag = { x: e.clientX, s: rail.scrollLeft }; moved = false; });
    addEventListener("pointermove", e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 5) { moved = true; rail.classList.add("dragging"); } rail.scrollLeft = drag.s - dx; });
    addEventListener("pointerup", () => { if (drag) { drag = null; setTimeout(() => rail.classList.remove("dragging"), 0); } });
    rail.addEventListener("click", e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    // Try-on device
    $("#devImg").src = U(IMG.tryModel, 700, 1400);
    $("#devFrames").innerHTML = ["oc-101", "oc-103", "oc-104"].map((id, i) => { const p = prods.find(x => x.id === id) || prods[i]; return `<span class="${i === 1 ? "on" : ""}">${p.img ? `<img src="${U(p.img, 120, 90)}" alt="">` : ""}</span>`; }).join("");

    // Services rows with hover image
    const svcImg = { "eye-test": IMG.eyeChart, repairs: IMG.detail, fast: IMG.store, contacts: IMG.contacts, styling: IMG.women2, delivery: IMG.rack };
    const svcHref = { "eye-test": "eye-testing.html", repairs: "services.html#repair", fast: "services.html#prescription", contacts: "lenses.html#contacts", styling: "try-on.html", delivery: "services.html#delivery" };
    $("#svcRows").innerHTML = SERVICES.map((s, i) => `<a class="svc-row" href="${svcHref[s.id] || "services.html"}" data-img="${svcImg[s.id] || IMG.store}"><span class="n">0${i + 1}</span><h4>${esc(s.name)}</h4><p>${esc(s.desc)}</p><span class="go">${ICONS.arrow}</span></a>`).join("");
    const hi = $("#hoverImg"), hiImg = hi.querySelector("img");
    let hx = 0, hy = 0, cx = 0, cy = 0, raf = 0;
    const follow = () => { cx += (hx - cx) * .14; cy += (hy - cy) * .14; hi.style.left = cx + "px"; hi.style.top = cy + "px"; raf = requestAnimationFrame(follow); };
    $$("#svcRows .svc-row").forEach(r => {
      r.addEventListener("mouseenter", e => { hiImg.src = U(r.dataset.img, 600, 760); hx = cx = e.clientX; hy = cy = e.clientY; hi.classList.add("on"); cancelAnimationFrame(raf); follow(); });
      r.addEventListener("mousemove", e => { hx = e.clientX + 170; hy = e.clientY; });
      r.addEventListener("mouseleave", () => { hi.classList.remove("on"); cancelAnimationFrame(raf); });
    });
    SERVICES.forEach(s => { const im = new Image(); im.src = U(svcImg[s.id] || IMG.store, 600, 760); });

    // Lookbook
    const looks = [[IMG.women, "Round · Classic"], [IMG.men, "Rectangle · Everyday"], [IMG.sun, "Aviator · Silver"], [IMG.heroAlt, "Bold · Statement"], [IMG.kids2, "Kids · Flexible"], [IMG.men2, "Clear · Minimal"], [IMG.women2, "Office · Refined"], [IMG.detail2, "Gold · Wood"], [IMG.portrait, "Black · Iconic"], [IMG.kids, "Kids · Colour"]];
    $("#lookbook").innerHTML = [...looks, ...looks].map(([id, t]) => `<figure class="lb-item" style="margin:0">${`<img src="${U(id, 480, 640)}" alt="${esc(t)} eyewear style" loading="lazy">`}<span>${esc(t)}</span></figure>`).join("");

    // Statements (themes from reviews)
    const real = getReviews();
    const statements = real.length ? real.slice(0, 5).map(r => ({ q: r.text, m: `${r.name} · ${r.place || "Google review"}` }))
      : [{ q: "A wide collection of spectacle frames and sunglasses to choose from.", m: "Recurring theme in Google reviews" }, { q: "Prescription glasses ready within about five hours — for a traveller.", m: "Reported by a visiting customer" }, { q: "Helpful, professional staff — and quick repairs when it's urgent.", m: "Recurring theme in Google reviews" }, { q: "Good product quality at reasonable prices.", m: "Recurring theme in Google reviews" }];
    $("#statement").innerHTML = statements.map((s, i) => `<div class="st-item ${i ? "" : "on"}"><q>${esc(s.q)}</q><div class="st-meta">${esc(s.m)}</div></div>`).join("");
    $("#stDots").innerHTML = statements.map((_, i) => `<button class="${i ? "" : "on"}" aria-label="Show statement ${i + 1}"></button>`).join("");
    let si = 0; const showSt = i => { si = i; $$("#statement .st-item").forEach((e, j) => e.classList.toggle("on", j === i)); $$("#stDots button").forEach((e, j) => e.classList.toggle("on", j === i)); };
    $$("#stDots button").forEach((b, i) => b.onclick = () => showSt(i));
    setInterval(() => showSt((si + 1) % statements.length), 5500);
    $("#gBadge").href = STORE.googleReviewUrl;

    // Visit band
    $("#bandImg").src = U(IMG.train, 1800);
    const pill = $("#visitPill"); pill.className = "open-pill " + (st.open ? "open" : "closed"); pill.innerHTML = `<i></i>${esc(st.text)}`;
    const h = STORE.hours[new Date().getDay()];
    $("#todayHours").textContent = h ? `${fmtTime(h[0])} – ${fmtTime(h[1])}` : "Closed";
    $("#homeMap").src = mapEmbed();
  }

  window.reviewCard = r => `<div class="review-card reveal"><div class="stars">${starStr(r.rating || 5)}</div><p class="quote">${esc(r.text)}</p><div class="who"><span class="avatar">${esc((r.name || "?")[0])}</span><div><b>${esc(r.name)}</b>${esc(r.place || "Google review")}</div></div></div>`;
  window.themeCard = t => `<div class="review-card reveal"><div class="f-icon" style="width:46px;height:46px;border-radius:50%;background:var(--beige);color:var(--gold-deep);display:grid;place-items:center">${ICONS[t.icon]}</div><h4 style="margin:0">${esc(t.title)}</h4><p style="color:var(--ink-2);margin:0">${esc(t.text)}</p><div class="who"><span class="stars">★★★★★</span>Theme from public Google reviews</div></div>`;

  /* ---------------- COLLECTIONS / FRAME FINDER ---------------- */
  function collections() {
    const prods = getProducts(), cats = getCollections();
    const F = { cat: qs("c") || "", shape: new Set(), material: new Set(), style: new Set(), type: "", max: 0, q: qs("q") || "", sort: "featured", face: "" };
    const maxPrice = Math.ceil(Math.max(...prods.map(p => p.price)) / 500) * 500; F.max = maxPrice;
    const FACE = { oval: ["rectangle", "square", "wayfarer", "aviator", "geometric", "round", "cateye", "browline", "oval"], round: ["rectangle", "square", "wayfarer", "geometric", "browline"], square: ["round", "oval", "aviator", "cateye"], heart: ["oval", "round", "aviator", "cateye"], long: ["square", "wayfarer", "browline", "round"] };
    const mats = [...new Set(prods.map(p => p.material.split(/\s*&\s*/)[0].replace(/Flexible /, "")))];
    const shapes = [...new Set(prods.map(p => p.shape))];
    const styles = [...new Set(prods.flatMap(p => p.style || []))];
    const chip = (grp, val, label, on, extra = "") => `<button class="chip ${on ? "on" : ""}" data-g="${grp}" data-v="${esc(val)}">${extra}${esc(label)}</button>`;

    const renderFilters = () => {
      $("#filters").innerHTML = `
        <div class="filter-group" style="display:flex;justify-content:space-between;align-items:center"><h5 style="margin:0">Frame Finder</h5><button class="chip" id="fReset">Reset</button></div>
        <div class="filter-group"><h5>Collection</h5><div class="chips">${chip("cat", "", "All", !F.cat)}${cats.map(c => chip("cat", c.id, c.short, F.cat === c.id)).join("")}</div></div>
        <div class="filter-group"><h5>Type</h5><div class="chips">${chip("type", "", "All", !F.type)}${chip("type", "optical", "Optical", F.type === "optical")}${chip("type", "sun", "Sunglasses", F.type === "sun")}</div></div>
        <div class="filter-group"><h5>Your face shape <span class="muted" style="letter-spacing:0;text-transform:none;font-weight:500">suggests</span></h5><div class="chips">${chip("face", "", "Any", !F.face)}${Object.keys(FACE).map(f => chip("face", f, f[0].toUpperCase() + f.slice(1), F.face === f)).join("")}</div></div>
        <div class="filter-group"><h5>Shape</h5><div class="chips">${shapes.map(s => chip("shape", s, SHAPE_LABELS[s], F.shape.has(s))).join("")}</div></div>
        <div class="filter-group"><h5>Material</h5><div class="chips">${mats.map(m => chip("material", m, m, F.material.has(m))).join("")}</div></div>
        <div class="filter-group"><h5>Style</h5><div class="chips">${styles.map(s => chip("style", s, s[0].toUpperCase() + s.slice(1), F.style.has(s))).join("")}</div></div>
        <div class="filter-group"><h5>Budget</h5><input type="range" id="fBudget" min="1000" max="${maxPrice}" step="250" value="${F.max}" aria-label="Maximum budget"><div class="range-row"><span>₹1,000</span><b id="fBudgetV">Up to ${rupee(F.max)}</b></div></div>
        <button class="btn btn-dark btn-block filter-toggle" id="fDone">Show results</button>`;
      $$("#filters .chip[data-g]").forEach(b => b.onclick = () => {
        const g = b.dataset.g, v = b.dataset.v;
        if (F[g] instanceof Set) F[g].has(v) ? F[g].delete(v) : F[g].add(v); else F[g] = v;
        if (g === "cat") history.replaceState(null, "", v ? `?c=${v}` : location.pathname);
        renderFilters(); renderGrid();
      });
      $("#fBudget").oninput = e => { F.max = +e.target.value; $("#fBudgetV").textContent = "Up to " + rupee(F.max); renderGrid(); };
      $("#fReset").onclick = () => { Object.assign(F, { cat: "", type: "", face: "", max: maxPrice, q: "" }); F.shape.clear(); F.material.clear(); F.style.clear(); $("#search").value = ""; history.replaceState(null, "", location.pathname); renderFilters(); renderGrid(); };
      $("#fDone").onclick = () => $("#filters").classList.remove("open");
    };
    const renderGrid = () => {
      let list = prods.filter(p =>
        (!F.cat || p.cats.includes(F.cat)) &&
        (!F.type || (F.type === "sun" ? p.lens !== "clear" : p.lens === "clear")) &&
        (!F.face || FACE[F.face].includes(p.shape)) &&
        (!F.shape.size || F.shape.has(p.shape)) &&
        (!F.material.size || [...F.material].some(m => p.material.includes(m))) &&
        (!F.style.size || (p.style || []).some(s => F.style.has(s))) &&
        p.price <= F.max &&
        (!F.q || (p.name + " " + p.colorName + " " + p.material + " " + SHAPE_LABELS[p.shape] + " " + p.cats.join(" ")).toLowerCase().includes(F.q.toLowerCase())));
      if (F.sort === "low") list.sort((a, b) => a.price - b.price);
      if (F.sort === "high") list.sort((a, b) => b.price - a.price);
      if (F.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
      const c = cats.find(x => x.id === F.cat);
      $("#colTitle").textContent = c ? c.name : "All Eyewear";
      const heroKey = { men: "men", women: "women2", kids: "kids2", sunglasses: "sun2", prescription: "prescription", premium: "premium" }[F.cat] || "rack";
      const hImg = $(".page-hero .ph-bg img"); if (hImg && hImg.dataset.k !== heroKey) { hImg.dataset.k = heroKey; hImg.srcset = USET(IMG[heroKey]); hImg.src = U(IMG[heroKey], 1600); }
      $("#colBlurb").textContent = c ? c.blurb : "Spectacle frames, sunglasses and premium eyewear — every frame can be fitted with your prescription.";
      document.title = `${c ? c.name : "Spectacle Frames & Sunglasses"} in Ooty | Opticare Optical House`;
      $("#count").textContent = `${list.length} frame${list.length === 1 ? "" : "s"}`;
      $("#grid").innerHTML = list.length ? list.map(productCard).join("") : `<div class="empty"><h3>No frames match those filters</h3><p>Try widening your budget or removing a filter — or <a class="gold" href="${waLink("Hello Opticare, I'm looking for a frame that I couldn't find online.")}" target="_blank" rel="noopener">ask us on WhatsApp</a>; many more styles are in store.</p></div>`;
      R();
    };
    $("#search").value = F.q;
    $("#search").oninput = e => { F.q = e.target.value; renderGrid(); };
    $("#sort").onchange = e => { F.sort = e.target.value; renderGrid(); };
    $("#openFilters").onclick = () => $("#filters").classList.add("open");
    renderFilters(); renderGrid();
  }

  /* ---------------- PRODUCT ---------------- */
  function product() {
    const prods = getProducts(); const p = prods.find(x => x.id === qs("id"));
    if (!p) { $("#pd").innerHTML = `<div class="empty"><h3>Frame not found</h3><p><a class="link-arrow" href="collections.html">Browse all eyewear</a></p></div>`; return; }
    track("product", p.id);
    const cats = getCollections();
    document.title = `${p.name} – ${SHAPE_LABELS[p.shape]} ${p.lens === "clear" ? "Frame" : "Sunglasses"} in ${p.colorName} | Opticare Ooty`;
    $('meta[name="description"]').setAttribute("content", `${p.name}: ${p.desc} Available at Opticare Optical House, Commercial Road, Ooty.`);
    $("#crumb").textContent = p.name;
    const ld = document.createElement("script"); ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.desc, sku: p.id, color: p.colorName, material: p.material, brand: { "@type": "Brand", name: "Opticare Optical House" }, offers: { "@type": "Offer", priceCurrency: "INR", price: p.price, availability: "https://schema.org/InStoreOnly", seller: { "@type": "Optician", name: STORE.name } } });
    document.head.appendChild(ld);
    const enquire = `Hello ${STORE.shortName}, I'm interested in the "${p.name}" (${p.id}) in ${p.colorName}. Is it available?`;
    $("#pd").innerHTML = `
      <div>
        <div class="pd-media" id="pdMain" data-cursor="Zoom">${p.badge ? `<span class="p-badge gold">${esc(p.badge)}</span>` : ""}${productMedia(p, "front", { ratio: 1, eager: true, sizes: "(max-width: 900px) 100vw, 55vw" })}<div class="zoom-lens"></div></div>
        <div class="pd-views" id="pdViews"></div>
        <p class="muted" style="font-size:12.5px;margin-top:10px">${p.photo || p.img ? "Photography shown is representative of the style; colours may vary slightly in store." : "Illustrative rendering — colours and proportions may vary from the actual frame."} Hover the image to zoom.</p>
      </div>
      <div>
        <span class="eyebrow">${p.cats.map(c => esc((cats.find(x => x.id === c) || {}).short || c)).join(" · ")}</span>
        <h1>${esc(p.name)}</h1>
        <div class="p-meta" style="font-size:15px"><span class="swatch" style="background:${esc(p.color)};width:18px;height:18px"></span>${esc(p.colorName)} · ${esc(p.material)} · ${esc(SHAPE_LABELS[p.shape])}</div>
        <div class="price">From ${rupee(p.price)} <small class="muted" style="font-size:13px;font-weight:500">indicative frame price · lenses extra</small></div>
        <p style="color:var(--ink-2);font-size:16.5px;margin:18px 0 26px">${esc(p.desc)}</p>
        <div class="btn-row" style="margin-bottom:12px"><a class="btn btn-dark" href="try-on.html?frame=${encodeURIComponent(p.id)}">${ICONS.camera} Try On With Camera</a><a class="btn btn-wa" href="${waLink(enquire)}" target="_blank" rel="noopener" id="waEnq">${ICONS.whatsapp} Check Availability</a></div>
        <div class="btn-row"><a class="btn btn-outline btn-sm" href="services.html?frame=${encodeURIComponent(p.id)}#prescription">Order with my prescription</a><a class="btn btn-outline btn-sm" href="appointment.html">Book an eye test</a></div>
        <table class="spec-table">
          <tr><th>Frame code</th><td>${esc(p.id.toUpperCase())}</td></tr>
          <tr><th>Shape</th><td>${esc(SHAPE_LABELS[p.shape])}</td></tr>
          <tr><th>Material</th><td>${esc(p.material)}</td></tr>
          <tr><th>Colour</th><td>${esc(p.colorName)}</td></tr>
          <tr><th>Lens</th><td>${p.lens === "clear" ? "Demo lens — fit with your prescription" : "Tinted UV-protective lens (prescription option on request)"}</td></tr>
          <tr><th>Style</th><td>${(p.style || []).map(s => s[0].toUpperCase() + s.slice(1)).join(", ")}</td></tr>
        </table>
        <div class="notice">Prices are indicative and may change. Lens options (single-vision, progressive, blue-light filtering, photochromic) are priced separately — <a class="gold" href="lenses.html">see lenses</a>.</div>
      </div>`;
    $("#waEnq").addEventListener("click", () => track("whatsapp_product"));
    // Gallery: full shot, two detail crops, try-on outline
    const main = $("#pdMain"), lens = $(".zoom-lens", main);
    const crop = (x, y, z, w = 1200) => `${UNS}${p.img}?auto=format&fit=crop&w=${w}&h=${w}&crop=focalpoint&fp-x=${x}&fp-y=${y}&fp-z=${z}&q=75`;
    const views = p.photo ? [{ t: "Photo", src: p.photo, big: p.photo }] : p.img ? [
      { t: "Full", src: U(p.img, 300, 300), big: U(p.img, 1200, 1200) },
      { t: "Lens", src: crop(.35, .5, 1.8, 300), big: crop(.35, .5, 1.8) },
      { t: "Bridge", src: crop(.5, .45, 2.2, 300), big: crop(.5, .45, 2.2) }
    ] : [];
    $("#pdViews").innerHTML = views.map((v, i) => `<button class="${i ? "" : "on"}" data-big="${v.big}" aria-label="${v.t} view"><img src="${v.src}" alt=""><span>${v.t}</span></button>`).join("") + `<button data-outline="1" aria-label="Try-on outline">${frameSVG(p, { label: false })}<span>Try-on</span></button>`;
    $$("#pdViews button").forEach(b => b.onclick = () => {
      if (b.dataset.outline) { location.href = `try-on.html?frame=${encodeURIComponent(p.id)}`; return; }
      $$("#pdViews button").forEach(x => x.classList.toggle("on", x === b));
      const im = $("img.p-photo", main); if (im) { im.removeAttribute("srcset"); im.src = b.dataset.big; }
      lens.style.backgroundImage = `url("${b.dataset.big}")`;
    });
    if (views[0]) lens.style.backgroundImage = `url("${views[0].big}")`;
    main.addEventListener("mousemove", e => { const r = main.getBoundingClientRect(); lens.style.backgroundPosition = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`; });
    if (!views.length) lens.remove();
    const rel = prods.filter(x => x.id !== p.id && (x.shape === p.shape || x.cats.some(c => p.cats.includes(c)))).slice(0, 4);
    $("#related").innerHTML = rel.map(productCard).join(""); R();
  }

  /* ---------------- LENSES ---------------- */
  function lenses() {
    const vis = (id) => {
      const g = { single: "#DCE8EF", progressive: "url(#pg)", bluelight: "#CFE0F5", photochromic: "url(#ph)", contacts: "#E3EEF3", "sun-rx": "#3A4A3A" }[id];
      if (id === "contacts") return `<svg viewBox="0 0 120 80" width="140"><ellipse cx="60" cy="46" rx="46" ry="22" fill="#E8F1F5" stroke="#B8975A"/><path d="M14 46 Q60 6 106 46" fill="none" stroke="#9AB4C2" stroke-width="2"/><path d="M30 38 Q50 22 70 24" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
      return `<svg viewBox="0 0 120 80" width="140"><defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8F0F4"/><stop offset=".55" stop-color="#D9E6EE"/><stop offset="1" stop-color="#C5D7E3"/></linearGradient><linearGradient id="ph" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8F0F4"/><stop offset="1" stop-color="#5A5145"/></linearGradient></defs><ellipse cx="60" cy="40" rx="50" ry="34" fill="${g}" stroke="#B8975A" stroke-width="1.4"/>${id === "bluelight" ? '<path d="M18 40 Q 40 20 60 40 T 102 40" stroke="#6C8FD0" stroke-width="2" fill="none"/>' : ""}${id === "progressive" ? '<text x="60" y="22" font-size="8" text-anchor="middle" fill="#57524B">FAR</text><text x="60" y="44" font-size="8" text-anchor="middle" fill="#57524B">MID</text><text x="60" y="64" font-size="8" text-anchor="middle" fill="#57524B">NEAR</text>' : ""}<path d="M26 28 Q40 14 62 16" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/></svg>`;
    };
    $("#lensGrid").innerHTML = LENSES.map((l, i) => `<article class="lens-card reveal reveal-d${i % 3}" id="${l.id}"><div class="lens-vis">${vis(l.id)}</div><span class="tag">${esc(l.tag)}</span><h3 style="margin:6px 0 0">${esc(l.name)}</h3><p style="color:var(--ink-2);margin:0">${esc(l.desc)}</p><ul>${l.points.map(x => `<li>${esc(x)}</li>`).join("")}</ul><a class="link-arrow" style="margin-top:14px;align-self:flex-start" href="${waLink(`Hello ${STORE.shortName}, I'd like to know more about ${l.name}.`)}" target="_blank" rel="noopener">Ask about ${esc(l.name.split(" ")[0])} ${ICONS.arrow}</a></article>`).join("");
    $("#lensFaq").innerHTML = faqHTML(FAQS.slice(1, 4)); initAccordions($("#lensFaq"));
    lensConsultForm();
  }
  function lensConsultForm() {
    const f = $("#consultForm"); if (!f) return;
    f.onsubmit = e => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(f));
      if (!validPhone(d.phone)) return msg(f, "Please enter a valid 10-digit mobile number.", true);
      submitEnquiry("Lens consultation", d); f.reset(); msg(f, "Thank you! We've saved your request and opened WhatsApp so you can send it to us.");
    };
  }
  const msg = (form, text, err) => { let m = form.querySelector(".form-msg"); if (!m) { m = document.createElement("div"); form.appendChild(m); } m.className = "form-msg " + (err ? "err" : "ok"); m.textContent = text; };

  /* ---------------- EYE TESTING (booking) ---------------- */
  function eyeTesting() {
    if ($("#etBandImg")) $("#etBandImg").src = U(IMG.wallGold, 1800);
    if ($("#etFaq")) { $("#etFaq").innerHTML = faqHTML([FAQS[0], FAQS[1], FAQS[4]]); initAccordions($("#etFaq")); }
    if (!$("#bookForm")) return;
    const form = $("#bookForm"), dateIn = $("#bDate"), slotsEl = $("#slots"); let sel = "";
    const today = new Date(), max = new Date(); max.setDate(today.getDate() + 30);
    dateIn.min = isoDate(today); dateIn.max = isoDate(max);
    const firstOpen = () => { for (let i = 0; i < 14; i++) { const d = new Date(); d.setDate(d.getDate() + i); if (getSlots(isoDate(d)).some(s => !s.taken)) return isoDate(d); } return isoDate(today); };
    function getSlots(ds) {
      const d = new Date(ds + "T00:00"); const h = STORE.hours[d.getDay()]; if (!h) return [];
      const toM = t => { const [a, b] = t.split(":").map(Number); return a * 60 + b; };
      const taken = DB.get("appointments", []).filter(a => a.date === ds && a.status !== "Cancelled").map(a => a.time);
      const nowM = ds === isoDate(new Date()) ? new Date().getHours() * 60 + new Date().getMinutes() + 30 : -1;
      const out = []; for (let m = toM(h[0]); m + STORE.slotMinutes <= toM(h[1]); m += STORE.slotMinutes) { const t = pad(Math.floor(m / 60)) + ":" + pad(m % 60); if (m > nowM) out.push({ t, taken: taken.includes(t) }); }
      return out;
    }
    const renderSlots = () => {
      sel = ""; const s = getSlots(dateIn.value);
      slotsEl.innerHTML = s.length ? s.map(x => `<button type="button" class="slot" data-t="${x.t}" ${x.taken ? "disabled" : ""}>${fmtTime(x.t)}</button>`).join("") : `<p class="muted" style="grid-column:1/-1">The showroom is closed on this day — please choose another date.</p>`;
      $$(".slot", slotsEl).forEach(b => b.onclick = () => { $$(".slot", slotsEl).forEach(x => x.classList.remove("sel")); b.classList.add("sel"); sel = b.dataset.t; });
    };
    dateIn.value = firstOpen(); dateIn.onchange = renderSlots; renderSlots();
    form.onsubmit = e => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(form));
      if (!d.name.trim()) return msg(form, "Please enter your name.", true);
      if (!validPhone(d.phone)) return msg(form, "Please enter a valid 10-digit mobile number.", true);
      if (!sel) return msg(form, "Please choose a time slot.", true);
      const appt = DB.push("appointments", { name: d.name.trim(), phone: d.phone.trim(), date: dateIn.value, time: sel, reason: d.reason, notes: d.notes || "", status: "Requested" });
      track("appointment");
      const text = `Hello ${STORE.shortName}, I'd like to request an eye test.\nName: ${appt.name}\nPhone: ${appt.phone}\nDate: ${fmtDate(appt.date)}\nTime: ${fmtTime(appt.time)}\nFor: ${appt.reason}${appt.notes ? "\nNotes: " + appt.notes : ""}\nRef: ${appt.id}`;
      $("#bookDone").innerHTML = `<div class="form-card" style="text-align:center"><div class="f-icon" style="width:64px;height:64px;border-radius:50%;background:#E6F2EC;color:var(--green);display:grid;place-items:center;margin:0 auto 18px">${ICONS.shield}</div>
        <h3>Request received</h3><p style="color:var(--ink-2)">${esc(appt.name)}, your eye test request for <b>${fmtDate(appt.date)} at ${fmtTime(appt.time)}</b> is saved (ref ${appt.id}). Please send it on WhatsApp so our team can confirm.</p>
        <div class="btn-row" style="justify-content:center"><a class="btn btn-wa" href="${waLink(text)}" target="_blank" rel="noopener">${ICONS.whatsapp} Send on WhatsApp</a><button class="btn btn-outline" id="ics">${ICONS.cal} Add to calendar</button></div>
        <p class="muted" style="font-size:13px;margin-top:16px">Your request is only confirmed once our team replies.</p></div>`;
      form.classList.add("hidden"); $("#bookDone").classList.remove("hidden");
      $("#ics").onclick = () => downloadIcs(appt);
      window.open(waLink(text), "_blank", "noopener");
    };
    $("#etFaq") && ($("#etFaq").innerHTML = faqHTML([FAQS[0], FAQS[1]]), initAccordions($("#etFaq")));
  }
  function downloadIcs(a) {
    const s = new Date(a.date + "T" + a.time); const e = new Date(s.getTime() + STORE.slotMinutes * 60000);
    const f = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Opticare//Booking//EN", "BEGIN:VEVENT", `UID:${a.id}@opticare`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(s)}`, `DTEND:${f(e)}`, "SUMMARY:Eye test – Opticare Optical House", `LOCATION:${STORE.address.replace(/,/g, "\\,")}`, "DESCRIPTION:Request pending confirmation from the store.", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); const l = document.createElement("a"); l.href = url; l.download = "opticare-eye-test.ics"; l.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------------- SERVICES (repairs / prescription / delivery / consult) ---------------- */
  function services() {
    const tabs = $$(".form-tabs button"), panes = $$("[data-pane]");
    const show = id => { tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === id)); panes.forEach(p => p.classList.toggle("hidden", p.dataset.pane !== id)); };
    tabs.forEach(t => t.onclick = () => { show(t.dataset.tab); history.replaceState(null, "", "#" + t.dataset.tab); });
    const h = location.hash.slice(1); show(["repair", "prescription", "delivery", "consult"].includes(h) ? h : "repair");
    $$(".svc-jump").forEach(a => a.addEventListener("click", () => { const id = a.getAttribute("href").split("#")[1]; show(id); }));
    $$(".upload-zone").forEach(bindUpload);
    const frame = qs("frame"); const p = frame && getProducts().find(x => x.id === frame);
    if (p) $$("input[name=frame]").forEach(i => i.value = `${p.name} (${p.id})`);
    $$("form[data-type]").forEach(f => f.onsubmit = e => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(f)); delete d.file;
      if (!validPhone(d.phone)) return msg(f, "Please enter a valid 10-digit mobile number.", true);
      const zone = f.querySelector(".upload-zone"); if (zone && zone.dataset.img) d.photo = zone.dataset.img;
      submitEnquiry(f.dataset.type, d);
      msg(f, zone && zone.dataset.img ? "Saved! WhatsApp is opening — please attach your photo in the chat so our team can see it." : "Saved! WhatsApp is opening so you can send your request to our team.");
      f.reset(); if (zone) { zone.dataset.img = ""; zone.querySelector(".up-preview").innerHTML = ""; }
    });
  }

  /* ---------------- REVIEWS ---------------- */
  function reviews() {
    $("#themes").innerHTML = REVIEW_THEMES.map(themeCard).join("");
    const real = getReviews();
    $("#realWrap").classList.toggle("hidden", !real.length);
    $("#realGrid").innerHTML = real.map(reviewCard).join("");
    const photos = DB.get("customerPhotos", []);
    $("#photoGrid").innerHTML = photos.length ? photos.map(ph => `<figure class="art-panel" style="aspect-ratio:1;margin:0"><img src="${ph.src}" alt="${esc(ph.caption || "Customer photo")}" style="width:100%;height:100%;object-fit:cover"></figure>`).join("")
      : [IMG.women, IMG.kids2, IMG.men, IMG.sun].map((id, i) => `<div class="photo-panel" style="aspect-ratio:1"><img src="${U(id, 600, 600)}" alt="Customer wearing eyewear" loading="lazy" style="width:100%;height:100%;object-fit:cover"><span class="ph-note">Style inspiration</span></div>`).join("");
    const f = $("#fbForm"); let rating = 5;
    $$("#rate button").forEach(b => b.onclick = () => { rating = +b.dataset.r; $$("#rate button").forEach(x => x.style.color = +x.dataset.r <= rating ? "var(--gold)" : "var(--line)"); });
    f.onsubmit = e => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(f));
      if (!d.name.trim() || d.text.trim().length < 10) return msg(f, "Please add your name and a few words about your experience.", true);
      DB.push("reviews", { name: d.name.trim(), place: d.place, text: d.text.trim(), rating, consent: !!d.consent, published: false });
      track("feedback"); f.reset(); msg(f, "Thank you for your feedback! It will appear after our team reviews it. We'd also love a review on Google ↗");
    };
    R();
  }

  /* ---------------- CONTACT ---------------- */
  function contact() {
    $("#map").src = mapEmbed();
    $("#hours").innerHTML = hoursTable();
    const st = openStatus(); $("#openPill").className = "open-pill " + (st.open ? "open" : "closed"); $("#openPill").innerHTML = `<i></i>${esc(st.text)}`;
    $("#cFaq").innerHTML = faqHTML(FAQS); initAccordions($("#cFaq"));
    const f = $("#contactForm");
    f.onsubmit = e => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(f));
      if (!d.name.trim()) return msg(f, "Please enter your name.", true);
      if (!validPhone(d.phone)) return msg(f, "Please enter a valid 10-digit mobile number.", true);
      submitEnquiry(d.topic || "General", d); f.reset(); msg(f, "Thank you! Your enquiry is saved and WhatsApp is opening to send it to our team.");
    };
  }

  /* ---------------- ABOUT ---------------- */
  function about() { }
  /* Photo panels: <div data-art="IMGKEY"> → real photograph */
  function photoPanels() {
    const fallback = ["wall", "store", "rack", "wallGold", "detail2", "detail"];
    $$("[data-art]").forEach((el, i) => {
      if (el.dataset.done) return; el.dataset.done = 1;
      const id = IMG[el.dataset.art] || IMG[fallback[i % fallback.length]];
      el.classList.remove("art-panel", "dark"); el.classList.add("photo-panel");
      el.insertAdjacentHTML("afterbegin", `<img src="${U(id, 1000)}" srcset="${USET(id)}" sizes="(max-width: 900px) 100vw, 50vw" alt="${esc(el.querySelector(".ph-note")?.textContent || "Opticare eyewear")}" loading="lazy" style="position:absolute;inset:0">`);
      if (!el.style.aspectRatio && !el.getAttribute("style")) el.style.aspectRatio = "4 / 5";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    ({ home, collections, product, lenses, "eye-testing": eyeTesting, services, reviews, contact, about }[page] || (() => { }))();
    photoPanels();
    hydrateIcons(); R();
  });
})();
