# bloch-NDA — Design & Rebrand Handoff

**Purpose.** This document lets a separate engineering thread apply the Grey Qub
rebrand + reskin (prototyped on the compiled demo in `app/`) to the **live
React source** of the NDA analyzer under testing.

**Important — implement at source, not as an override.** In `app/` the reskin
was delivered as a stylesheet (`grey-qub.css`) loaded *after* the app's built
`main.css`, plus a handful of string edits to the minified JS. That was
necessary because we only had the compiled bundle. In the real codebase you own
the components, so **fold these tokens and treatments into the source design
system** (theme file / CSS variables / component styles) rather than shipping an
override layer. The override CSS here is the *reference specification*, not the
thing to copy verbatim.

Everything below is mirrored by the working reference files in
[`reference/`](./reference/) — read `reference/grey-qub.css` alongside this doc;
it is the single source of truth for exact values.

---

## 1. Brand rename map

| Concept | Before | After |
| --- | --- | --- |
| Product name | Concordia NDA+ | **bloch-NDA** |
| Company / wordmark | Grey Stratum (`grey`/`stratum`) | **grey qub** / `GREY QUB` |
| Company mark | "gradus" ascending tri-bars | **Bloch axis** (isometric cube + sphere + accent diagonal) |
| Slogan (splash H1) | — | **Real Expertise. Unreal Intelligence.** |
| Product tagline | — | *Institutional-grade NDA review, benchmarked and remediated in minutes.* |
| Header lockup | `NDA+ · concordia` | `GREY QUB · bloch-NDA` (company left of divider, product right; **no** leading mark) |
| Export filename prefix | `Concordia_NDA_<ts>.docx` | `bloch-NDA_<ts>.docx` |
| Default export name | `concordia_export.docx` | `bloch-NDA_export.docx` |
| Sample counterparty (demo copy) | "Concordia Bank, N.A." | "Meridian Bank, N.A." |
| `<title>` | Concordia NDA+ | bloch-NDA — Grey Qub |
| `theme-color` / manifest | `#863bff` (purple) | `#f1ede6` (paper) |
| Favicons / PWA icons | Concordia set | Grey Qub `icon-*.png` / `icon.svg` |

**Leave internal identifiers alone** (renaming them buys nothing and risks
breaking persistence/telemetry): `localStorage` keys `concordia-theme`,
`concordia_default_client`; `sessionStorage` `concordia_splash_seen`;
`window.concordiaAPI`; console tags `[concordia]`; service id
`concordia-nda-plus-demo`. In a source rename you *may* update these for
consistency, but do it atomically or not at all.

---

## 2. Design tokens

Warm **paper + ink**, both themes, with a single muted **steel-blue "Bloch"
accent**. Set `data-theme="light|dark"` on `<html>`; **default to light**.
Exact values (from `reference/grey-qub.css`):

### Light (`[data-theme=light]`)
| Token | Value |
| --- | --- |
| `--color-bg` / `--color-bg-soft` | `#f1ede6` / `#f7f4ee` |
| `--color-surface` / `-light` / `-elevated` | `#fbf9f5` / `#f7f4ee` / `#fdfcf9` |
| `--color-surface-hover` | `#efe9df` |
| `--color-text` / `-secondary` / `-muted` / `-subtle` | `#33322f` / `#6a6659` / `#8b877e` / `#a29d92` |
| `--color-border` / `-light` / `-subtle` | `rgba(51,50,47,.14)` / `.09` / `.07` |
| `--color-accent` / `-hover` / `-muted` | `#6f89a3` / `#5c748c` / `rgba(111,137,163,.16)` |
| `--color-success` / `-warning` / `-error` | `#5a7d5a` / `#b07a3c` / `#b3543f` |
| `--doc-bg` / `--doc-text` | `#fbf9f5` / `#2a2723` |
| `--sweep-color` | `rgba(255,255,255,.75)` |
| grain blend / opacity | `multiply` / `.07` |

### Dark (`[data-theme=dark]`)
| Token | Value |
| --- | --- |
| `--color-bg` / `--color-bg-soft` | `#1b1917` / `#232019` |
| `--color-surface` / `-light` / `-elevated` | `#262320` / `#2c2823` / `#2c2823` |
| `--color-surface-hover` | `#33302a` |
| `--color-text` / `-secondary` / `-muted` / `-subtle` | `#f1ede6` / `#c3bcae` / `#a39c8f` / `#7d776c` |
| `--color-border` / `-light` / `-subtle` | `rgba(241,237,230,.14)` / `.09` / `.07` |
| `--color-accent` / `-hover` / `-muted` | `#89a8c9` / `#a3bcd7` / `rgba(137,168,201,.18)` |
| `--color-success` / `-warning` / `-error` | `#7fa07f` / `#cf9a5a` / `#d6765f` |
| `--doc-bg` / `--doc-text` | `#f4f0e8` / `#2a2723` (document stays paper-light for realism) |
| `--sweep-color` | `rgba(0,0,0,.55)` |
| grain blend / opacity | `overlay` / `.13` |

### Theme-invariant
```
--radius-sm/md/lg: 8px / 12px / 18px
--ease: cubic-bezier(.16,.8,.24,1)
--shadow-out (raised soft tile): 0 18px 40px rgba(60,55,45,.12), 0 1px 0 rgba(255,255,255,.65) inset   /* dark: 0 18px 40px rgba(0,0,0,.45), … */
--shadow-in  (inset/pressed):    inset 2px 2px 6px rgba(60,55,45,.14), inset -2px -2px 6px rgba(255,255,255,.75)  /* dark uses black/white .5/.04 */
--shadow-sm/md/lg: see reference for both themes
```

### Severity ramp (functional — keep semantic, but on-palette)
| Level | Light | Dark |
| --- | --- | --- |
| critical | `#8f3a2c` | `#e08a6f` |
| high | `#b3543f` (terracotta) | `#d6765f` |
| medium | `#6f89a3` (**= accent**, reads as "moderate/info") | `#89a8c9` |
| low | `#5a7d5a` (sage) | `#7fa07f` |

Each has a matching `-bg` at ~.11–.18 alpha (see reference).

---

## 3. Typography

Load: `Space Grotesk` (300/400/500/700), `Newsreader` (ital 300/400), `IBM Plex Mono` (400/500).

```
--font-family : "Space Grotesk", "Inter", system-ui, sans-serif   /* UI / body */
--font-heading: "Space Grotesk", "Archivo", sans-serif            /* headings, weight 300, letter-spacing -.01em */
--font-serif  : "Newsreader", Georgia, serif                      /* editorial legal prose */
--font-mono   : "IBM Plex Mono", "Fira Code", monospace           /* eyebrow labels + IDs only */
```

Where each applies:
- **Space Grotesk** — headings (weight 300), all UI/body, buttons, **and the
  provision-card action pills + severity/GPT/missing flags** (these must NOT be
  mono — mono there reads as broken "code").
- **Newsreader (serif)** — reading-weight legal prose only: provision
  rationale, current-language quotes, suggested fixes, synthesis notes, leads,
  splash tagline. This editorial serif is a deliberate signature.
- **IBM Plex Mono** — small eyebrow/section labels (`CURRENT LANGUAGE`,
  `SUGGESTED MINIMUM FIX`, setup section titles) and IDs (`NDA-013`), uppercase
  with wide tracking. This is the other signature. **Do not** extend mono to
  interactive controls.

---

## 4. Global treatments (motion & texture)

- **Film grain** — fixed full-viewport SVG-noise overlay, `z-index:9000`,
  `mix-blend-mode: var(--grain-blend)`, `opacity: var(--grain-opacity)`. See
  `html::before` in reference (inline data-URI included).
- **Top hairline sweep** — fixed 2px bar at top, `z-index:9001`; a 35%-wide
  highlight gradient sweeps left→right every 7s (`@keyframes gq-sweep`).
- **Scrollbars** — thin, pill thumb using `--scrollbar-thumb`, transparent track.
- Respect `prefers-reduced-motion` (all animations gated).

---

## 5. Component catalog

Reference selectors are the demo's class names — map them to your source
components.

| Component | Treatment |
| --- | --- |
| **Header lockup** (`.header-brand`) | Flex row, order: `GREY QUB` (mono, uppercase, `.24em` tracking, muted) · thin divider · **bloch-NDA** (Space Grotesk 300; "bloch-" in ink, "NDA" in accent). No leading icon. |
| **Activity sphere** (`.status-tribars`) | Replaces the old status tri-bars. 28px rotating **Bloch sphere** (`spin.svg`), `@keyframes gq-orbit` 6s linear. Spins faster (1.6s) while `checking`; pauses + dims on `error`/`disconnected`. Ambient "system alive" cue at far-right of header. |
| **Buttons** (`.btn`) | Soft raised **pills** (`border-radius:100px`, `--shadow-out`), hover lifts `-2px`. Primary = ink fill (`--color-text` bg / `--color-bg` text) → **inverts to a paper pill in dark**, hover turns accent. Secondary = surface pill w/ light border, hover → accent border+text. Disabled drops to `--shadow-sm`, opacity .5. |
| **Provision cards** (`.provision-card`) | Soft tiles: `--color-surface`, `--radius-md`, `--shadow-sm`; hover lifts + `--shadow-md`; `.selected` = accent ring. |
| **Pills / flags** (`.pill`, `.severity-badge`, `.gpt-badge`, `.missing-badge`) | Space Grotesk (see §3). `.pill.active` = accent-muted fill + accent border/text. |
| **Upload zone** (`.upload-zone`) | Inset paper tile: `--shadow-in`, dashed border, `--radius-lg`; hover/drag/has-file → accent border + accent-muted bg. |
| **Inputs** | Surface bg, `--radius-sm`; focus = accent border + `0 0 0 3px var(--color-accent-muted)` ring. |
| **Document viewer** (`.document-content` on `.document-container`) | Page rendered as a **sheet of paper on a warm mat**: `--doc-bg`, `--radius:12px`, subtle warm border + layered soft shadow (inset highlight + drop). Container padding on `--color-bg-soft`. |
| **Export button** (`button[title^="Export modified document"]`) | Lifted out of the results panel into the **header, right side** (`position:fixed; top:10px; right:150px`) as an **accent pill with a slow blinking glow** (`@keyframes gq-export-glow`, 2.8s). Appears only after remediation. Narrow-screen fallback: bottom-right FAB. *In source, prefer rendering it into the header's action cluster rather than `position:fixed`.* |
| **Header filename chip** (`.header-file-info`) | **Removed** — redundant with the document viewport title. |
| **Modal** (`.modal-content` / `.modal-overlay`) | Surface card, `--radius-lg`, `--shadow-lg`; overlay `rgba(20,18,16,.55)` + 3px blur. |
| **Theme toggle** (`.theme-toggle`) | Round 38px physical button: **raised (`--shadow-out`) in light, pressed-in (`--shadow-in`) in dark**, fully opaque icon; hover → accent. |

---

## 6. Splash / landing

Mirrors the greyqub.com hero and gates the app on first load (dismiss persists
via `sessionStorage`). Full markup + CSS is in
[`reference/splash.html`](./reference/splash.html). Structure:

- Top-left `GREY QUB` wordmark with the animated underline sweep (links to the
  marketing site).
- Eyebrow `/bloch-NDA` (mono) · H1 **Real Expertise. / Unreal Intelligence.**
  (Space Grotesk 300, `clamp(42px,7vw,88px)`) · serif-italic tagline with an
  accent `/` · a **Begin →** ink pill.
- Right: a soft tile holding the static **Bloch-axis** SVG, gentle float.
- All colours are tokens, so it themes automatically. Honour reduced-motion.

---

## 7. End-to-end user flow (state map + where each component appears)

The demo is fully client-side/canned; the live app has a backend, but the UX
states and component surfaces are the same. Timings are the demo's simulated
waits — replace with real async.

1. **Splash** (`#splashScreen`) → *Begin* dismisses it. → app shell mounts.
2. **Document Setup modal** (`.modal-content`, title "Document Setup") — opens on
   launch and on upload. Fields: doc type (`.doc-type-option` NDA/NRL), Our
   Client / Counterparty (`input[type=text]`, counterparty required), effective
   date, third-party toggle, transaction purpose, representatives. Primary
   action: **Open Document Viewer** (`.setup-btn-primary`).
3. **Empty state** (`.empty-state`) — "Open an NDA Document" until a file loads.
   Upload via `input[type=file]` / drag onto `.upload-zone`.
4. **Document viewer + header** — `.app-header` (lockup, New Document, Analyze,
   theme toggle, activity sphere) over `.document-container`/`.document-content`.
5. **Analyze** (`Analyze Document`, `.btn-primary`) — ~15s canned, multi-phase
   progress → **Analysis Results** sidebar (`.analysis-sidebar`) with N
   `.provision-card`s, each: `.provision-id`, `.severity-badge`, action
   `.pill`s (Accept/Minimum/Custom), `CURRENT LANGUAGE` quote, `Issue:` note,
   `SUGGESTED MINIMUM FIX` + `.gpt-badge`. Footer "Decisions: x of N".
6. **Decisions** — user resolves each provision (Accept/Minimum/Custom).
7. **Remediate** (`Remediate Document`) — ~5s → status `ok`.
8. **Export** — `button[title^="Export modified document"]` surfaces in the
   header (accent glow); downloads `bloch-NDA_<ts>.docx`. "View Modified"
   (`.view-mode-badge.modified`) toggles the remediated render.

See [`e2e/bloch-nda.spec.ts`](./e2e/bloch-nda.spec.ts) for this flow encoded as
Playwright guardrails (brand strings, theme default, lockup order, component
presence, export-after-remediate) — adapt selectors to the source.

---

## 8. Assets

In [`reference/assets/`](./reference/assets/):
- `icon.svg` — Bloch-axis app/favicon mark (paper bg).
- `mark.svg` — transparent-bg Bloch mark (theme-safe; used where a small inline mark is wanted).
- `spin.svg` — the rotating sphere for the activity indicator (§5).

Grey Qub PWA icons (`icon-16/32/180/192/512.png`) live in the site repo's
`assets/` and `app/assets/`; reuse them for favicons + manifest.

---

## 9. Source-level implementation checklist

- [ ] Add the three font families; set the four `--font-*` tokens.
- [ ] Add light + dark token blocks (§2) to your theme system; set
      `data-theme` on `<html>`, **default light**, persist the user's choice.
- [ ] Global: grain overlay, top sweep, themed scrollbars, reduced-motion.
- [ ] Rework components per §5 (buttons, cards, pills/flags, inputs, upload,
      doc viewer, modal, header lockup, theme toggle, activity sphere, export).
- [ ] Replace the splash with the Grey Qub hero (§6).
- [ ] Apply the brand rename map (§1); leave internal identifiers.
- [ ] Wire the marketing site ↔ app links (Launch Demo / Request Access; app
      wordmark → site), matching what shipped on the site's `bloch-nda.html`.
- [ ] Port/adapt the E2E guardrails (§7) to the source selectors.
