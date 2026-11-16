/* ==========================================================
   Virtual Eyewear Try-On (2D AR)
   - Camera via getUserMedia (WebRTC), processed locally
   - MediaPipe Face Landmarker (478 landmarks incl. irises)
   - Frames drawn from transparent overlays (vector or uploaded PNG)
   - Switch / adjust / compare / capture / share on WhatsApp
   Upgrade path: replace drawFrame() with a Three.js 3D model
   renderer using the facial transformation matrix (see README).
   ========================================================== */
const MP_VER = "0.10.14";
const MP_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VER}`;
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

/* Front-facing model portraits (Unsplash) for trying frames without a camera */
const MODELS = [
  { id: "photo-1507003211169-0a1dd7228f2d", label: "Arjun" },
  { id: "photo-1534528741775-53994a69daeb", label: "Maya" },
  { id: "photo-1580489944761-15a19d654956", label: "Sara" },
  { id: "photo-1587397845856-e6cf49176c70", label: "Leo" }
];
const video = $("#video"), canvas = $("#canvas"), ctx = canvas.getContext("2d");
const stage = $("#stage"), statusEl = $("#status");
const products = getProducts();
const TABS = [
  ["all", "All", () => true],
  ["classic", "Classic", p => ["rectangle", "wayfarer", "browline", "square"].includes(p.shape) && p.lens === "clear"],
  ["round", "Round", p => ["round", "oval"].includes(p.shape)],
  ["cateye", "Cat-Eye", p => p.shape === "cateye"],
  ["sun", "Sunglasses", p => p.lens !== "clear"],
  ["premium", "Premium", p => p.cats.includes("premium")]
];

const S = {
  mode: "idle",           // idle | camera | photo
  landmarker: null, loading: null, runningMode: null,
  stream: null, photo: null, lastLm: null, lastVideoTime: -1,
  frame: products.find(p => p.id === qs("frame")) || products[0],
  compare: false, frameB: null,
  fit: { size: 1, y: 0, x: 0 },
  smooth: null, manual: null, shots: [], tab: "all", raf: 0, noFaceSince: 0
};

/* ---------------- UI ---------------- */
function setStatus(text, ok) { statusEl.className = "stage-status" + (ok ? " ok" : ""); statusEl.querySelector("span").textContent = text; }

function renderTabs() {
  $("#catTabs").innerHTML = TABS.map(([id, label]) => `<button class="${S.tab === id ? "on" : ""}" data-t="${id}">${label}</button>`).join("");
  $$("#catTabs button").forEach(b => b.onclick = () => { S.tab = b.dataset.t; renderTabs(); renderPicker(); });
}
function renderPicker() {
  const f = TABS.find(t => t[0] === S.tab)[2];
  $("#picker").innerHTML = products.filter(f).map(p => `<button class="frame-opt ${p.id === S.frame.id ? "sel" : ""} ${S.frameB && p.id === S.frameB.id ? "cmp" : ""}" data-id="${p.id}" title="${esc(p.name)}">${productThumb(p, 200)}${esc(p.name)}</button>`).join("");
  $$("#picker .frame-opt").forEach(b => b.onclick = () => {
    const p = products.find(x => x.id === b.dataset.id);
    if (S.compare) { S.frameB = p; doCompare(); } else selectFrame(p);
    renderPicker();
  });
}
function selectFrame(p) {
  S.frame = p; frameImage(p);
  $("#selName").textContent = p.name;
  $("#selCat").textContent = `${SHAPE_LABELS[p.shape]} · ${p.lens === "clear" ? "Optical" : "Sunglasses"}`;
  $("#selMeta").textContent = `${p.colorName} · ${p.material} · from ${rupee(p.price)}`;
  $("#selWa").href = waLink(`Hello ${STORE.shortName}, I tried the "${p.name}" (${p.id}, ${p.colorName}) in the virtual try-on. Is it available?`);
  history.replaceState(null, "", `?frame=${encodeURIComponent(p.id)}`);
}
function bindControls() {
  const upd = () => {
    S.fit.size = $("#cSize").value / 100; S.fit.y = $("#cY").value / 100; S.fit.x = $("#cX").value / 100;
    $("#vSize").textContent = $("#cSize").value + "%"; $("#vY").textContent = $("#cY").value; $("#vX").textContent = $("#cX").value;
  };
  ["cSize", "cY", "cX"].forEach(id => $("#" + id).addEventListener("input", upd));
  $("#resetFit").onclick = () => { $("#cSize").value = 100; $("#cY").value = 0; $("#cX").value = 0; S.manual = null; upd(); };
  $("#startCam").onclick = startCamera;
  $("#startUpload").onclick = () => $("#fileIn").click();
  $("#tbUpload").onclick = () => $("#fileIn").click();
  $("#fileIn").onchange = e => { const f = e.target.files[0]; if (f) loadPhoto(f); e.target.value = ""; };
  // Model photos — try frames without a camera
  const modelBtns = MODELS.map((m, i) => `<button class="model-pick" data-m="${i}" aria-label="Try frames on ${esc(m.label)}"><img src="${U(m.id, 160, 160)}" alt="" crossorigin="anonymous"><span>${esc(m.label)}</span></button>`).join("");
  $("#models").innerHTML = modelBtns; $("#modelsSide").innerHTML = modelBtns;
  $$(".model-pick").forEach(b => b.onclick = () => { const m = MODELS[+b.dataset.m]; loadPhoto(U(m.id, 1100)); track("tryon_model"); });
  $("#tbCapture").onclick = capture;
  $("#tbStop").onclick = stopAll;
  $("#tbPrev").onclick = () => { const list = products; const i = list.indexOf(S.frame); selectFrame(list[(i + 1) % list.length]); renderPicker(); };
  $("#tbCompare").onclick = () => {
    S.compare = !S.compare; $("#tbCompare").style.background = S.compare ? "var(--gold)" : "";
    $("#cmpHint").textContent = S.compare ? "· pick a 2nd frame to compare" : "";
    if (!S.compare) { S.frameB = null; renderPicker(); } else toast("Compare mode: choose a second frame from the list.");
  };
  $("#closeCompare").onclick = () => $("#compareWrap").classList.add("hidden");
  $("#dlLast").onclick = () => { const s = S.shots[0]; if (s) download(s.url, `opticare-${s.frame.id}.png`); };
  $("#shareLast").onclick = () => S.shots[0] && share(S.shots[0]);
  // Manual drag placement (fallback when no face is detected, or to nudge)
  let drag = null;
  canvas.addEventListener("pointerdown", e => { if (S.mode === "idle") return; drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", e => {
    if (!drag) return; const r = canvas.getBoundingClientRect(); const k = canvas.width / r.width;
    const base = S.manual || S.smooth || defaultPose();
    S.manual = Object.assign({}, base, { cx: base.cx + (e.clientX - drag.x) * k, cy: base.cy + (e.clientY - drag.y) * k });
    drag = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener("pointerup", () => drag = null);
  canvas.addEventListener("wheel", e => { if (S.mode === "idle") return; e.preventDefault(); const v = Math.max(75, Math.min(130, +$("#cSize").value - Math.sign(e.deltaY) * 3)); $("#cSize").value = v; $("#cSize").dispatchEvent(new Event("input")); }, { passive: false });
}

/* ---------------- Face Landmarker ---------------- */
async function getLandmarker(mode) {
  if (!S.loading) {
    S.loading = (async () => {
      setStatus("Loading face detection…");
      const vision = await import(`${MP_URL}/vision_bundle.mjs`);
      const files = await vision.FilesetResolver.forVisionTasks(`${MP_URL}/wasm`);
      const make = delegate => vision.FaceLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: MODEL_URL, delegate }, runningMode: mode, numFaces: 1, outputFacialTransformationMatrixes: false });
      if (S.forceCPU) S.landmarker = await make("CPU");
      else { try { S.landmarker = await make("GPU"); } catch (e) { S.landmarker = await make("CPU"); } }
      S.runningMode = mode;
      return S.landmarker;
    })().catch(err => { console.warn("Face Landmarker unavailable:", err); S.loading = null; S.landmarker = null; throw err; });
  }
  const lm = await S.loading;
  if (S.runningMode !== mode) { await lm.setOptions({ runningMode: mode }); S.runningMode = mode; }
  return lm;
}

/* ---------------- Sources ---------------- */
function cameraError(kind) {
  const msgs = {
    insecure: ["Camera needs a secure connection", "Open this page over <b>https://</b> or on <b>http://localhost</b> to use the camera."],
    unsupported: ["Camera isn't supported here", "This browser doesn't support camera access. Please use the latest Chrome, Edge, Safari or Firefox."],
    NotAllowedError: ["Camera access was blocked", "Allow camera access using the camera icon in your browser's address bar, then try again. If this page is open inside an app preview, open it in Chrome, Edge or Safari instead."],
    NotFoundError: ["No camera found", "We couldn't find a camera on this device. You can still upload a photo or try frames on a model."],
    NotReadableError: ["Camera is busy", "Another app (Zoom, Teams, etc.) may be using the camera. Close it and try again."],
    other: ["Couldn't start the camera", "Please try again, upload a photo, or try frames on a model."]
  };
  const [t, d] = msgs[kind] || msgs.other;
  $("#camErr").innerHTML = `<div class="cam-err"><span>${ICONS.camera}</span><b>${t}</b><p>${d}</p><div class="btn-row" style="justify-content:center"><button class="btn btn-light btn-sm" data-retry>Try again</button><a class="btn btn-ghost-light btn-sm" href="${location.href.split("#")[0]}" target="_blank" rel="noopener">Open in new tab</a></div></div>`;
  $("#camErr").classList.remove("hidden");
  $("#camErr [data-retry]").onclick = () => { $("#camErr").classList.add("hidden"); startCamera(); };
  setStatus("Camera unavailable");
}
async function startCamera() {
  $("#camErr").classList.add("hidden");
  if (!window.isSecureContext) return cameraError("insecure");
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return cameraError("unsupported");
  stopStream();
  setStatus("Requesting camera…");
  try {
    S.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
  } catch (e) {
    try { if (e.name === "OverconstrainedError") S.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); } catch (e2) { }
    if (!S.stream) return cameraError(e.name);
  }
  video.srcObject = S.stream;
  await new Promise(res => { if (video.readyState >= 1) res(); else video.onloadedmetadata = res; setTimeout(res, 3000); });
  try { await video.play(); } catch (e) { }
  S.camStart = performance.now(); S.errCount = 0;
  S.mode = "camera"; S.photo = null; S.smooth = null; S.manual = null; S.lastLm = null;
  sizeCanvas(video.videoWidth, video.videoHeight);
  showStage(); track("tryon_camera");
  getLandmarker("VIDEO").then(() => setStatus("Looking for your face…")).catch(() => setStatus("Manual mode — drag to position"));
  loop();
}
async function loadPhoto(file) {
  const isUrl = typeof file === "string";
  if (!isUrl && !/^image\//.test(file.type)) { toast("Please choose an image file."); return; }
  stopStream(); $("#camErr").classList.add("hidden");
  setStatus("Loading photo…");
  const token = S.loadToken = (S.loadToken || 0) + 1;
  const img = new Image(); if (isUrl) img.crossOrigin = "anonymous";
  await new Promise(res => { img.onload = res; img.onerror = res; img.src = isUrl ? file : URL.createObjectURL(file); });
  if (token !== S.loadToken) return;
  if (!img.naturalWidth) { toast("Couldn't read that image. Please try another photo."); setStatus("Ready"); return; }
  const max = 1280, s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); if (!isUrl) URL.revokeObjectURL(img.src);
  S.mode = "photo"; S.photo = c; S.smooth = null; S.manual = null; S.lastLm = null;
  sizeCanvas(c.width, c.height); showStage(); track("tryon_photo");
  try {
    const lm = await getLandmarker("IMAGE");
    if (token !== S.loadToken) return;
    const r = lm.detect(c);
    S.lastLm = r.faceLandmarks && r.faceLandmarks[0] || null;
    setStatus(S.lastLm ? "Face detected" : "No face found — drag to position", !!S.lastLm);
  } catch (e) { setStatus("Manual mode — drag to position"); }
  loop();
}
function sizeCanvas(w, h) { canvas.width = w; canvas.height = h; stage.style.aspectRatio = `${w} / ${h}`; stage.style.maxWidth = `min(100%, calc(78vh * ${(w / h).toFixed(4)}))`; stage.style.margin = "0 auto"; }
function showStage() { $("#intro").classList.add("hidden"); $("#toolbar").classList.remove("hidden"); }
function stopStream() { if (S.stream) { S.stream.getTracks().forEach(t => t.stop()); S.stream = null; } cancelAnimationFrame(S.raf); }
function stopAll() {
  stopStream(); S.mode = "idle"; ctx.clearRect(0, 0, canvas.width, canvas.height);
  $("#intro").classList.remove("hidden"); $("#toolbar").classList.add("hidden"); stage.style.aspectRatio = ""; stage.style.maxWidth = ""; setStatus("Ready");
}

/* ---------------- Pose from landmarks ---------------- */
const mirror = () => S.mode === "camera";
function pt(l, W, H) { return { x: (mirror() ? 1 - l.x : l.x) * W, y: l.y * H, z: l.z * W }; }
function poseFrom(lm, W, H) {
  const P = i => pt(lm[i], W, H);
  const iris = lm.length > 473;
  const avg = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 });
  let e1 = iris ? P(468) : avg(P(33), P(133)), e2 = iris ? P(473) : avg(P(362), P(263));
  if (e1.x > e2.x) [e1, e2] = [e2, e1];
  let f1 = P(234), f2 = P(454); if (f1.x > f2.x) [f1, f2] = [f2, f1];
  const bridge = P(168);
  const dx = f2.x - f1.x, dy = f2.y - f1.y, dz = f2.z - f1.z;
  const full = Math.hypot(dx, dy, dz), proj = Math.hypot(dx, dy);
  const eyeMid = avg(e1, e2);
  return {
    cx: bridge.x * .6 + eyeMid.x * .4,
    cy: eyeMid.y,
    angle: Math.atan2(e2.y - e1.y, e2.x - e1.x),
    width: full * 1.14,
    squash: Math.max(.55, Math.min(1, proj / full)),
    yawShift: (bridge.x - (f1.x + f2.x) / 2) * .25
  };
}
function defaultPose() { return { cx: canvas.width / 2, cy: canvas.height * .42, angle: 0, width: Math.min(canvas.width, canvas.height) * .55, squash: 1, yawShift: 0 }; }
function smoothPose(p) {
  if (!S.smooth) return (S.smooth = p);
  const a = .45, s = S.smooth;
  for (const k of ["cx", "cy", "width", "squash", "yawShift"]) s[k] += (p[k] - s[k]) * a;
  let d = p.angle - s.angle; d = Math.atan2(Math.sin(d), Math.cos(d)); s.angle += d * a;
  return s;
}

/* ---------------- Render ---------------- */
function drawSource(c2 = ctx) {
  const W = canvas.width, H = canvas.height;
  c2.save();
  if (S.mode === "camera") { c2.translate(W, 0); c2.scale(-1, 1); c2.drawImage(video, 0, 0, W, H); }
  else if (S.photo) c2.drawImage(S.photo, 0, 0, W, H);
  c2.restore();
}
function drawFrame(c2, pose, p) {
  const img = frameImage(p); if (!img.complete || !img.naturalWidth) return;
  const w = pose.width * S.fit.size, h = w * (img.dataset.custom ? img.naturalHeight / img.naturalWidth : FRAME_GEOM.H / FRAME_GEOM.W);
  c2.save();
  c2.translate(pose.cx + pose.yawShift + S.fit.x * w * .5, pose.cy);
  c2.rotate(pose.angle);
  c2.scale(pose.squash, 1);
  c2.translate(0, S.fit.y * h);
  // soft contact shadow for realism
  c2.shadowColor = "rgba(0,0,0,.28)"; c2.shadowBlur = w * .02; c2.shadowOffsetY = w * .012;
  const cyOff = img.dataset.custom ? h / 2 : h * (FRAME_GEOM.CY / FRAME_GEOM.H);
  c2.drawImage(img, -w / 2, -cyOff, w, h);
  c2.restore();
}
function currentPose() { return S.manual || (S.lastLm ? (S.smooth || poseFrom(S.lastLm, canvas.width, canvas.height)) : (S.smooth || defaultPose())); }
function loop() {
  cancelAnimationFrame(S.raf);
  const tick = () => {
    if (S.mode === "idle") return;
    if (S.mode === "camera" && video.videoWidth && (video.videoWidth !== canvas.width || video.videoHeight !== canvas.height)) { sizeCanvas(video.videoWidth, video.videoHeight); S.smooth = null; }
    if (S.mode === "camera" && S.landmarker && S.runningMode === "VIDEO" && video.readyState >= 2 && video.currentTime !== S.lastVideoTime) {
      S.lastVideoTime = video.currentTime;
      try {
        const r = S.landmarker.detectForVideo(video, Math.max(performance.now(), (S.lastTs || 0) + 1)); S.lastTs = performance.now();
        const lm = r.faceLandmarks && r.faceLandmarks[0];
        if (lm) { S.lastLm = lm; S.noFaceSince = 0; if (!S.manual) smoothPose(poseFrom(lm, canvas.width, canvas.height)); setStatus("Face detected", true); }
        else { S.noFaceSince = S.noFaceSince || performance.now(); if (performance.now() - S.noFaceSince > 600) setStatus("Face the camera in good light…"); if (performance.now() - S.noFaceSince > 900) S.lastLm = null; }
      } catch (e) {
        // Some GPUs fail at runtime: rebuild the detector on CPU once
        if (++S.errCount > 3 && !S.cpuRetry) { S.cpuRetry = true; console.warn("Face detection error, retrying on CPU", e); S.landmarker = null; S.loading = null; S.forceCPU = true; getLandmarker("VIDEO").catch(() => setStatus("Manual mode — drag to position")); }
      }
    }
    if (S.mode === "photo" && S.lastLm && !S.smooth) S.smooth = poseFrom(S.lastLm, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSource();
    const waitingTooLong = S.mode === "camera" && performance.now() - (S.camStart || 0) > 2500;
    if (S.mode === "photo" || S.lastLm || S.manual || !S.landmarker || waitingTooLong) drawFrame(ctx, currentPose(), S.frame);
    S.raf = requestAnimationFrame(tick);
  };
  tick();
}

/* ---------------- Capture / compare / share ---------------- */
function renderLook(p) {
  const c = document.createElement("canvas"); c.width = canvas.width; c.height = canvas.height;
  const x = c.getContext("2d"); drawSource(x); drawFrame(x, currentPose(), p);
  const bar = Math.max(34, c.height * .065);
  x.fillStyle = "rgba(18,17,16,.72)"; x.fillRect(0, c.height - bar, c.width, bar);
  x.fillStyle = "#fff"; x.font = `600 ${bar * .36}px Manrope, sans-serif`; x.textBaseline = "middle";
  x.fillText(`OPTICARE · ${p.name} · ${p.colorName}`, bar * .45, c.height - bar / 2);
  x.textAlign = "right"; x.fillStyle = "#D9C49A"; x.fillText("Virtual preview", c.width - bar * .45, c.height - bar / 2);
  return c.toDataURL("image/png");
}
function capture() {
  if (S.mode === "idle") return;
  const url = renderLook(S.frame);
  S.shots.unshift({ url, frame: S.frame }); S.shots = S.shots.slice(0, 9);
  const fl = $("#flash"); fl.classList.remove("go"); void fl.offsetWidth; fl.classList.add("go");
  renderShots(); track("tryon_capture"); toast("Look captured — save it or share it on WhatsApp.");
}
function renderShots() {
  $("#shots").innerHTML = S.shots.map((s, i) => `<img src="${s.url}" alt="Captured look with ${esc(s.frame.name)}" data-i="${i}" title="${esc(s.frame.name)}">`).join("");
  $$("#shots img").forEach(im => im.onclick = () => { const s = S.shots.splice(+im.dataset.i, 1)[0]; S.shots.unshift(s); renderShots(); });
  $("#dlLast").disabled = $("#shareLast").disabled = !S.shots.length;
}
function doCompare() {
  if (S.mode === "idle") { toast("Start the camera or upload a photo first."); return; }
  if (!S.frameB || S.frameB.id === S.frame.id) { toast("Choose a different second frame."); return; }
  const a = { url: renderLook(S.frame), frame: S.frame }, b = { url: renderLook(S.frameB), frame: S.frameB };
  $("#compareView").innerHTML = [a, b].map((s, i) => `<figure><img src="${s.url}" alt="Look with ${esc(s.frame.name)}"><figcaption><span><b>${i ? "B" : "A"}</b> · ${esc(s.frame.name)}</span><span style="display:flex;gap:6px"><button class="btn btn-outline btn-sm" data-k="${i}">Choose</button><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${waLink(`Hello ${STORE.shortName}, I'm deciding between "${a.frame.name}" (${a.frame.id}) and "${b.frame.name}" (${b.frame.id}). Are both available?`)}">${ICONS.whatsapp}</a></span></figcaption></figure>`).join("");
  $$("#compareView [data-k]").forEach(btn => btn.onclick = () => { selectFrame(btn.dataset.k === "1" ? b.frame : a.frame); S.frameB = null; S.compare = false; $("#tbCompare").style.background = ""; $("#cmpHint").textContent = ""; renderPicker(); $("#compareWrap").classList.add("hidden"); });
  $("#compareWrap").classList.remove("hidden"); $("#compareWrap").scrollIntoView({ behavior: "smooth", block: "nearest" });
  S.shots.unshift(a, b); S.shots = S.shots.slice(0, 9); renderShots(); track("tryon_compare");
}
function download(url, name) { const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
async function share(s) {
  const text = `Hello ${STORE.shortName}, here's my virtual try-on of the "${s.frame.name}" (${s.frame.id}, ${s.frame.colorName}). Is it available?`;
  track("tryon_share");
  try {
    const blob = await (await fetch(s.url)).blob();
    const file = new File([blob], `opticare-${s.frame.id}.png`, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; }
  } catch (e) { if (e && e.name === "AbortError") return; }
  download(s.url, `opticare-${s.frame.id}.png`);
  toast("Photo saved — attach it in the WhatsApp chat that's opening.");
  window.open(waLink(text), "_blank", "noopener");
}

/* ---------------- Init ---------------- */
renderTabs(); renderPicker(); selectFrame(S.frame); bindControls();
products.forEach(frameImage); // pre-render overlays
if (qs("mode") === "upload") setTimeout(() => toast("Choose a clear, front-facing photo to try frames on."), 600);
addEventListener("pagehide", stopStream);
// Warm up the model in the background for a faster first start
if ("requestIdleCallback" in window) requestIdleCallback(() => getLandmarker("VIDEO").then(() => setStatus("Ready", true)).catch(() => setStatus("Ready")));
