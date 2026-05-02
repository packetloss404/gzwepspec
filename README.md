# WepSpec Armory

A React + Three.js prototype for planning Gray Zone Warfare weapon builds.

## What It Does

- Select a weapon platform and install compatible parts by slot.
- Unlock or lock parts based on platform tags and previously installed parts.
- Sum weapon and part stats live.
- Preview the assembled weapon in a procedural 3D viewer.
- Try quick build intents: Balanced, CQB, Marksman, and Suppressed.

## Data Model

The catalog lives in `src/data/armory.ts`. Parts can:

- require tags, such as `upper_picatinny` or `thread_1_2x28`
- provide tags, such as `bottom_picatinny` after adding a rail adapter
- target platform families, such as `ar15`, `ak`, or `glock`
- contribute stat deltas

This lets the builder model nested attachment chains without hardcoding UI logic.

## Run

```bash
npm install
npm run dev
```

Then open `http://127.0.0.1:5173`.

## Notes

The included weapon and part catalog is a starter set shaped around public community references and the known nested attachment behavior. It is ready for expansion with a fuller in-game item export or curated database.
