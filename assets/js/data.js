/* ==========================================================
   OPTICARE OPTICAL HOUSE — site data
   Edit this file (or use admin.html) to update store details,
   products, collections and content.

   ⚠ TO CONFIRM WITH THE STORE BEFORE LAUNCH (see README.md):
     - phone / whatsapp numbers (placeholders below)
     - opening hours (placeholder hours below)
     - prices (indicative "from" prices below)
     - products: replace with real inventory + photos / try-on PNGs
   ========================================================== */

const STORE_DEFAULTS = {
  name: "OPTICARE OPTICAL HOUSE",
  shortName: "Opticare",
  tagline: "See Better. Look Better. Live Better.",
  positioning: "Clear vision. Personal care.",
  address: "Prime Rose Building, Commercial Rd, Upper Bazar, Ooty, Tamil Nadu 643001, India",
  addressLines: ["Prime Rose Building, Commercial Road", "Upper Bazar, Ooty", "Tamil Nadu 643001"],
  // PLACEHOLDER — replace with the store's real numbers (digits only for *Raw)
  phone: "+91 00000 00000",
  phoneRaw: "910000000000",
  whatsappRaw: "910000000000",
  email: "hello@opticareooty.in", // PLACEHOLDER
  rating: 4.9,
  reviewCount: 316,
  mapQuery: "OPTICARE OPTICAL HOUSE, Prime Rose Building, Commercial Rd, Upper Bazar, Ooty, Tamil Nadu 643001",
  googleReviewUrl: "https://www.google.com/maps/search/?api=1&query=OPTICARE+OPTICAL+HOUSE+Commercial+Rd+Ooty",
  // PLACEHOLDER hours — day 0 = Sunday. [open, close] in 24h "HH:MM"; null = closed
  hours: {
    0: ["10:00", "14:00"],
    1: ["09:30", "20:30"],
    2: ["09:30", "20:30"],
    3: ["09:30", "20:30"],
    4: ["09:30", "20:30"],
    5: ["09:30", "20:30"],
    6: ["09:30", "20:30"]
  },
  announcement: "Eye testing · Contact lenses · Same-day repairs — on Commercial Road, Ooty",
  social: { instagram: "#", facebook: "#" },
  gaId: "", // Google Analytics 4 Measurement ID, e.g. "G-XXXXXXXXXX" (optional)
  slotMinutes: 30
};

const COLLECTIONS = [
  { id: "men", name: "Men's Eyewear", short: "Men's Collection", blurb: "Clean lines, confident shapes. Rectangles, browlines and timeless metal frames.", tone: "#2B2926" },
  { id: "women", name: "Women's Eyewear", short: "Women's Collection", blurb: "Cat-eyes, soft ovals and refined metals, chosen to flatter and feel weightless.", tone: "#8C5A4A" },
  { id: "kids", name: "Kids' Eyewear", short: "Kids' Collection", blurb: "Flexible, durable and comfortable frames made for school days and play.", tone: "#3E6C8C" },
  { id: "sunglasses", name: "Sunglasses", short: "Sunglasses", blurb: "UV-protective sunglasses for bright Nilgiri days, from aviators to bold wayfarers.", tone: "#1E1D1B" },
  { id: "prescription", name: "Prescription Frames", short: "Prescription Frames", blurb: "Every frame ready to be fitted with your prescription lenses.", tone: "#5A4A33" },
  { id: "premium", name: "Premium Collection", short: "Premium Collection", blurb: "Titanium, fine acetates and gold-tone details for those who want the very best.", tone: "#9C7C43" }
];

/* Real photography (Unsplash — free to use, see README "Image credits").
   Replace with the store's own photographs when available. */
const UNS = "https://images.unsplash.com/";
const U = (id, w = 900, h = 0, q = 72) => `${UNS}${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=${q}`;
const USET = (id, ratio = 0) => [480, 800, 1200, 1800].map(w => `${U(id, w, ratio ? Math.round(w * ratio) : 0)} ${w}w`).join(", ");
const IMG = {
  hero: "photo-1512099053734-e6767b535838",
  heroAlt: "photo-1581915649317-41fc6eb9597d",
  women: "photo-1485875437342-9b39470b3d95",
  women2: "photo-1750390200217-628bdc2d7651",
  men: "photo-1752486268357-e43b17dbaa23",
  men2: "photo-1568602471122-7832951cc4c5",
  kids: "photo-1593194777536-e155e6d100b2",
  kids2: "photo-1601782744132-f08f10b3343e",
  sun: "photo-1628253810344-4a33f6b14111",
  sun2: "photo-1600076280106-22cb8bd62b22",
  premium: "photo-1755869980879-1cc345f1980c",
  prescription: "photo-1486250944723-86bca2b15b06",
  wall: "photo-1759910546772-73e4bb7fdadd",
  wallGold: "photo-1544177586-c9b9fb1f45c2",
  store: "photo-1775825094939-3759ede3dec2",
  rack: "photo-1486250944723-86bca2b15b06",
  phoropter: "photo-1758656321519-02fb5f48dc7e",
  phoropterKid: "photo-1539036776273-021ec1d78bec",
  eyeChart: "photo-1758206524001-56b1b1ec72cf",
  eyeMacro: "photo-1554129353-33bf3b19fc44",
  contacts: "photo-1599243315159-faa0eac09ec1",
  detail: "photo-1786341133491-093a72b5aa8f",
  detail2: "photo-1755869980650-a021ab16279b",
  floating: "photo-1758552322632-ba288778c770",
  hills: "photo-1711553186815-8fbc95d02155",
  tea: "photo-1491497895121-1334fc14d8c9",
  train: "photo-1707655315272-33a54a771068",
  portrait: "photo-1525786210598-d527194d3e9a",
  tryModel: "photo-1554250660-d8ba2d397fed",
  shapes: "photo-1761864293845-90f7ff41739b"
};

/* Frame shapes understood by frames.js (used for the try-on overlay):
   round, oval, rectangle, square, wayfarer, cateye, aviator, geometric, browline
   img = product photo (Unsplash id) · lens: "clear" or tint hex · price = indicative "from" (₹) */
const PRODUCTS_DEFAULT = [
  { id: "oc-101", img: "photo-1646084081219-1090f72a531c", name: "Nilgiri Round", cats: ["women", "men", "prescription"], shape: "round", material: "Metal", color: "#2B2724", colorName: "Black & Gold", lens: "clear", price: 2490, style: ["classic", "minimal"], badge: "Bestseller", desc: "A delicate round metal frame with fine gold detailing — a quiet classic that suits oval and square faces." },
  { id: "oc-102", img: "photo-1556306510-31ca015374b0", name: "Commercial Rectangle", cats: ["men", "prescription"], shape: "rectangle", material: "Acetate", color: "#1E1D1B", colorName: "Gloss Black", lens: "clear", price: 1990, style: ["classic", "minimal"], desc: "A sharp, everyday rectangle in polished black acetate. Pairs perfectly with progressive lenses." },
  { id: "oc-103", img: "photo-1760446031441-65f456460d59", name: "Lovedale Cat-Eye", cats: ["women", "prescription", "premium"], shape: "cateye", material: "Acetate", color: "#6B3E22", colorName: "Amber Tortoise", lens: "clear", price: 3290, style: ["bold", "vintage"], badge: "New", desc: "An upswept cat-eye in rich amber tortoiseshell that lifts the face with effortless elegance." },
  { id: "oc-104", img: "photo-1589642380614-4a8c2147b857", name: "Doddabetta Aviator", cats: ["sunglasses", "men", "women"], shape: "aviator", material: "Metal", color: "#B8975A", colorName: "Gold / Brown", lens: "#5A4632", price: 2990, style: ["classic", "sporty"], badge: "UV400", desc: "The iconic double-bridge aviator in gold-tone metal with warm brown UV-protective lenses." },
  { id: "oc-105", img: "photo-1653038282189-803202722a05", name: "Botanical Square Sun", cats: ["sunglasses", "men"], shape: "wayfarer", material: "Acetate", color: "#2E3A33", colorName: "Smoke Green", lens: "#2A302C", price: 2490, style: ["bold", "classic"], desc: "A bold, squared sunglass with dark UV lenses — made for bright hill-station afternoons." },
  { id: "oc-106", img: "photo-1606218601901-235b7b694d12", name: "Emerald Lake Oval", cats: ["women", "prescription"], shape: "oval", material: "Metal", color: "#9AA3A8", colorName: "Silver", lens: "clear", price: 2190, style: ["minimal", "classic"], desc: "A soft oval in fine silver metal. Light, discreet and comfortable all day." },
  { id: "oc-107", img: "photo-1574258495973-f010dfbb5371", name: "Heritage Browline", cats: ["men", "prescription", "premium"], shape: "browline", material: "Acetate & Metal", color: "#3B2A20", colorName: "Tortoise / Silver", lens: "clear", price: 3490, style: ["vintage", "bold"], badge: "Premium", desc: "A browline with a tortoise upper bar and a metal rim — scholarly, distinguished, unmistakable." },
  { id: "oc-108", img: "photo-1647480674766-7fff4ae8becc", name: "Avalanche Square", cats: ["men", "women", "prescription"], shape: "square", material: "Acetate", color: "#6E4B32", colorName: "Havana Tortoise", lens: "clear", price: 2690, style: ["bold"], desc: "A generous square in warm havana tortoise for a confident, fashion-forward look." },
  { id: "oc-109", img: "photo-1614715838608-dd527c46231d", name: "Pykara Geometric", cats: ["women", "men", "premium", "prescription"], shape: "geometric", material: "Titanium", color: "#A7ADB2", colorName: "Brushed Silver", lens: "clear", price: 4490, style: ["minimal", "bold"], badge: "Titanium", desc: "Ultra-light titanium in a modern geometric silhouette. Hypoallergenic and almost weightless." },
  { id: "oc-110", img: "photo-1769414017326-6ea5d70f7884", name: "Little Explorer", cats: ["kids", "prescription"], shape: "round", material: "Flexible TR90", color: "#2B2B2B", colorName: "Black / Crystal", lens: "clear", price: 1490, style: ["sporty"], desc: "A bendable, durable frame for kids, with soft nose pads and spring hinges." },
  { id: "oc-111", img: "photo-1591843336309-cbf414ad7978", name: "Tiny Scholar", cats: ["kids", "prescription"], shape: "rectangle", material: "Flexible TR90", color: "#1E1D1B", colorName: "Black", lens: "clear", price: 1390, style: ["sporty", "classic"], desc: "A sturdy little rectangle that survives the school bag — easy to clean, hard to break." },
  { id: "oc-112", img: "photo-1760446031507-ed534e0f9605", name: "Rose Garden Cat-Eye Sun", cats: ["sunglasses", "women", "premium"], shape: "cateye", material: "Acetate", color: "#5A3420", colorName: "Tortoise / Gold", lens: "#3B2A22", price: 3190, style: ["bold", "vintage"], desc: "A glamorous tortoiseshell cat-eye sunglass with gold accents and brown UV lenses." },
  { id: "oc-113", img: "photo-1511499767150-a48a237f0083", name: "Tea Estate Round Sun", cats: ["sunglasses", "women", "men"], shape: "round", material: "Metal", color: "#B8975A", colorName: "Gold / Green", lens: "#3E4A3E", price: 1990, style: ["vintage", "minimal"], desc: "A slim round gold sunglass with classic green UV lenses." },
  { id: "oc-114", img: "photo-1619089662706-11b2f8542913", name: "Upper Bazar Classic", cats: ["men", "women", "prescription"], shape: "wayfarer", material: "Acetate", color: "#3A2C24", colorName: "Espresso", lens: "clear", price: 1890, style: ["classic"], desc: "Our everyday optical frame in a deep espresso — easy to wear, easy to love." },
  { id: "oc-115", img: "photo-1755869980879-1cc345f1980c", name: "Mist Titanium Rimline", cats: ["men", "premium", "prescription"], shape: "rectangle", material: "Titanium", color: "#C2A167", colorName: "Polished Gold", lens: "clear", price: 4990, style: ["minimal"], badge: "Premium", desc: "A slim gold titanium rectangle — the executive's frame. Featherlight, strong, refined." },
  { id: "oc-116", img: "photo-1658690299170-bf1c6f8e312f", name: "Coonoor Kids Round", cats: ["kids", "prescription"], shape: "round", material: "Flexible TR90", color: "#C99A86", colorName: "Blush Tortoise", lens: "clear", price: 1390, style: ["minimal"], desc: "A soft blush-tortoise round for younger faces, with a comfortable flexible fit." },
  { id: "oc-117", img: "photo-1608539733292-190446b22b83", name: "Summit Sport Square", cats: ["sunglasses", "men"], shape: "square", material: "TR90", color: "#1E1D1B", colorName: "Matte Black", lens: "#1F2226", price: 2290, style: ["sporty", "bold"], desc: "A lightweight square sunglass for treks and road trips — polarised-ready UV lenses." },
  { id: "oc-118", img: "photo-1747731141445-7656d7467969", name: "Golden Hour Aviator", cats: ["women", "sunglasses", "premium"], shape: "aviator", material: "Metal", color: "#D2A6A0", colorName: "Rose Gold / Pink", lens: "#C98F96", price: 3590, style: ["vintage", "bold"], desc: "A fashion aviator in rose-gold metal with soft pink tinted lenses." },
  { id: "oc-119", img: "photo-1577803645773-f96470509666", name: "Ivory Butterfly", cats: ["sunglasses", "women", "premium"], shape: "square", material: "Acetate", color: "#E8DCCB", colorName: "Ivory / Brown", lens: "#5A4535", price: 3390, style: ["bold"], badge: "New", desc: "An oversized butterfly sunglass in ivory acetate with brown gradient UV lenses." },
  { id: "oc-120", img: "photo-1768297087581-4a7691122b10", name: "Charing Cross Cat-Eye", cats: ["women", "prescription", "premium"], shape: "cateye", material: "Acetate & Metal", color: "#1E1D1B", colorName: "Black & Gold", lens: "clear", price: 3790, style: ["bold", "vintage"], desc: "A dramatic black cat-eye with gold metal temples — evening-ready elegance." },
  { id: "oc-121", img: "photo-1603578119639-798b8413d8d7", name: "Havana Round", cats: ["men", "women", "prescription"], shape: "round", material: "Acetate", color: "#7A4A2A", colorName: "Havana", lens: "clear", price: 2290, style: ["vintage", "classic"], desc: "A warm tortoiseshell round in hand-polished acetate — scholarly and friendly." },
  { id: "oc-122", img: "photo-1755869963461-9d002b4d9ad5", name: "Sunset Gradient Sun", cats: ["sunglasses", "women"], shape: "round", material: "Acetate", color: "#1E1D1B", colorName: "Black / Gradient", lens: "#3A3240", price: 2190, style: ["bold", "minimal"], desc: "A sleek black sunglass with smoky gradient UV lenses." },
  { id: "oc-123", img: "photo-1567473810954-507d59716c25", name: "Lake Gradient Aviator", cats: ["sunglasses", "men", "women"], shape: "aviator", material: "Metal", color: "#9AA3A8", colorName: "Silver / Gradient", lens: "#4A4F55", price: 2790, style: ["classic", "sporty"], desc: "A silver-tone aviator with grey gradient UV lenses — timeless and light." },
  { id: "oc-124", img: "photo-1606357086272-eab87f3db598", name: "Botanist Round Metal", cats: ["men", "women", "prescription"], shape: "round", material: "Metal", color: "#1E1D1B", colorName: "Matte Black", lens: "clear", price: 1790, style: ["minimal", "vintage"], desc: "A featherweight round in thin black metal — the intellectual's favourite." }
];

const LENSES = [
  { id: "single", name: "Single-Vision Lenses", tag: "Everyday", desc: "One prescription across the whole lens — for distance, computer or reading.", points: ["Distance, near or intermediate", "Thin & lightweight high-index options", "Anti-glare and scratch-resistant coatings"] },
  { id: "progressive", name: "Progressive Lenses", tag: "Multifocal", desc: "Seamless clear vision at every distance, with no visible line.", points: ["Near, intermediate and far in one lens", "Careful fitting and centration", "Adaptation guidance and follow-up"] },
  { id: "bluelight", name: "Blue-Light Filtering", tag: "Digital", desc: "Lens coatings that filter part of the blue-violet light from screens.", points: ["Popular for long screen hours", "Combined with anti-reflective coating", "Available on plano and prescription lenses"] },
  { id: "photochromic", name: "Photochromic Lenses", tag: "Indoor + Outdoor", desc: "Clear indoors, tinted outdoors — ideal for bright mountain sun.", points: ["Automatically darken with UV", "Reduce the need for separate sunglasses", "UV protection built in"] },
  { id: "contacts", name: "Contact Lenses", tag: "Ordering support", desc: "Daily, monthly and toric contact lenses with ordering support.", points: ["Daily & monthly disposables", "Toric options for astigmatism", "Re-order support & solutions"] },
  { id: "sun-rx", name: "Prescription Sunglasses", tag: "Sun + Rx", desc: "Your prescription in tinted, gradient or polarised sun lenses.", points: ["Tinted, gradient & polarised options", "UV protection", "Fitted into most sunglass frames"] }
];

const SERVICES = [
  { id: "eye-test", icon: "eye", name: "Eye Testing", desc: "Vision testing and clear prescription guidance in store." },
  { id: "repairs", icon: "tool", name: "Quick Repairs & Adjustments", desc: "Loose screws, nose pads, temple adjustments and frame fitting." },
  { id: "fast", icon: "bolt", name: "Fast Prescription Turnaround", desc: "Customers report prescription glasses ready in as little as five hours, depending on the lens." },
  { id: "contacts", icon: "drop", name: "Contact Lens Ordering", desc: "Help with choosing, ordering and re-ordering contact lenses." },
  { id: "styling", icon: "spark", name: "Personal Frame Styling", desc: "Honest advice on shapes, colours and fit for your face." },
  { id: "delivery", icon: "box", name: "Delivery Enquiries", desc: "Ask us about local delivery and courier options for your order." }
];

/* Review themes summarised from the public listing (no invented names or quotes).
   Add real, permissioned reviews from the admin dashboard (Reviews tab). */
const REVIEW_THEMES = [
  { icon: "frame", title: "A wide collection of frames", text: "Customers often mention the large variety of spectacle frames and sunglasses to choose from." },
  { icon: "bolt", title: "Remarkably fast service", text: "A visiting traveller reported receiving prescription glasses within about five hours." },
  { icon: "users", title: "Helpful, professional staff", text: "Reviewers highlight patient, friendly guidance when choosing frames and lenses." },
  { icon: "tool", title: "Quick repairs & adjustments", text: "Urgent eyewear problems — loose screws, broken pads, adjustments — handled quickly." },
  { icon: "tag", title: "Reasonable pricing", text: "Good product quality at fair prices is a recurring theme in feedback." },
  { icon: "eye", title: "Eye testing & guidance", text: "Customers value clear eye testing and prescription advice in store." }
];

const FAQS = [
  { q: "Do you offer eye testing in Ooty?", a: "Yes. We provide eye testing and prescription guidance at our Commercial Road showroom. You can request a time on the Eye Testing page or simply walk in." },
  { q: "How quickly can I get prescription glasses?", a: "It depends on your lens type. Many single-vision prescriptions can be completed quickly — a travelling customer reported receiving glasses in about five hours. Progressive and special lenses may take longer. Ask us on WhatsApp for an estimate." },
  { q: "Can you repair my broken spectacles?", a: "We handle loose screws, nose-pad replacement, temple adjustments and many minor frame repairs, often while you wait. Send a photo through the repair request form for a quick assessment." },
  { q: "Do you sell contact lenses?", a: "Yes — we support ordering of daily, monthly and toric contact lenses, and solutions. A valid prescription is required." },
  { q: "Is the virtual try-on accurate?", a: "The virtual try-on is a preview to help you shortlist styles. Real size, fit and colour can vary — we always recommend a final fitting in store." },
  { q: "Does the virtual try-on upload my photo?", a: "No. Camera and photo processing happen locally in your browser. Nothing is uploaded unless you choose to share a captured photo yourself." },
  { q: "Do you deliver outside Ooty?", a: "Please send us a delivery enquiry. We'll let you know what local delivery or courier options are available for your order." }
];

/* ---------------- Local data layer ----------------
   Demo persistence in this browser's localStorage. For production,
   move to a backend (e.g. Supabase) — see README.md. */
const DB = {
  k: k => "oc_" + k,
  get(key, fallback) {
    try { const v = localStorage.getItem(this.k(key)); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(this.k(key), JSON.stringify(val)); return true; } catch (e) { return false; }
  },
  push(key, item) {
    const list = this.get(key, []);
    item.id = item.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
    item.createdAt = item.createdAt || new Date().toISOString();
    list.unshift(item); this.set(key, list); return item;
  }
};

const STORE = Object.assign({}, STORE_DEFAULTS, DB.get("store", {}));
const getProducts = () => DB.get("products", null) || PRODUCTS_DEFAULT;
const getCollections = () => { const o = DB.get("collections", null); return o || COLLECTIONS; };
const getReviews = () => DB.get("reviews", []).filter(r => r.published);
