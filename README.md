# ✈️ AeroSim Aviation – Airport Baggage Handling Simulator

[![Live App](https://img.shields.io/badge/Live_App-PWA_Ready-1672ec?style=for-the-badge&logo=googlechrome&logoColor=white)](https://kartikagrawal2200.github.io/CSE-323-project-/)
[![Mobile Install](https://img.shields.io/badge/Mobile_Install-Android_%26_iOS-22c55e?style=for-the-badge&logo=pwa&logoColor=white)](https://kartikagrawal2200.github.io/CSE-323-project-/)
[![License](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](LICENSE)

An authentic, fully responsive, multi-page web application modeling the end-to-end journey of commercial airline baggage from passenger check-in to carousel baggage claim. Built purely with modern **HTML5, Vanilla CSS3, and Vanilla JavaScript (ES6+)** with zero external dependencies, build tools, or backend servers.

---

## 🌟 Key Features & Recent Additions

- **Full Design System:** Built entirely on CSS custom properties (`:root` tokens) defining a unified spacing scale (`--space-0` to `--space-16`), typography scale (`--font-xs` to `--font-4xl`), WCAG AA contrast colors, button styles, and card padding.
- **Strict IATA Tag Validation:** Airport tracking tags strictly conform to `^[A-Z]{3}-\d{6}$` (e.g. `LHR-123456`, `DXB-309481`) with real-time format validation across all search bars and forms.
- **6-Stage Lifecycle Tracking:** Check-in Complete, Baggage Handling, Aircraft Loading, Flight In Transit, Aircraft Unloading, and Arrival Claim Stage.
- **Live Telemetry & Interactive SVG Map:** Bezier curve trajectory calculation with dynamic aircraft positioning between departure and destination airports.
- **Accessibility (WCAG 2.1 AA Compliant):**
  - High-visibility `:focus-visible` outline rings with subtle box-shadows.
  - Screen reader live announcements (`aria-live="polite"` and `role="alert"` / `role="status"`) for toasts, loading skeletons, search errors, and timeline changes.
  - Full keyboard navigation for menus, modals (with `Escape` key close and focus trapping), accordions (`ArrowUp`/`ArrowDown`/`Home`/`End`), and testimonials carousel (`ArrowLeft`/`ArrowRight`).
  - Screen-reader accessible "Skip to content" link.
  - Descriptive `alt` text on all imagery, with dynamic caption updates in the stage explorer.
- **User Preference Respect:**
  - Full support for `prefers-reduced-motion: reduce` (collapses animations, disables carousel auto-advance).
  - Native support for `prefers-color-scheme: dark` with manual toggle override stored in `localStorage`.
- **Responsive Layout Across Viewports:** Hand-crafted responsive rules verifying seamless presentation at **320px, 375px, 768px, 1024px, and 1440px** widths with minimum **44px tap targets** on all touch controls.
- **Responsive Tables:** Dedicated `.table-responsive-wrapper` and `.reports-table` styling preventing viewport clipping and supporting smooth horizontal touch scrolling.
- **Honest Disclaimers:** Transparently labeled simulated statistics, student reviews, and browser-only storage notices on authentication and tracking pages.
- **Complete SEO:** Unique `<title>`, `<meta name="description">`, Open Graph social sharing tags, and inline SVG favicons on every page.

---

## 📂 Project Structure Tree

```
CSE326 CA2/
├── 404.html                   # 404 Diverted Flight error page
├── LICENSE                    # MIT Open Source License
├── README.md                  # Project documentation & features
├── about.html                 # Mission, team, and system architecture
├── assets/                    # Royalty-free high-res aviation imagery
│   ├── airplane_climb.jpg
│   ├── airport_bg.jpg
│   ├── stage1.jpg ... stage6.jpg
│   └── terminal_bg.jpg
├── contact.html               # Airport operations support desk form
├── css/
│   └── style.css              # Vanilla CSS3 design system & responsive rules
├── docs/
│   └── TESTING.md             # Comprehensive manual test checklist
├── faq.html                   # Accessible accordion FAQ with keyword search
├── forgot-password.html       # 3-step OTP password recovery workflow
├── how-it-works.html          # Detailed 6-stage IATA lifecycle breakdown
├── index.html                 # Aviation homepage with carousel & search
├── journey.html               # Live baggage telemetry command center
├── js/
│   ├── app.js                 # Core logic, auth, crypto, modals & search
│   ├── data.js                # Mock database & state manager
│   └── layout.js              # Shared header, footer, PWA & notif drawer
├── login.html                 # Secure authentication with lockout timer
├── manifest.json              # Web app manifest for standalone mobile PWA
├── my-bags.html               # Multi-bag tracking dashboard & tag manager
├── privacy.html               # Privacy policy & client storage disclosure
├── profile.html               # Passenger settings & profile manager
├── register.html              # Account creation with OTP challenge
├── report-issue.html          # 3-step baggage irregularity claims wizard
├── stage.html                 # Deep-dive stage telemetry inspector (?step=N)
├── sw.js                      # Service Worker caching engine
├── terms.html                 # Terms of service & academic disclaimer
└── track.html                 # Baggage lookup with skeleton feedback
```

---

## 📲 Live Link & Mobile Installation (PWA)

Anyone can open and install AeroSim Aviation directly onto their smartphone or tablet:

### 🔗 **Live Website URL**:
👉 **[https://kartikagrawal2200.github.io/CSE-323-project-/](https://kartikagrawal2200.github.io/CSE-323-project-/)**

### 📱 How to Install on Mobile Devices:

#### **Android (Google Chrome / Brave / Edge)**
1. Open the [Live Website](https://kartikagrawal2200.github.io/CSE-323-project-/) on your mobile browser.
2. Tap the menu button (**⋮** three dots in the top-right corner).
3. Tap **"Install app"** or **"Add to Home screen"**.
4. Confirm by tapping **"Install"**. The AeroSim icon will appear in your mobile app drawer and home screen, running full-screen just like a native Android app!

#### **iPhone / iPad (Apple Safari)**
1. Open the [Live Website](https://kartikagrawal2200.github.io/CSE-323-project-/) in Safari.
2. Tap the **Share** button (**⎋** square with arrow pointing up at the bottom).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right. AeroSim will open as an app with custom app splash and offline caching!

---

## 🚀 Quick Start / How to Run Locally

1. **No installation, no Node.js, and no build tools needed.**
2. Double-click or open `index.html` directly in any desktop or mobile web browser (Chrome, Edge, Firefox, Safari).
3. Alternatively, launch a lightweight local HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using npx
   npx serve .
   ```
4. Access locally at `http://localhost:8000/`.

---

## 🔑 Demo Access & Seed Credentials

### Demo User Account
* **User ID / Username:** `User2244`
* **Password:** `password123`
*(Pre-loaded one-click "Demo User" buttons are available on the Login & Registration pages)*

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

## 🧪 Testing Checklist

For full end-to-end testing procedures, refer to [docs/TESTING.md](docs/TESTING.md). Summary of core verification steps:

- [x] **Registration Flow:** Verify phone length validation (10–15 digits), 4-digit OTP simulation via toast, and password strength meter.
- [x] **Authentication Flow:** Verify `User2244` / `password123` login, 3-attempt 30s lockout banner, and protected page redirect guards.
- [x] **Tag Tracking Flow:** Verify format validation (`^[A-Z]{3}-\d{6}$`), skeleton loading feedback, and not-found troubleshooting suggestions.
- [x] **Telemetry & Journey:** Verify manual step advancement, Live Simulator auto-advance (8s interval), and modal print receipt with `Escape` key close.
- [x] **Irregularity Claims:** Verify 3-step wizard submission, reference ID generation (`AS-2026-XXXXXX`), and responsive report table history.
- [x] **Accessibility:** Verify Skip-to-content focus jump, visible focus rings on all interactive elements, WCAG AA color contrast, and keyboard navigation on accordions, modals, and carousels.
- [x] **Responsive Layout:** Verify no horizontal overflow at 320px, 375px, 768px, 1024px, and 1440px with touch targets $\ge 44\text{px}$.

---

## ⚠️ Known Limitations (Browser-Only Demo, No Real Backend)

AeroSim Aviation is intentionally engineered as a client-side web application without a server or database backend:
1. **Local Browser Storage Only:** All accounts, active baggage telemetry, custom bags, and filed claims are saved exclusively in your browser's `localStorage`. Clearing browser cookies or cache resets the data to original seeds.
2. **Simulated Authentication:** Passwords are hashed client-side using `crypto.subtle.digest('SHA-256')` for educational demonstration.
3. **Simulated OTP Delivery:** OTP verification codes are displayed as simulated toast notifications on screen rather than dispatched via SMS/telecom gateways.
4. **Mock Global Telemetry:** Flight routes, aircraft speeds, and barcode sortation scans are mathematically modeled in JavaScript rather than querying live airline GDS/IATA feeds.

---

## 📝 Changelog

### Version 2.7.0 (Current Release)
- **Consistency:** Aligned baggage tag format across all pages (`index.html`, `track.html`, `how-it-works.html`, `faq.html`) to strictly match `^[A-Z]{3}-\d{6}$`.
- **Honest Copy:** Replaced overclaiming security text with transparent simulated tracking notices on landing, tracking, login, register, and password recovery pages.
- **Design System:** Created centralized CSS variable scale for spacing (`--space-0` through `--space-16`), typography (`--font-xs` through `--font-4xl`), focus states, and component tokens.
- **WCAG 2.1 AA Accessibility:** Enhanced contrast ratios for secondary and muted text, added visible focus outlines (`:focus-visible`), implemented keyboard navigation for accordions, modals, and carousels, and added `aria-live` regions for live search feedback.
- **Responsive Tables & 320px Support:** Styled `.table-responsive-wrapper` and `.reports-table` for mobile scrolling; hardened breakpoints at 320px and 375px with min 44px tap targets.
- **SEO & Social:** Added comprehensive `<meta name="description">` and Open Graph social tags across all 17 HTML files.
- **Documentation:** Added official MIT `LICENSE`, comprehensive `docs/TESTING.md` manual checklist, and expanded `README.md`.

---

## 📜 Academic Project Notice
This project is developed as an academic web development simulation modeling airport logistics and IATA baggage telemetry workflows. All airline schedules, tags, and flight paths are simulated.
