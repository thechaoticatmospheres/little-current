# Little Current

[Play the game](https://thechaoticatmospheres.github.io/little-current/game/)

A cozy browser incremental game in a painted naturalist style. Start with a secondhand aquarium and turn its living surplus into an independent fish room.

## What grows here

- Six campaign chapters and a finite ending, followed by continued sandbox play.
- Ten breeding species, two utility companions, ten plant crops and six tank footprints.
- Four cultures, six supply contracts and six complete aquarium recipes.
- Protected breeders, real grow-out capacity, plant reserves, stock transfers and deliberate tank reconfiguration.
- Automatic surplus sales, nursery routing, repeated orders, mature media, purchased templates and directed strain selection.
- Browser saves, import/export, previous-valid backups, pause and up to 24 hours of offline production.
- Gentle animation, reduced motion, reading sizes and optional 5× or 20× open-tab speeds.

Plants naturally overlap equipment. All water and stocking units are game abstractions.

## Run locally

Requires Node.js 22 or newer. No dependency installation is needed.

```sh
npm start
```

Open http://127.0.0.1:4173/game/.

## Test

```sh
npm test
```

Twenty tests cover the economy, stock protection, transactions, saves, content production and a complete legal campaign route from the initial $6. The automated route takes about five productive hours at 1×; player pacing varies.

## Source layout

- `game/content.mjs`: authored content and tuning.
- `game/engine.mjs`: deterministic simulation, commands and save validation.
- `game/app.mjs`: interface and player controls.
- `game/art.mjs` and `design-styles/painted.svg`: layered aquarium illustration.
- `game/persistence.mjs`: browser saves and writer coordination.
- `game/worker.mjs`: offline catch-up.
- `game/campaign-route.mjs`: reproducible campaign playthrough.

## Hosting and saves

GitHub Pages serves the main branch from its root. The root entry redirects to `game/`; all assets use relative paths. The `.nojekyll` file keeps this a plain static site.

Progress stays in your browser. To move an existing localhost room online, export it from the local game's Settings, then import it into the hosted game's Settings. Imports restore the exported snapshot without adding elapsed time. Keep an exported backup before clearing browser data.

This repository contains the playable game source. Supplied research documents, personal planning attachments and test-save snapshots are excluded.
