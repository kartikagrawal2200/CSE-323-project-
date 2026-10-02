# AeroSim Aviation – Airport Baggage Handling Simulator

An authentic, fully responsive, multi-page web application modeling the end-to-end journey of commercial airline baggage from initial passenger check-in to carousel baggage claim. Built purely with modern **HTML5, Vanilla CSS3, and Vanilla JavaScript (ES6+)** with zero external dependencies, build tools, or server requirements.

---

## 🚀 Quick Start / How to Run

1. **No installation, no Node.js, and no build tools needed.**
2. Double-click or open `index.html` directly in any standard desktop or mobile web browser (Chrome, Edge, Firefox, Safari).
3. Alternatively, serve via any lightweight static server:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```

---

## 🔑 Demo Access & Seed Credentials

### Demo User Account
* **User ID / Username:** `User2244`
* **Password:** `password123`
*(Stored securely in `localStorage` using Web Cryptography API SHA-256 password hashing)*

### Active Baggage Simulation Tags
You can track any of these seeded tags on the **Home** or **Track Baggage** page:

| Tag ID | Airline & Flight | Route | Stage Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **`LHR-123456`** | Lufthansa • LH247 | London (LHR) &rarr; Frankfurt (FRA) | Stage 1 (Check-in) | Default primary demo tag |
| **`JFK-882194`** | Delta Air Lines • DL402 | New York (JFK) &rarr; Paris (CDG) | Stage 4 (In Transit) | Flight en route at FL370 |
| **`DXB-309481`** | Emirates • EK512 | Dubai (DXB) &rarr; Singapore (SIN) | Stage 5 (Unloading) | Cargo offloading ramp |
| **`DEL-557201`** | Air India • AI101 | Delhi (DEL) &rarr; New York (JFK) | Stage 2 (Handling) | X-ray sortation |
| **`SIN-440918`** | Singapore Airlines • SQ322 | Singapore (SIN) &rarr; London (LHR) | Stage 3 (Loading) | Hold container loaded |
| **`IDR-100245`** | IndiGo • 6E5311 | Indore (IDR) &rarr; Mumbai (BOM) | Stage 6 (Completed) | Ready on Carousel Belt 2 |
| **`HND-771239`** | ANA • NH205 | Tokyo (HND) &rarr; Vienna (VIE) | Stage 3 (Loading) | Bulk container bay |
| **`SYD-654321`** | Qantas • QF1 | Sydney (SYD) &rarr; London (LHR) | Stage 4 (In Transit) | Trans-oceanic cruise |

---

## 🌐 Site Pages (17 HTML Pages)

1. **`index.html`** – Aviation landing page featuring hero search card, 3 feature pillars, 6-stage horizontal preview strip, animated counter stats, supported airport hubs, auto-rotating testimonials carousel, FAQ preview, and final call-to-action banner.
2. **`track.html`** – Dedicated baggage lookup interface with strict `^[A-Z]{3}-\d{6}$` format validation, skeleton loading feedback, quick-tag preset pills, and a detailed "Bag Not Found" troubleshooting card.
3. **`journey.html`** *(Protected)* – Live telemetry command center featuring passenger and flight details, dynamic SVG flight path route map with real-time aircraft marker positioning, Live Simulator mode (~8s auto-advance), interactive manual step advance, print-friendly baggage receipt with QR code placeholder, and one-click copy tracking link.
4. **`stage.html`** *(Protected)* – Deep operational telemetry page rendering any of the 6 stages dynamically via `?step=N` with stage visual photo, breadcrumbs, stepper, flight route tags, verified timestamps, and bounded navigation.
5. **`how-it-works.html`** – Complete step-by-step breakdown of the 6 IATA baggage handling stages with typical durations, process descriptions, and icons.
6. **`about.html`** – Mission overview, scroll-animated statistic counters, team/credits section, and system architecture details.
7. **`faq.html`** – Interactive categorized accordion FAQ with real-time search filtering across 10+ realistic baggage scenarios.
8. **`contact.html`** – Operational contact form with validation, character counter, local submission persistence, and operating hours.
9. **`my-bags.html`** *(Protected)* – User's personal tracked baggage cards with live progress bars, category filter chips (All / In Progress / Completed), custom tag addition, and removal modal.
10. **`profile.html`** *(Protected)* – User profile editor, notification preference toggles, password update with live strength meter, and account deletion confirmation modal.
11. **`report-issue.html`** *(Protected)* – 3-step wizard to report lost, delayed, or damaged luggage, generating official tracking reference IDs (`AS-2026-XXXXXX`).
12. **`login.html`** – Secure authentication with SHA-256 verification, 3-attempt 30-second lockout timer, "Remember me" option, and redirect memory.
13. **`register.html`** – Account creation with 10–15 digit phone validation, 60-second OTP challenge delivered via toast, and password strength requirements.
14. **`forgot-password.html`** – 3-step password recovery workflow verifying registered phone number and OTP before password reset.
15. **`terms.html`** – Complete academic simulation terms of service with sticky quick-navigation table of contents.
16. **`privacy.html`** – Privacy policy outlining local client-side storage policies and academic demonstration scope.
17. **`404.html`** – Diverted flight error page with search bar and quick recovery buttons.

---

## 🛠️ Architecture & Technologies

* **Structure:** Pure semantic HTML5 (`<header>`, `<nav>`, `<main id="main-content">`, `<footer>`, `<dialog>`, `<section>`).
* **Design & Styling:** Vanilla CSS3 using custom CSS variables (`:root` design tokens), glassmorphism, responsive grid/flexbox layouts, smooth hover micro-animations, and full dark mode support (`data-theme="dark"`).
* **Shared Layout Injection (`js/layout.js`):** Injects unified header with active link highlighting, notification center dropdown with relative timestamps ("2 min ago"), theme switcher, user menu, and mobile drawer.
* **Telemetry & Mock Database (`js/data.js`):** Central state manager tracking per-bag progress, airline metadata, flight numbers, airport codes, and apron scan timestamps.
* **Core Application Logic (`js/app.js`):**
  * `crypto.subtle.digest('SHA-256')` password hashing.
  * Auth guards with redirect parameters (`login.html?next=...`).
  * Real-time flight route mathematical Bezier interpolation for the moving SVG airplane marker.
  * Live Simulation engine with timer progress bar and automated toast/bell notifications.
  * Custom accessible confirmation modal (`window.showConfirmModal`).
  * Cookie consent management and floating scroll-to-top button.

---

## ♿ Accessibility & SEO

* **Accessibility:** WCAG AA color contrast (&ge; 4.5:1), visible `:focus-visible` outlines, `"Skip to content"` accessible link, `aria-expanded` and `aria-label` attributes on interactive elements, and `prefers-reduced-motion` compliance.
* **SEO & Meta:** Individualized descriptive page titles, unique meta descriptions, Open Graph protocol tags, mobile viewport scaling, and consistent inline SVG favicon.

---

## 📜 Academic Project Notice
This project is developed as an academic web development simulation modeling airport logistics and IATA baggage telemetry workflows. All airline schedules, tags, and flight paths are simulated.
