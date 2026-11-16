/* ==========================================================
   Appointment booking wizard
   Service → Date & time → Details → Confirm → Ticket
   Saves to the local data layer (admin "Appointments") and
   sends the request to the store on WhatsApp for confirmation.
   ========================================================== */
(function () {
  const SERVICES_BK = [
    { id: "eye-test", name: "Eye Test", desc: "Vision check and prescription guidance for spectacles.", mins: 30, img: "photo-1758206524001-56b1b1ec72cf" },
    { id: "contacts", name: "Contact Lens Consultation", desc: "Fitting advice, trial and ordering support.", mins: 30, img: "photo-1599243315159-faa0eac09ec1" },
    { id: "kids", name: "Kids' Eye Test", desc: "A gentle, friendly check for children.", mins: 30, img: "photo-1593194777536-e155e6d100b2" },
    { id: "styling", name: "Frame Styling Session", desc: "Personal help choosing frames for your face.", mins: 30, img: "photo-1750390200217-628bdc2d7651" },
    { id: "progressive", name: "Progressive Lens Fitting", desc: "Measurements and advice for multifocal lenses.", mins: 30, img: "photo-1755869980650-a021ab16279b" },
    { id: "repair", name: "Repair & Adjustment", desc: "Screws, nose pads, fitting and minor repairs.", mins: 15, img: "photo-1786341133491-093a72b5aa8f" }
  ];
  const B = { step: 1, service: null, date: "", time: "", details: {}, dayOffset: 0, appt: null };
  const DAYS_AHEAD = 28;

  const toM = t => { const [a, b] = t.split(":").map(Number); return a * 60 + b; };
  function slotsFor(ds) {
    const d = new Date(ds + "T00:00"); const h = STORE.hours[d.getDay()]; if (!h) return [];
    const step = STORE.slotMinutes || 30;
    const taken = DB.get("appointments", []).filter(a => a.date === ds && a.status !== "Cancelled").map(a => a.time);
    const nowM = ds === isoDate(new Date()) ? new Date().getHours() * 60 + new Date().getMinutes() + 45 : -1;
    const out = [];
    for (let m = toM(h[0]); m + step <= toM(h[1]); m += step) { const t = pad(Math.floor(m / 60)) + ":" + pad(m % 60); if (m > nowM) out.push({ t, m, taken: taken.includes(t) }); }
    return out;
  }
  const dateList = () => Array.from({ length: DAYS_AHEAD }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });

  /* ---------- Step 1 ---------- */
  function renderServices() {
    $("#svcGrid").innerHTML = SERVICES_BK.map(s => `<button type="button" class="svc-card ${B.service?.id === s.id ? "on" : ""}" data-id="${s.id}" aria-pressed="${B.service?.id === s.id}">
      <span class="sc-img"><img src="${U(s.img, 260, 300)}&crop=faces,center" alt="" loading="lazy"></span>
      <span class="sc-body"><b>${esc(s.name)}</b><p>${esc(s.desc)}</p><span class="sc-meta">${ICONS.clock.replace("<svg", '<svg style="width:13px;height:13px"')} ${s.mins} min</span></span>
      <span class="sc-check">${I('<path d="M5 12l5 5 9-10"/>', 'stroke-width="3"')}</span></button>`).join("");
    $$("#svcGrid .svc-card").forEach(b => b.onclick = () => { B.service = SERVICES_BK.find(s => s.id === b.dataset.id); renderServices(); updateSummary(); updateNav(); setTimeout(() => go(2), 280); });
  }

  /* ---------- Step 2 ---------- */
  function renderDays() {
    const today = isoDate(new Date());
    $("#dayStrip").innerHTML = dateList().map(d => {
      const ds = isoDate(d); const free = slotsFor(ds).filter(s => !s.taken).length; const closed = !STORE.hours[d.getDay()] || !free;
      return `<button type="button" class="day ${B.date === ds ? "on" : ""}" data-d="${ds}" ${closed ? "disabled" : ""} role="option" aria-selected="${B.date === ds}">${ds === today ? '<i class="today-dot" title="Today"></i>' : ""}<small>${d.toLocaleDateString("en-IN", { weekday: "short" })}</small><b>${d.getDate()}</b><em>${closed ? "Closed" : free + " free"}</em></button>`;
    }).join("");
    $$("#dayStrip .day").forEach(b => b.onclick = () => { B.date = b.dataset.d; B.time = ""; renderDays(); renderSlots(); updateSummary(); updateNav(); });
    const first = B.date ? new Date(B.date + "T00:00") : new Date();
    $("#monthLabel").textContent = first.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  }
  function renderSlots() {
    if (!B.date) { $("#slotGroups").innerHTML = `<div class="no-slots">Choose a date to see available times.</div>`; return; }
    const s = slotsFor(B.date);
    const groups = [["Morning", "before 12 PM", x => x.m < 720], ["Afternoon", "12 – 5 PM", x => x.m >= 720 && x.m < 1020], ["Evening", "after 5 PM", x => x.m >= 1020]];
    const html = groups.map(([g, sub, f]) => { const list = s.filter(f); if (!list.length) return ""; return `<div class="slot-group"><h5>${ICONS.clock}${g} <small>${sub} · ${list.filter(x => !x.taken).length} available</small></h5><div class="slots">${list.map(x => `<button type="button" class="slot ${B.time === x.t ? "sel" : ""}" data-t="${x.t}" ${x.taken ? "disabled" : ""}>${fmtTime(x.t)}</button>`).join("")}</div></div>`; }).join("");
    $("#slotGroups").innerHTML = html || `<div class="no-slots">No times left on this day — please pick another date.</div>`;
    $$("#slotGroups .slot").forEach(b => b.onclick = () => { B.time = b.dataset.t; renderSlots(); updateSummary(); updateNav(); });
  }

  /* ---------- Step 3 ---------- */
  function readDetails() {
    const f = $("#bkForm"); const d = Object.fromEntries(new FormData(f));
    $$(".seg", f).forEach(sg => d[sg.dataset.name] = $(".on", sg)?.textContent || "");
    d.consent = !!f.querySelector("[name=consent]").checked; return d;
  }
  function validateDetails() {
    const d = readDetails(); const err = $("#bkErr");
    const fail = m => { err.textContent = m; err.classList.remove("hidden"); return false; };
    if (!d.name.trim()) return fail("Please enter your name.");
    if (!validPhone(d.phone)) return fail("Please enter a valid 10-digit Indian mobile number.");
    if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return fail("Please check your email address.");
    if (!d.consent) return fail("Please tick the box so we can contact you about this appointment.");
    err.classList.add("hidden"); B.details = d; return true;
  }

  /* ---------- Step 4 ---------- */
  function renderReview() {
    const d = B.details;
    const rows = [["Service", `${B.service.name} · ${B.service.mins} min`, 1], ["Date", fmtDate(B.date), 2], ["Time", fmtTime(B.time), 2], ["Name", d.name, 3], ["Mobile", d.phone, 3], ["For", `${d.forWhom}${d.age ? " · " + d.age : ""}`, 3], ["Currently wears", d.wears, 3], ["Confirm via", d.contactVia, 3]];
    if (d.notes) rows.push(["Notes", d.notes, 3]);
    $("#reviewBox").innerHTML = rows.map(([k, v, s]) => `<div class="review-row"><span>${k}</span><b>${esc(v)}</b><button type="button" data-go="${s}">Edit</button></div>`).join("");
    $$("#reviewBox [data-go]").forEach(b => b.onclick = () => go(+b.dataset.go));
  }

  /* ---------- Submit ---------- */
  function submit() {
    const d = B.details;
    // Re-check the slot is still free
    if (slotsFor(B.date).find(s => s.t === B.time)?.taken) { toast("Sorry, that time was just taken — please choose another."); B.time = ""; go(2); return; }
    const appt = DB.push("appointments", { name: d.name.trim(), phone: d.phone.trim(), email: d.email || "", date: B.date, time: B.time, reason: B.service.name, forWhom: d.forWhom, age: d.age, wears: d.wears, contactVia: d.contactVia, notes: d.notes || "", status: "Requested" });
    B.appt = appt; track("appointment");
    const ref = "OC-" + appt.id.slice(-6).toUpperCase();
    const text = `Hello ${STORE.shortName}, I'd like to book an appointment.\n\n` +
      `Service: ${B.service.name}\nDate: ${fmtDate(B.date)}\nTime: ${fmtTime(B.time)}\nName: ${d.name}\nMobile: ${d.phone}\nFor: ${d.forWhom} (${d.age})\nCurrently wears: ${d.wears}${d.notes ? "\nNotes: " + d.notes : ""}\nRef: ${ref}`;
    $("#bkDone").innerHTML = `
      <div class="done-head"><span class="ok">${I('<path d="M5 12l5 5 9-10"/>', 'stroke-width="2.6"')}</span><div><h2 class="bk-title" style="margin:0">Almost done, ${esc(d.name.split(" ")[0])}!</h2><p class="muted" style="margin:4px 0 0">Send your request on WhatsApp so our team can confirm your slot.</p></div></div>
      <div class="ticket"><div class="t-main"><small>Opticare Optical House · Ooty</small><h3>${esc(B.service.name)}</h3>
        <div class="t-grid"><div><span>Date</span><b>${fmtDate(B.date)}</b></div><div><span>Time</span><b>${fmtTime(B.time)}</b></div><div><span>Name</span><b>${esc(d.name)}</b></div><div><span>Where</span><b>Prime Rose Bldg, Commercial Rd</b></div></div></div>
        <div class="t-stub"><span>Reference</span><b>${ref}</b><span class="pend">Awaiting confirmation</span></div></div>
      <div class="btn-row"><a class="btn btn-wa" id="sendWa" href="${waLink(text)}" target="_blank" rel="noopener">${ICONS.whatsapp} Send on WhatsApp</a><button class="btn btn-outline" id="addCal" type="button">${ICONS.cal} Add to calendar</button><a class="btn btn-outline" href="${mapDir()}" target="_blank" rel="noopener">${ICONS.pin} Directions</a></div>
      <ol class="next-steps"><li>Tap <b>Send on WhatsApp</b> — your details are already filled in.</li><li>Our team replies to confirm (or suggest another time).</li><li>Arrive 5 minutes early with your current glasses.</li></ol>
      <p style="margin-top:24px"><button class="link-arrow" type="button" id="bookAnother" style="background:none;border:0;border-bottom:1px solid">Book another appointment ${ICONS.arrow}</button></p>`;
    hydrateIcons($("#bkDone"));
    $("#addCal").onclick = () => ics(appt, ref);
    $("#bookAnother").onclick = () => { Object.assign(B, { step: 1, service: null, date: "", time: "", details: {}, appt: null }); $("#bkForm").reset(); init(); };
    go(5);
  }
  function ics(a, ref) {
    const s = new Date(a.date + "T" + a.time); const e = new Date(s.getTime() + (B.service?.mins || 30) * 60000);
    const f = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Opticare//Booking//EN", "BEGIN:VEVENT", `UID:${a.id}@opticare`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(s)}`, `DTEND:${f(e)}`, `SUMMARY:${a.reason} – Opticare Optical House`, `LOCATION:${STORE.address.replace(/,/g, "\\,")}`, `DESCRIPTION:Ref ${ref}. Pending confirmation from the store.`, "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Opticare appointment", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" })); const l = document.createElement("a"); l.href = url; l.download = "opticare-appointment.ics"; l.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------- Summary + navigation ---------- */
  function updateSummary() {
    const v = (x, ph) => x ? `<b>${esc(x)}</b>` : `<b class="empty-v">${ph}</b>`;
    $("#sumList").innerHTML = `
      <li><span>${ICONS.eye}</span><div><small>Service</small>${v(B.service && `${B.service.name} · ${B.service.mins} min`, "Not selected")}</div></li>
      <li><span>${ICONS.cal}</span><div><small>Date</small>${v(B.date && fmtDate(B.date), "Choose a date")}</div></li>
      <li><span>${ICONS.clock}</span><div><small>Time</small>${v(B.time && fmtTime(B.time), "Choose a time")}</div></li>
      <li><span>${ICONS.users}</span><div><small>Name</small>${v(B.details.name, "Your details")}</div></li>`;
  }
  const canNext = () => ({ 1: !!B.service, 2: !!(B.date && B.time), 3: true, 4: true }[B.step]);
  function updateNav() {
    const nav = $("#bkNav"); nav.classList.toggle("hidden", B.step === 5);
    $("#bkBack").style.visibility = B.step > 1 ? "visible" : "hidden";
    const next = $("#bkNext"); next.disabled = !canNext();
    next.innerHTML = B.step === 4 ? `Confirm booking ${ICONS.arrow}` : `Continue ${ICONS.arrow}`;
    next.className = "btn " + (B.step === 4 ? "btn-gold" : "btn-dark");
  }
  function go(n) {
    if (n === 2 && !B.service) return;
    if (n >= 3 && !(B.date && B.time)) n = 2;
    if (n === 4 && !validateDetails()) n = 3;
    B.step = n;
    $$(".bk-step").forEach(s => s.classList.toggle("hidden", +s.dataset.step !== n));
    $$("#bkSteps li").forEach(li => { const s = +li.dataset.s; li.classList.toggle("cur", s === n); li.classList.toggle("done", s < n || n === 5); });
    $("#bkBar").style.width = Math.min(100, n * 25) + "%";
    if (n === 2) { renderDays(); renderSlots(); }
    if (n === 4) renderReview();
    updateNav(); updateSummary();
    const top = $(".bk-main").getBoundingClientRect().top + scrollY - 100; if (scrollY > top) scrollTo({ top, behavior: "smooth" });
  }
  function init() {
    renderServices();
    const pre = qs("service"); if (pre) B.service = SERVICES_BK.find(s => s.id === pre) || null;
    // preselect first available date
    for (const d of dateList()) { const ds = isoDate(d); if (slotsFor(ds).some(s => !s.taken)) { B.date = ds; break; } }
    go(B.service ? 2 : 1);
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#bkNext").onclick = () => B.step === 4 ? submit() : go(B.step + 1);
    $("#bkBack").onclick = () => go(Math.max(1, B.step - 1));
    $$("#bkSteps li").forEach(li => li.onclick = () => { const s = +li.dataset.s; if (s < B.step && B.step !== 5) go(s); });
    $("#dayNext").onclick = () => $("#dayStrip").scrollBy({ left: $("#dayStrip").clientWidth, behavior: "smooth" });
    $("#dayPrev").onclick = () => $("#dayStrip").scrollBy({ left: -$("#dayStrip").clientWidth, behavior: "smooth" });
    $$("#bkForm .seg").forEach(sg => $$("button", sg).forEach(b => b.onclick = () => { $$("button", sg).forEach(x => x.classList.toggle("on", x === b)); }));
    $("#bkForm").addEventListener("input", () => { B.details.name = $("#bkForm [name=name]").value; updateSummary(); });
    $("#bkForm").onsubmit = e => { e.preventDefault(); go(4); };
    $("#sideImg").src = U(IMG.wall, 760, 428);
    const st = openStatus(); const pill = $("#sidePill"); pill.className = "open-pill " + (st.open ? "open" : "closed"); pill.innerHTML = `<i></i>${esc(st.text)}`;
    $("#bkFaq").innerHTML = faqHTML([FAQS[0], FAQS[1], { q: "Can I reschedule or cancel?", a: "Of course. Just reply to our WhatsApp confirmation message or call the store, and we'll move or cancel your appointment." }, { q: "Do I need an appointment?", a: "Walk-ins are always welcome. Booking simply guarantees a time and helps us prepare for your visit." }]);
    initAccordions($("#bkFaq"));
    init();
  });
})();
