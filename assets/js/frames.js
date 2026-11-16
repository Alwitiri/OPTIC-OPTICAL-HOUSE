/* ==========================================================
   Frame renderer — draws eyewear as crisp vector SVG from a
   product's shape / material / colour / lens settings.
   Used for product images AND as the transparent overlay in the
   Virtual Try-On. Real product photos / try-on PNGs uploaded via
   the admin dashboard take priority automatically.

   Geometry: viewBox 0 0 300 110. Lens centres at x=82 and x=218
   (136 units apart, mapped to the wearer's pupil distance).
   ========================================================== */
const FRAME_GEOM = { W: 300, H: 110, LX: 82, RX: 218, CY: 55, PD: 136 };

const rrPath = (w, h, r) => {
  const x = w / 2, y = h / 2;
  return `M ${-x + r} ${-y} H ${x - r} Q ${x} ${-y} ${x} ${-y + r} V ${y - r} Q ${x} ${y} ${x - r} ${y} H ${-x + r} Q ${-x} ${y} ${-x} ${y - r} V ${-y + r} Q ${-x} ${-y} ${-x + r} ${-y} Z`;
};

/* Paths describe the lens on the viewer's LEFT (outer edge = negative x). */
const FRAME_SHAPES = {
  round: { d: "M -44 0 A 44 44 0 1 0 44 0 A 44 44 0 1 0 -44 0 Z", hw: 44, top: -30 },
  oval: { d: "M -52 0 A 52 38 0 1 0 52 0 A 52 38 0 1 0 -52 0 Z", hw: 52, top: -22 },
  rectangle: { d: rrPath(114, 62, 12), hw: 57, top: -24 },
  square: { d: rrPath(106, 88, 18), hw: 53, top: -34 },
  wayfarer: { d: "M -58 -34 L 54 -32 Q 60 -32 58 -25 L 48 22 Q 45 35 32 35 L -36 35 Q -50 35 -53 22 L -62 -26 Q -63 -34 -58 -34 Z", hw: 60, top: -30 },
  cateye: { d: "M -66 -44 C -46 -30 0 -26 40 -18 C 56 -14 58 4 48 18 C 36 32 14 34 -8 32 C -36 30 -52 18 -56 0 C -58 -14 -58 -30 -66 -44 Z", hw: 57, top: -30 },
  aviator: { d: "M -55 -31 Q 0 -41 52 -31 Q 61 -27 57 -6 Q 49 41 6 43 Q -41 45 -55 10 Q -62 -10 -55 -31 Z", hw: 57, top: -28 },
  geometric: { d: "M -30 -41 L 30 -41 L 55 0 L 30 41 L -30 41 L -55 0 Z", hw: 55, top: -30 },
  browline: { d: rrPath(112, 74, 22), hw: 56, top: -28 }
};
const SHAPE_LABELS = { round: "Round", oval: "Oval", rectangle: "Rectangle", square: "Square", wayfarer: "Wayfarer", cateye: "Cat-Eye", aviator: "Aviator", geometric: "Geometric", browline: "Browline" };

function shade(hex, amt) {
  let c = (hex || "#333").replace("#", ""); if (c.length === 3) c = c.split("").map(x => x + x).join("");
  const n = parseInt(c, 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return "#" + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, "0")).join("");
}

let __fid = 0;
function frameSVG(p, opts = {}) {
  const view = opts.view || "front";
  const s = FRAME_SHAPES[p.shape] || FRAME_SHAPES.rectangle;
  const { LX, RX, CY } = FRAME_GEOM;
  const metal = /metal|titanium/i.test(p.material || "") && !/acetate/i.test(p.material || "");
  const mixed = /&/.test(p.material || "");
  const sw = metal ? 3.4 : mixed ? 3.6 : 8;
  const col = p.color || "#1E1D1B";
  const hi = shade(col, .38), lo = shade(col, -.35);
  const tinted = p.lens && p.lens !== "clear";
  const id = "f" + (++__fid);
  const hw = s.hw;

  const lensFill = tinted ? `url(#${id}l)` : `url(#${id}c)`;
  const lens = `<path d="${s.d}" fill="${lensFill}"/>`;
  const glare = `<path d="M ${-hw * .55} ${-12} Q ${-hw * .2} ${-28} ${hw * .25} ${-24}" stroke="rgba(255,255,255,${tinted ? .35 : .55})" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const rim = `<path d="${s.d}" fill="none" stroke="url(#${id}r)" stroke-width="${sw}" stroke-linejoin="round"/>`;
  const rimHi = metal ? "" : `<path d="${s.d}" fill="none" stroke="${hi}" stroke-opacity=".35" stroke-width="1.4" transform="scale(.985)"/>`;
  const brow = p.shape === "browline" ? `<path d="M ${-hw} -16 Q ${-hw} -37 ${-hw + 22} -37 H ${hw - 22} Q ${hw} -37 ${hw} -16" fill="none" stroke="${p.color2 || col}" stroke-width="11" stroke-linecap="round"/>` : "";
  const lensGroup = `${lens}${glare}${rim}${rimHi}${brow}`;

  const bL = LX + hw - 3, bR = RX - hw + 3;
  const bridge = p.shape === "aviator"
    ? `<path d="M ${bL} ${CY - 22} Q 150 ${CY - 30} ${bR} ${CY - 22}" stroke="url(#${id}r)" stroke-width="${Math.max(3, sw * .6)}" fill="none" stroke-linecap="round"/><path d="M ${bL + 2} ${CY - 30} Q 150 ${CY - 40} ${bR - 2} ${CY - 30}" stroke="url(#${id}r)" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : `<path d="M ${bL} ${CY - 6} Q 150 ${CY - 24} ${bR} ${CY - 6}" stroke="url(#${id}r)" stroke-width="${metal ? 3.6 : sw * .9}" fill="none" stroke-linecap="round"/>`;
  const pads = metal ? `<ellipse cx="${bL + 4}" cy="${CY + 12}" rx="3.5" ry="6" fill="rgba(255,255,255,.55)" stroke="${lo}" stroke-width=".8"/><ellipse cx="${bR - 4}" cy="${CY + 12}" rx="3.5" ry="6" fill="rgba(255,255,255,.55)" stroke="${lo}" stroke-width=".8"/>` : "";
  const ty = CY + s.top + 8;
  const temples = opts.tryon
    ? `<path d="M ${LX - hw + 1} ${ty} l -9 -1" stroke="url(#${id}r)" stroke-width="${sw}" stroke-linecap="round"/><path d="M ${RX + hw - 1} ${ty} l 9 -1" stroke="url(#${id}r)" stroke-width="${sw}" stroke-linecap="round"/>`
    : `<path d="M ${LX - hw + 1} ${ty} L 4 ${ty - 3}" stroke="url(#${id}r)" stroke-width="${metal ? 3 : 6}" stroke-linecap="round"/><path d="M ${RX + hw - 1} ${ty} L 296 ${ty - 3}" stroke="url(#${id}r)" stroke-width="${metal ? 3 : 6}" stroke-linecap="round"/>`;

  const defs = `<defs>
    <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset=".45" stop-color="${col}"/><stop offset="1" stop-color="${lo}"/></linearGradient>
    <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.lens}" stop-opacity=".96"/><stop offset="1" stop-color="${shade(p.lens, .25)}" stop-opacity=".78"/></linearGradient>
    <linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".30"/><stop offset=".6" stop-color="#dfe9ef" stop-opacity=".10"/><stop offset="1" stop-color="#ffffff" stop-opacity=".22"/></linearGradient>
  </defs>`;

  const body = `${temples}${bridge}${pads}<g transform="translate(${LX},${CY})">${lensGroup}</g><g transform="translate(${RX},${CY}) scale(-1,1)">${lensGroup}</g>`;
  let vb = "0 0 300 110", inner = body;
  if (view === "angle") inner = `<g transform="translate(150,55) skewY(-6) scale(.86,1) translate(-150,-55)">${body}</g>`;
  if (view === "detail") vb = "20 5 150 100";
  if (view === "top") inner = `<g transform="translate(0,62) scale(1,.18) translate(0,-55)">${body}</g>`;
  const label = opts.label === false ? "" : `<title>${(p.name || "Frame").replace(/</g, "")} — ${SHAPE_LABELS[p.shape] || ""} frame in ${p.colorName || ""}</title>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" class="${opts.cls || ""}">${label}${defs}${inner}</svg>`;
}

/* Product imagery: uploaded photo > generated vector */
function productMedia(p, view, opts = {}) {
  const alt = `${(p.name || "").replace(/"/g, "")} — ${p.colorName || ""} ${SHAPE_LABELS[p.shape] || ""} ${p.lens && p.lens !== "clear" ? "sunglasses" : "eyeglasses"}`;
  const ratio = opts.ratio || .8, sizes = opts.sizes || "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw";
  if (p.photo) return `<img class="p-photo" src="${p.photo}" alt="${alt}" loading="lazy">`;
  if (p.img && typeof U === "function") return `<img class="p-photo" src="${U(p.img, 800, Math.round(800 * ratio))}" srcset="${USET(p.img, ratio)}" sizes="${sizes}" alt="${alt}" loading="${opts.eager ? "eager" : "lazy"}" decoding="async">`;
  return frameSVG(p, { view });
}
const productThumb = (p, w = 160) => p.photo ? `<img src="${p.photo}" alt="">` : p.img ? `<img src="${U(p.img, w, Math.round(w * .75))}" alt="" loading="lazy">` : frameSVG(p, { label: false });

/* Image object for canvas drawing (try-on). Uses uploaded transparent PNG if available. */
const __frameImgCache = {};
function frameImage(p) {
  const key = p.id + "|" + (p.tryonImg ? "png" : p.color + p.lens + p.shape + p.material);
  if (__frameImgCache[key]) return __frameImgCache[key];
  const img = new Image();
  if (p.tryonImg) { img.src = p.tryonImg; img.dataset.custom = "1"; }
  else img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(frameSVG(p, { tryon: true, label: false }));
  __frameImgCache[key] = img;
  return img;
}

/* Decorative hero / category illustrations */
function glassesHero(color = "#1E1D1B", lens = "clear", shape = "wayfarer") {
  return frameSVG({ id: "hero", name: "Opticare signature", shape, material: "Acetate", color, lens, colorName: "" }, { cls: "glasses" });
}
