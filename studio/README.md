# `studio/` — Remotion compositions

Renders the landing-page onboarding MP4. Build-time only — the root MVP stays Vanilla JS, and the rendered MP4 is served as a plain `<video>` from `public/videos/onboarding.mp4`.

## What's here

```
studio/
├── package.json
├── tsconfig.json
├── remotion.config.ts
├── src/
│   ├── index.ts          # registerRoot
│   ├── Root.tsx          # composition registry
│   └── Onboarding.tsx    # the actual 30s onboarding composition
└── README.md
```

## One-time setup

```bash
cd studio
npm install               # installs Remotion + React (~150 MB)
```

## Edit interactively (preview in browser)

```bash
cd studio
npm run studio            # opens http://localhost:3000 with the Remotion Studio
```

Tweak `src/Onboarding.tsx`, save, the preview reloads.

## Render to MP4

```bash
cd studio
npm run render            # writes ../public/videos/onboarding.mp4 (1920x1080 @ 30fps, ~30s)
```

First render downloads a Chromium binary (~150 MB, one-time).

You can also run from the repo root:

```bash
npm run video:render      # same as above
```

## Composition spec

- **Resolution:** 1920×1080 (HD)
- **Frame rate:** 30 fps
- **Duration:** 30 s = 900 frames
- **Output:** H.264 MP4, ~2–4 MB
- **Timeline:**
  - `0–90` Title: "AI use is allowed. Understanding is required."
  - `90–750` Six checkpoint cards (Submit · Explain · Predict · Adapt · Fix · Reflect)
  - `750–900` Outro: "Ready to defend?"

## Why a separate workspace

Remotion needs React and pulls a fairly heavy toolchain. The root MVP is intentionally Vanilla JS for fast cold-start and simple deployment to GitHub Pages. Keeping `studio/` separate means:

- Root `npm install` stays small.
- Contributors who don't touch the video don't pay the install cost.
- The rendered MP4 is committed to `public/videos/`, so end users see it without rebuilding anything.

## When to re-render

- The 6 checkpoint labels in `Onboarding.tsx` should mirror `src/journey/journey.js`. If you change the plain-language labels there, edit `STEPS` here and re-render.
- Brand color or font changes — re-render so the video matches the live UI.
