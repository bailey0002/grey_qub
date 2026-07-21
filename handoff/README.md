# bloch-NDA handoff bundle

Everything a separate thread needs to apply the Grey Qub rebrand + reskin to the
live NDA-analyzer UI. Start with **[`DESIGN-HANDOFF.md`](./DESIGN-HANDOFF.md)**.

```
handoff/
├── DESIGN-HANDOFF.md          ← read this first: brand map, tokens, type,
│                                 component catalog, motion, splash, E2E flow
├── reference/
│   ├── grey-qub.css           ← canonical spec: all tokens (light/dark) + every
│   │                             component treatment (source of truth for values)
│   ├── splash.html            ← the Grey Qub splash/landing implementation
│   └── assets/
│       ├── icon.svg           ← Bloch-axis app/favicon mark
│       ├── mark.svg           ← transparent, theme-safe Bloch mark
│       └── spin.svg           ← rotating sphere for the header activity indicator
└── e2e/
    └── bloch-nda.spec.ts      ← Playwright guardrails: brand, theme default,
                                  lockup order, activity sphere, full analyze→export flow
```

**Do not** ship `reference/grey-qub.css` as an override on top of a built
bundle — it was authored that way only because the prototype had no source.
Fold the tokens and treatments into the real design system. See the checklist in
§9 of `DESIGN-HANDOFF.md`.

The fully-working reference build these were extracted from lives in this repo
under [`../app/`](../app/) (open `app/index.html`).
