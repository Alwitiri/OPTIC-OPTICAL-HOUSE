# OPTICARE OPTICAL HOUSE — Website

Premium eyewear website for **Opticare Optical House**, Prime Rose Building, Commercial Rd, Upper Bazar, Ooty 643001.
*See Better. Look Better. Live Better.*

A fast, dependency-free static site (HTML + CSS + vanilla JS). It deploys anywhere, including Render, Netlify, Vercel or GitHub Pages, with no build step.

## Pages

| # | Page | File | Main SEO keyword |
|---|------|------|------------------|
| 01 | Home | `index.html` | Best optical shop in Ooty |
| 02 | Our Collections + Frame Finder | `collections.html` (`?c=men` / `women` / `kids` / `sunglasses` / `prescription` / `premium`) | Spectacle frames in Ooty |
| 03 | Lenses & Vision Care + Contact Lenses | `lenses.html` | Prescription lenses in Ooty |
| 04 | Eye Testing | `eye-testing.html` | Eye testing in Ooty |
| + | **Appointment booking** (4-step wizard: service → date & time → details → confirm ticket) | `appointment.html` (`?service=eye-test` / `kids` / `contacts` / `styling` / `progressive` / `repair`) | Book eye test Ooty |
| 05 | About Us | `about.html` | — |
| 06 | Customer Reviews | `reviews.html` | — |
| 07 | Contact & Visit Us | `contact.html` | Opticare Optical House Ooty |
| + | **Virtual Try-On Studio** | `try-on.html` | — |
| + | Product detail | `product.html?id=oc-101` | — |
| + | Repairs / Prescription / Delivery / Frame consultation | `services.html` | Spectacle repair in Ooty |
| + | Admin dashboard (demo) | `admin.html` | noindex |

## Features
- **Premium showroom design.** Ivory, charcoal and champagne-gold colours with Cormorant Garamond and Manrope fonts. Includes smooth fades, subtle parallax on the hills in the hero, hover transitions and a mobile-first layout.
- **WhatsApp everywhere.** A floating button, a WhatsApp enquiry link on every product, and every form opens WhatsApp with the details filled in.
- **Click-to-call, Google Maps embed and directions.**
- **Live open/closed status** worked out from the opening hours.
- **Frame Finder.** Filter by collection, optical or sun, face shape, frame shape, material, style and budget. Also has search and sorting.
- **Eye-test booking.** 30-minute slots based on the opening hours, with double-booking blocked. The request is sent on WhatsApp and the customer can download a calendar (.ics) file.
- **Enquiry forms.** Repair request (with photo), prescription enquiry (with photo of the prescription), delivery enquiry, and virtual frame consultation (with face photo).
- **Chat assistant.** A rule-based helper that works offline: hours, location, eye tests, repairs, contact lenses, try-on, prices, delivery.
- **Reviews.** The page summarises themes from the public Google reviews. You add real reviews and customer photos (with permission) from the admin. Feedback sent through the website is moderated before it appears.
- **Local SEO.** Each page has its own title, meta description and keywords. Includes structured data (`Optician`/LocalBusiness, `Service`, and `Product` on product pages), `sitemap.xml`, `robots.txt`, Open Graph tags, image alt text, and a single `<h1>` per page.

## Virtual Eyewear Try-On (`try-on.html`, `assets/js/tryon.js`)
1. The customer clicks **Try On With Camera**. First a screen explains how the camera is used and that it stays private, then the browser asks for permission.
2. **MediaPipe Face Landmarker** (`@mediapipe/tasks-vision@0.10.14`) finds 478 facial landmarks, including the irises.
3. The selected frame is placed using the eye and iris centres, the nose bridge and the width of the face. It follows head tilt (roll) and is compressed sideways when the head turns (yaw). Movement is smoothed so it doesn't jitter.
4. Customers can switch frames by category (Classic, Round, Cat-Eye, Sunglasses, Premium) and adjust size, height and side-to-side position. They can drag the frame by hand, which is useful when no face is detected.
5. **Compare two frames**: renders the same moment with frame A and frame B side by side.
6. **Capture** saves a watermarked "Virtual preview" photo. **Share look** uses the phone's share sheet on mobile. On other devices it downloads the photo and opens WhatsApp.
7. **Upload a photo** works as an alternative to the camera.

**Privacy:** all camera and photo processing happens in the browser. Nothing is uploaded. The page loads only the MediaPipe library (jsDelivr) and its model file (storage.googleapis.com).
The try-on needs **HTTPS** (Render provides it) or `localhost`.

**Using the shop's real frames.** By default each frame is drawn as a vector image from its shape, colour and material settings. For accurate results, open **Admin → Products → Edit** and upload:
- a **product photo**, which is used on the cards and product page, and
- a **try-on overlay**: a transparent PNG of the frame from the front, cropped tightly from temple to temple, with the lens centres at the vertical middle.

**Upgrading to 3D later:** turn on `outputFacialTransformationMatrixes`, then render GLB models with Three.js, replacing `drawFrame()`.

## ⚠ Confirm before launch
Everything below is set in `assets/js/data.js`. You can also change most of it from **Admin → Store info**, but changes made there only apply in that one browser.
- [ ] **Phone and WhatsApp numbers.** They are placeholders right now (`+91 00000 00000`). WhatsApp links won't reach the store until they're replaced.
- [ ] **Opening hours.** These are placeholders too.
- [ ] **Email address.** Placeholder.
- [ ] **Products and prices.** These are sample frames with indicative "from" prices. Replace them with the real inventory and photos.
- [ ] **Store photographs, logo and team.** Every spot to change is labelled "to be replaced" or `<!-- EDIT -->`.
- [ ] **Store history** in `about.html`.
- [ ] **Permission** to feature any customer reviews or photos.
- [ ] **Domain.** Replace `opticare-optical-house.onrender.com` in `sitemap.xml` and `robots.txt`.
- [ ] **Google Analytics 4 (optional).** Set `gaId: "G-XXXXXXX"` in `data.js`.
- [ ] **Search engines.** Submit the sitemap in Google Search Console and link the site from the Google Business Profile.

## Admin dashboard (`admin.html`)
Demo login: **admin / opticare-demo**

What it can do: add, edit and delete products, upload photos and try-on PNGs, change prices and collections, manage enquiries and appointments (statuses, WhatsApp reply, CSV export), moderate reviews, add customer photos, edit store info and opening hours, and view basic analytics.

> **Demo only.** Data lives in the browser's `localStorage` and the login runs entirely in the browser, so it is **not secure**. Each device sees only its own data.
> **Phase 2 (recommended):** move the products, enquiries and appointments tables, image storage and staff login to **Supabase** (Postgres + Storage + Auth with row-level security). The `DB` object in `data.js` is the only place that needs to change.

## Run locally
```bash
npx serve .
```
Or open any `.html` file directly. The camera needs `http://localhost` or HTTPS.

## Deploy on Render
1. Push this folder to a GitHub repository.
2. In Render, create a **Static Site** from the repo. `render.yaml` is already set up: no build command, publish directory `.`.
3. Add a custom domain and update the sitemap and robots files.

## Photography & image credits
The site now uses real photography served from Unsplash's image CDN (`images.unsplash.com`, responsive sizes via `srcset`). Unsplash images are free to use commercially under the [Unsplash License](https://unsplash.com/license); attribution is appreciated but not required.
- **Product photos** (`img` field on each product in `assets/js/data.js`) are *representative stock photos* of each style — not Opticare's own inventory. Replace each with a photo of the actual frame: Admin → Products → Edit → *Product photo*, or set `img`/`photo` in `data.js`.
- **Lifestyle / page photos** are listed in the `IMG` object in `data.js` (hero, collections, showroom, eye test, Ooty). Swap any id for the store's own photography.
- Brand-logo shots were deliberately avoided so no third-party brand is implied.
- The **try-on overlay** is drawn to match each product's shape and colour. For photo-exact try-on, upload a transparent front-view PNG per frame (Admin → Products → *Try-on overlay*).
