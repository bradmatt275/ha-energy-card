# Plan: Landscape Layout & Kiosk Mode

**Status:** Planned — not started (on hold pending kiosk hardware decision)
**Created:** 2026-11-15

## Goal

Support a landscape-optimised layout for wall/kiosk displays (e.g. Raspberry Pi + spare monitor) **without** needing a duplicate dashboard. The same dashboard should render portrait on phones/desktop and landscape on the kiosk, with per-device overrides via URL parameters.

## Background

The card currently renders a single vertical stack in `src/energy-flow-card.ts` (`render()`):

1. `energy-flow-diagram`
2. `energy-daily-totals`
3. `energy-battery-summary`
4. `energy-inverter-status`
5. `energy-circuit-grid`
6. `energy-ups-status`
7. `energy-ev-status`

Each section is a self-contained component, so landscape is primarily a **container layout change** — the sub-components should need little or no modification.

## Design

### 1. `layout` config option

```yaml
type: custom:energy-flow-card
layout: auto        # auto | portrait | landscape (default: auto)
```

- `portrait` — current behaviour (vertical stack).
- `landscape` — CSS grid: flow diagram as the large hero panel on the left; secondary sections (daily totals, battery, inverter, UPS, EV) stacked in a right-hand column; circuit grid optionally spanning the bottom full width.
- `auto` — choose based on the **card's own width/aspect** (CSS container queries on the card root, or a `ResizeObserver`), *not* the viewport, so it behaves correctly inside HA columns/sections.
- Add to the visual editor (`src/editor.ts`) as a dropdown.

### 2. `reduced_effects` config option

```yaml
reduced_effects: false   # default false
```

For low-power devices (Pi 3/4). When enabled:

- Remove `backdrop-filter: blur(12px)` in `src/components/flow-diagram.ts` (~line 260) — the most expensive effect on a Pi GPU.
- Disable node pulse effects.
- Slow down / simplify flow-line animations (fewer animated elements, longer durations).
- Also respect `prefers-reduced-motion`.

### 3. Optional: `font_scale`

A single CSS variable multiplier (e.g. `--efc-font-scale`) so text is readable from across a room. Cheap to add alongside the above.

### 4. Optional: fit-to-viewport

A landscape variant that sizes to `100vh` with no scrolling, for non-interactive wall displays. Pairs with HA's **Panel** view.

## Per-device overrides via URL parameters

Allows the kiosk to opt in purely via its launch URL, leaving the dashboard config untouched:

```
http://homeassistant.local:8123/lovelace/energy?efc_layout=landscape&efc_effects=reduced
```

| Parameter      | Values                                 | Maps to           |
|----------------|----------------------------------------|-------------------|
| `efc_layout`   | `auto`, `portrait`, `landscape`        | `layout`          |
| `efc_effects`  | `full`, `reduced`                      | `reduced_effects` |
| `efc_scale`    | number, e.g. `1.25` (if implemented)   | `font_scale`      |
| any `efc_*`    | `reset`                                | clear stored overrides |

- Prefix `efc_` avoids collisions with other plugins (e.g. `kiosk-mode` uses `?kiosk`).
- **Precedence:** URL param → stored override (localStorage) → card YAML config → default.

### Persistence (important)

HA's in-app navigation can drop the query string when switching views. To make overrides sticky:

- On load, if an `efc_*` param is present, write it to `localStorage` (e.g. key `energy-flow-card:overrides`).
- On subsequent loads, read overrides from `localStorage` when no URL param is present.
- `?efc_layout=reset` (or any `efc_*=reset`) clears stored overrides.
- Wrap all `localStorage` access in try/catch (private mode etc.).

Other devices (phones, desktop) never see the param, so they are unaffected.

## Implementation steps

1. Add `layout`, `reduced_effects` (and optionally `font_scale`) to `src/types.ts` config types + defaults in `src/const.ts`.
2. Add an override resolver utility (e.g. `src/utils/overrides.ts`): parse `efc_*` URL params, persist/read `localStorage`, apply precedence.
3. Update `render()` in `src/energy-flow-card.ts` to wrap sections in a layout container with a `layout-portrait` / `layout-landscape` class (or grid areas); implement `auto` via container query / `ResizeObserver`.
4. Add landscape grid CSS (in the card styles, alongside the existing `@media (max-width: 600px)` rules).
5. Implement `reduced_effects` class toggling the blur/pulse/animation rules in `flow-diagram.ts` and `flow-line.ts`.
6. Update `getCardSize()` / grid options for landscape.
7. Add editor controls in `src/editor.ts` for `layout` and `reduced_effects`.
8. Document in `README.md`: new options, URL params, `localStorage` persistence, and a kiosk setup section.
9. Test: portrait (unchanged), landscape at 1920×1080 and 1280×720, `auto` in narrow columns and panel view, URL param + persistence across view navigation, reset.

## Kiosk setup notes (outside the card — for README)

- Use HA **Panel** view (or full-width Sections view) so the card fills the screen.
- Chromium on Pi OS in `--kiosk` mode, launch URL including the `efc_*` params.
- `kiosk-mode` HACS plugin to hide the HA header/sidebar.
- Disable screen blanking (or schedule it).

## Hardware notes

- **Pi 5:** comfortable at 1080p, likely fine even with full effects.
- **Pi 4 (2GB+):** usable at 1080p; `reduced_effects` recommended. Avoid 4K.
- **Pi 3 / Zero 2:** likely too slow for Chromium + HA frontend.
- **Intel N100 mini PC:** no-compromise alternative; handles 4K, ~6–10W idle.

## Open questions

- Which hardware/resolution will the kiosk use? (Determines whether `reduced_effects` is essential and whether fit-to-viewport is worth doing first.)
- Should right-column section order be configurable, or is a fixed sensible default enough? (Start fixed.)
- Is the display touch-enabled? (Affects whether click-to-details and EV mode controls matter in landscape.)
