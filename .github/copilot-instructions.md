# Underground Street Collective (U.S.C.) - GitHub Copilot Specification & Instructions

This repository is the full-stack web platform for **Underground Street Collective (U.S.C.)**, a garage-born movement combining industrial assembly work in Germany/Austria, utility van fleet rental (L3H2), heavy-weight streetwear brand (U.S.W.), solidarity fund, and a 3-6-9 neural mindset engine (Auru Trinity Core).

---

## 1. Project Architecture & Tech Stack

- **Framework**: React 19 with Vite (TypeScript).
- **Backend Entry**: `server.ts` (Express server with Vite middleware mode in dev, single bundled CommonJS in production via `esbuild`).
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` and `@import "tailwindcss";` in `src/index.css`.
- **Icons**: `lucide-react` only (never custom SVGs).
- **Animations**: `motion/react` (Motion 12+).
- **Routing**: `react-router-dom` v7.
- **AI & Integrations**: `@google/genai` (server-side only via `server.ts`), Firebase Firestore & Auth, Canvas Confetti.

---

## 2. Directory Layout

```
/
├── .github/
│   ├── copilot-instructions.md   # This instruction file
│   └── workflows/
│       └── deploy.yml            # Deployment workflow
├── src/
│   ├── components/
│   │   ├── admin/                # AdminDashboard widgets (Auru369MonitorWidget, GlitchNotificationBar, etc.)
│   │   ├── ai/                   # MatrixDispatchConsole, AI chat widgets
│   │   ├── trade/                # B2B Trade & Lead generation modules
│   │   ├── Navbar.tsx            # Global navigation with pillar tabs & audio dock
│   │   ├── Footer.tsx            # Industrial street footer
│   │   ├── StreetAmbientPlayer.tsx # Autoplay-compliant Web Audio synthesizer & 369 ambient drone
│   │   ├── Matrix369Visualizer.tsx # Matrix rain canvas with 3-6-9 frequency resonance
│   │   └── Ritual369.tsx         # Interactive 3-6-9 manifestation counter
│   ├── pages/
│   │   ├── Home.tsx              # Central garage hub & 6-pillar overview
│   │   ├── USCWork.tsx           # Assembly jobs, § 13b reverse charge calculator, A1 forms
│   │   ├── USCRent.tsx           # Fleet rental for L3H2 vans, diesel & route calculator
│   │   ├── USWShop.tsx           # Streetwear catalog with live cart and drop timers
│   │   ├── Ritual369Page.tsx     # Fullscreen 369 manifestation chamber with Solfeggio tones
│   │   ├── AuruTrinity.tsx       # AI Auru Trinity neural command center
│   │   ├── USCSolidarity.tsx     # Mutual aid & solidarity transparent ledger
│   │   ├── USCTrade.tsx          # B2B Zakasajee contracts & dispatch
│   │   ├── AdminDashboard.tsx    # Protected admin panel with 369 monitor & glitch bar
│   │   └── Login.tsx             # PIN & auth gate
│   ├── types.ts                  # Shared TypeScript interfaces & types
│   ├── index.css                 # Street brutalist utilities, glitch keyframes, hazard stripes
│   ├── main.tsx                  # React DOM entry point
│   └── App.tsx                   # Top-level Router & Providers
├── server.ts                     # Express API & Vite dev middleware
├── vite.config.ts                # Vite config with React and Tailwind plugins
└── package.json                  # Dependencies & scripts (dev, build, start, lint)
```

---

## 3. Design System & Aesthetics (Anti-Slop Guidelines)

- **Palette**:
  - Background: Deep industrial charcoal `#09090b` / `#000000`.
  - Primary Accent: Safety Warning Amber `#f59e0b` (`bg-amber-500`, `text-amber-400`).
  - Secondary Accent: Industrial Crimson Red `#dc2626` / `#ef4444`.
  - Terminal & Success: Emerald `#10b981` / `#059669`.
  - High-contrast pure black and white accents with bold 2px–4px borders (`border-black`, `border-zinc-800`).
- **Hard Shadow Elevation**:
  - `street-shadow`: `box-shadow: 4px 4px 0px 0px #000000;`
  - `street-shadow-amber`: `box-shadow: 5px 5px 0px 0px #f59e0b;`
  - `street-shadow-red`: `box-shadow: 5px 5px 0px 0px #dc2626;`
- **Typography**:
  - Display / Headings: Bold, uppercase sans-serif with tight tracking (`tracking-tight`, `font-black`).
  - Data / Telemetry: Monospace (`font-mono`, `text-xs`) with uppercase status badges.
- **Glitch & Hazard Details**:
  - Hazard diagonal caution stripes for header/footer dividers (`repeating-linear-gradient`).
  - Chromatic aberration glitch text (`.glitch-text`) and alert boxes (`.glitch-box`) when connection to Auru Trinity drops.

---

## 4. Key Functional Modules To Implement

1. **U.S.C. WORK Turnus Calculator**:
   - Computes: `(Hours/Week * Rate * Weeks) - Estimated living/travel costs`.
   - German § 13b UStG Reverse Charge zero-VAT compliance disclaimer.
   - A1 social security validation checklist.

2. **RENT A WHEEL Van Calculator**:
   - Fleet of L3H2 utility vans.
   - Calculates round-trip kilometers to major German hubs (München 550km, Stuttgart 780km, Frankfurt 850km).
   - Fuel estimate based on 9.5 L/100km @ €1.60/L diesel + daily vehicle fee.

3. **369 MANIFESTATION MATRIX & AUDIO ENGINE**:
   - Web Audio API pure sine-wave oscillator generating 369 Hz, 639 Hz, and 963 Hz Solfeggio tones.
   - 3x Morning Intent, 6x Afternoon Hustle, 9x Evening Outcome counters with local / Firestore persistence.
   - Matrix rain background canvas with glowing amber glyphs.

4. **ADMIN DASHBOARD & 369 TELEMETRY MONITOR**:
   - Live socket latency simulator (95ms - 180ms) and success percentage (98%+).
   - Real-time glitch alert banner (`AdminGlitchNotificationBar`) with chromatic aberration and optional Web Audio alarm beep when simulated disconnect happens.
   - Task logs filterable by 3x, 6x, and 9x tiers with one-click manual diagnostic trigger.

5. **U.S.W. STREETWEAR SHOP**:
   - Heavy-weight 450g hoodies, street tees, snapbacks.
   - Interactive cart state with total calculation and order confirmation modal.
