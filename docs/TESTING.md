# 📋 AeroSim Aviation – Manual Testing & QA Checklist

This document contains a comprehensive manual test suite for the **AeroSim Aviation Airport Baggage Handling Simulator**. Since the application operates entirely client-side using Vanilla HTML5, CSS3, and JavaScript with `localStorage`, all tests can be executed locally in any modern browser without an external server or database.

---

## 🧭 Test Environment Preparation
- **Supported Browsers:** Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge.
- **Local Dev Server:** Any static web server (e.g. `npx serve`, Python `http.server`, VS Code Live Server) or direct localhost instance.
- **Viewport Testing Tools:** Browser DevTools Device Mode (320px, 375px, 768px, 1024px, 1440px).
- **Resetting State:** Open DevTools > Application > Storage > Clear site data, or call `localStorage.clear()` in the Console.

---

## 1. Core User Flows

### Flow 1: New Passenger Registration (`register.html`)
- [ ] **Initial Render:** Page loads with airport tarmac background, navigation header, registration form, and academic demo disclaimer banner.
- [ ] **Disclaimer Notice:** Verify the notice confirms that data is stored locally in the browser and no live airline servers are contacted.
- [ ] **Quick Fill Button:** Clicking "Fill Demo Data" populates sample traveler information and triggers simulated OTP delivery.
- [ ] **Phone Number Validation:**
  - [ ] Entering fewer than 10 digits triggers an inline error message.
  - [ ] Entering valid 10–15 digits clears the error.
- [ ] **OTP Challenge:**
  - [ ] Clicking "Send OTP" produces a toast notification displaying the 4-digit code.
  - [ ] Entering an incorrect OTP displays a verification failure alert.
  - [ ] Entering the correct OTP validates successfully.
- [ ] **Password Strength Meter:**
  - [ ] Weak password (< 8 chars) shows 1 bar (red).
  - [ ] Medium password (min 8 chars + numbers) shows 2 bars (yellow).
  - [ ] Strong password (uppercase, lowercase, number, min 8 chars) shows 3 bars (green).
- [ ] **Password Visibility Toggle:** Clicking the eye icon toggles input type between `password` and `text`.
- [ ] **Successful Submission:** Submitting valid registration redirects the user to `login.html` with a success toast.

### Flow 2: Authentication & Session (`login.html`)
- [ ] **Initial Render:** Login card with airport tarmac background and demo disclaimer note.
- [ ] **Auto Fill Demo:** Clicking "Auto Fill Demo" fills `User2244` and `password123`.
- [ ] **Password Visibility Toggle:** Clicking the eye icon shows/hides the entered password.
- [ ] **Lockout Mechanism:**
  - [ ] Submitting invalid credentials 3 consecutive times activates a 30-second lockout banner and temporarily disables the submit button.
- [ ] **Successful Login:**
  - [ ] Logging in with `User2244` / `password123` updates the header with user avatar, name pill, and notifications bell.
  - [ ] If redirected via `?next=page.html`, verify the user is returned to the requested protected page upon authentication.

### Flow 3: Password Recovery (`forgot-password.html`)
- [ ] **Form Validation:** Validates registered phone number before sending simulated OTP.
- [ ] **OTP Challenge:** Generates and verifies 4-digit reset code via toast notification.
- [ ] **Password Reset:** Successfully updates SHA-256 hashed password in `localStorage` (`aerosim_users`).
- [ ] **Redirect:** Redirects to `login.html` upon successful password update.

### Flow 4: Baggage Search & Tracking (`track.html` & `index.html`)
- [ ] **Tag Format Validation:**
  - [ ] Accepts format `^[A-Z]{3}-\d{6}$` (e.g. `LHR-123456`, `DXB-309481`, `JFK-882194`).
  - [ ] Rejects lowercase without auto-normalization or invalid lengths with an inline error message.
- [ ] **Sample Quick Tags:** Clicking quick tag chips (`LHR-123456`, `DXB-309481`, etc.) auto-populates the input.
- [ ] **Loading Skeleton:** Displays animated skeleton placeholder while query resolves (simulated 400ms delay).
- [ ] **Not Found State:** Entering an unrecognized valid format tag (e.g. `ABC-999999`) shows the troubleshooting alert with suggestions.
- [ ] **Found State:** Submitting a seeded tag navigates smoothly to `journey.html?tag=TAG_ID`.
- [ ] **Honest Copy:** Feature cards display "Simulated Secure Tracking – all data stays in your browser".

### Flow 5: Baggage Journey Dashboard (`journey.html`)
- [ ] **Active Bag Telemetry:** Displays flight number, airline, origin/destination codes, passenger masked name, bag weight, color, gate, and carousel.
- [ ] **6-Stage Vertical Timeline:**
  - [ ] Stage 1: Check-in Complete
  - [ ] Stage 2: Baggage Handling
  - [ ] Stage 3: Aircraft Loading
  - [ ] Stage 4: Flight in Transit
  - [ ] Stage 5: Aircraft Unloading
  - [ ] Stage 6: Arrival Claim Stage
- [ ] **Simulation Step Controls:**
  - [ ] "Advance to Next Stage" increments active stage index and generates a confirmed timestamp.
  - [ ] "Reset to Stage 1" resets bag to origin check-in.
- [ ] **Printable Receipt Modal:**
  - [ ] Clicking "Print Baggage Receipt" opens the IATA baggage claim ticket modal.
  - [ ] Modal can be closed via Close button, clicking outside, or pressing `Escape`.
  - [ ] Clicking "Print / Save PDF" triggers browser print dialog.

### Flow 6: Stage Explorer Detail View (`stage.html`)
- [ ] **URL Parameter Navigation:** Navigating to `stage.html?step=1` through `?step=6` displays corresponding stage graphics and description.
- [ ] **Top Horizontal Stepper:** Shows 6 steps with proper icons and status badges (Completed / In Progress / Pending).
- [ ] **Stage 5 Differentiation:** Stage 5 (Aircraft Unloading) displays distinct ramp offload apron badge and caption to differentiate from Stage 3.
- [ ] **Dynamic Alt Text:** Visual image alt text dynamically updates to reflect current stage title and description.

### Flow 7: Irregularity Report & Claims Wizard (`report-issue.html`)
- [ ] **Authentication Guard:** Redirects unauthenticated users to login with `next` redirect parameter.
- [ ] **3-Step Claim Wizard:**
  - [ ] Step 1: Select bag tag, airline, flight, and issue type (Delayed / Damaged / Missing Items).
  - [ ] Step 2: Passenger contact details and physical delivery address.
  - [ ] Step 3: Suitcase brand, color, distinguishing features, and declaration checkbox.
- [ ] **Submission & Reference Number:** Submitting produces a unique reference ID (e.g. `AS-2026-XXXXXX`).
- [ ] **Report History Table:**
  - [ ] New claim appears immediately in "Your Filed Irregularity Reports".
  - [ ] Table renders responsively with horizontal scroll wrapper on mobile viewports.

### Flow 8: My Bags Management (`my-bags.html`)
- [ ] **Authentication Guard:** Protected page requiring valid session.
- [ ] **Filter Chips:** Filtering by "All Bags", "In Progress", and "Completed" updates grid dynamically.
- [ ] **Add Tag Modal:** Modal allows adding seeded or custom tags matching `^[A-Z]{3}-\d{6}$`.
- [ ] **Remove Bag Confirmation:** Clicking delete opens confirmation modal; confirming removes bag from tracked list.

---

## 2. Accessibility & Keyboard Navigation (WCAG 2.1 AA)

- [ ] **Skip to Content Link:**
  - [ ] Pressing `Tab` immediately upon page load reveals `.skip-to-content` button.
  - [ ] Activating jumps focus directly to `<main id="main-content">`.
- [ ] **Visible Focus Outlines:**
  - [ ] All interactive controls (buttons, links, inputs, selects, tabs) exhibit a distinct `:focus-visible` ring.
- [ ] **Color Contrast:**
  - [ ] Text elements pass minimum 4.5:1 contrast against backgrounds in both light and dark modes.
  - [ ] Secondary and muted text tokens have been verified for WCAG AA compliance.
- [ ] **Screen Reader ARIA:**
  - [ ] Toast notification container has `role="status"` and `aria-live="polite"`.
  - [ ] Tracking loading/not-found states have `aria-live="polite"`.
  - [ ] Input validation error messages have `role="alert"` or `aria-live="assertive"`.
- [ ] **Accordions (`faq.html`):**
  - [ ] Can be navigated using `Tab` and activated with `Enter` or `Space`.
  - [ ] `ArrowDown` / `ArrowUp` keys move focus between accordion headers.
  - [ ] `aria-expanded` accurately reflects open/closed state.
- [ ] **Carousels (`index.html`):**
  - [ ] Has `role="region" aria-roledescription="carousel"`.
  - [ ] Dots can be activated via keyboard.
  - [ ] `ArrowLeft` / `ArrowRight` navigate between slides.
  - [ ] Respects `prefers-reduced-motion: reduce` by disabling automatic rotation.
- [ ] **Modals:**
  - [ ] Confirmation dialog and print receipt modal close when `Escape` key is pressed.
  - [ ] Tab navigation remains trapped within modal dialog while open.

---

## 3. Responsive Layout Testing

| Viewport Width | Device Target | Key Checks |
|---|---|---|
| **320px** | iPhone SE (1st gen) | No horizontal page overflow; hamburger menu accessible; cards adapt smoothly; text wraps cleanly without truncation. |
| **375px** | iPhone 12 / 13 / SE mini | Clean margin spacing; form inputs full width; feature cards stacked vertically. |
| **768px** | iPad / Android Tablet | 2-column footer grid; horizontal stepper scrolls smoothly; statistics counter wraps cleanly. |
| **1024px** | iPad Pro / Small Laptop | Desktop navigation links visible; dashboard layout balances telemetry sidebar with timeline. |
| **1440px** | Desktop HD Display | Container max-width 1440px centered; crisp typography; elegant background overlays. |

---

## 4. Theme & Motion Preferences

- [ ] **Dark Mode Toggle:** Clicking moon/sun button in header instantly toggles dark theme without layout shift.
- [ ] **Theme Persistence:** Selected theme is stored in `localStorage` (`aerosim_theme`) and survives page reloads.
- [ ] **System Preference Respect:** If no manual theme has been chosen, system `(prefers-color-scheme: dark)` is applied automatically.
- [ ] **Reduced Motion:** When OS or browser enables reduced motion, all CSS transitions and animations collapse gracefully.
