# InsightForge AI — UI/UX Design System Guide

InsightForge AI implements the curated **blue-gradient, white, and deep navy** design system specified in Section 2 of `InsightForge_SPEC.md`.

---

## 1. Color Palette Tokens

All colors are centralized as reusable theme tokens in `frontend/tailwind.config.js` and `frontend/src/styles/index.css`:

| Token | Hex Value | Semantic Usage |
|---|---|---|
| `--color-page` | `#F4F8FF` | Main canvas background |
| `--color-surface` | `#FFFFFF` | Cards, forms, tables, modals |
| `--color-surface-soft` | `#EAF2FF` | Soft blue hero badges, highlighted callouts |
| `--color-text` | `#14213D` | Primary text and headings |
| `--color-text-muted` | `#64748B` | Secondary captions, timestamps, axis ticks |
| `--color-primary` | `#2563EB` | Primary buttons, active tabs, main links |
| `--color-primary-dark` | `#123B8A` | High-contrast titles, header banners |
| `--color-cyan` | `#06B6D4` | Secondary visual accents, sparkles, status dots |
| `--color-success` | `#059669` | High health scores, successful actions |
| `--color-warning` | `#D97706` | Missing values warning, demo mode notice |
| `--color-danger` | `#DC2626` | Destructive actions, validation errors |
| `--color-border` | `#DCE6F5` | Structural card borders and dividers |
| `--color-sidebar` | `#0B1730` | Deep navy application sidebar |
| `--color-sidebar-active` | `#155EEF` | Active sidebar navigation item |

---

## 2. Typography Hierarchy

- **Primary Typeface:** `Inter` (Google Fonts), falling back to system sans-serif.
- **Hero Title:** 48–60px, Bold (800 weight), tracking tight (`-0.02em`).
- **Workspace Headings:** 24–32px, Bold (700 weight).
- **Card Titles:** 15–18px, Semi-Bold (600 weight).
- **Body Text:** 13–15px, Regular (400 weight), leading relaxed (`1.5`).
- **Data Tables & Code:** 11–13px, Monospace font for numbers, coordinates, and tool calls.

---

## 3. Elevation & Component Geometry

- **Cards:** 18px border radius (`rounded-card`), 1px solid border (`#DCE6F5`), soft drop shadow (`0 4px 20px -2px rgba(20, 33, 61, 0.04)`).
- **Interactive Inputs & Buttons:** 11px border radius (`rounded-input`).
- **Status Badges:** Pill-shaped rounded full with light semantic background tints.
- **Transitions:** 150ms–250ms cubic-bezier transitions for hover elevation and active button presses.
- **Accessibility:** Visible outline focus rings for keyboard tab navigation; automatic honoring of `prefers-reduced-motion`.
