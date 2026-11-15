// src/utils/overrides.ts
// Per-device display overrides from URL query params, persisted to localStorage.
//
// Lets a kiosk opt into a different layout purely via its launch URL, e.g.
//   /lovelace/energy?efc_layout=landscape&efc_effects=reduced&efc_scale=1.25
// Values are stored so they survive HA's in-app navigation (which can drop the
// query string). Pass "reset" as any efc_* value to clear stored overrides.

import { CardLayout } from "../types";
import { OVERRIDES_STORAGE_KEY, SCALE_MAX, SCALE_MIN } from "../const";

export interface DisplayOverrides {
  layout?: CardLayout;
  reduced_effects?: boolean;
  scale?: number;
}

const LAYOUTS: CardLayout[] = ["auto", "portrait", "landscape"];

function readStored(): DisplayOverrides {
  try {
    const raw = window.localStorage.getItem(OVERRIDES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DisplayOverrides) : {};
  } catch {
    return {};
  }
}

function writeStored(overrides: DisplayOverrides): void {
  try {
    if (Object.keys(overrides).length === 0) {
      window.localStorage.removeItem(OVERRIDES_STORAGE_KEY);
    } else {
      window.localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
    }
  } catch {
    // Storage unavailable (private mode, blocked) - URL params still apply this load
  }
}

/** Parse a scale value, returning undefined if invalid. */
export function parseScale(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (!isFinite(n)) return undefined;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, n));
}

/**
 * Resolve the current device's overrides: apply any efc_* URL params on top of
 * the stored set, persist the result, and return it.
 */
export function resolveOverrides(search: string = window.location.search): DisplayOverrides {
  const params = new URLSearchParams(search);
  const keys = ["efc_layout", "efc_effects", "efc_scale"];
  const present = keys.filter((k) => params.has(k));

  if (present.length === 0) {
    return readStored();
  }

  if (present.some((k) => params.get(k)?.toLowerCase() === "reset")) {
    writeStored({});
    return {};
  }

  const overrides = readStored();

  const layout = params.get("efc_layout")?.toLowerCase();
  if (layout && (LAYOUTS as string[]).includes(layout)) {
    overrides.layout = layout as CardLayout;
  }

  const effects = params.get("efc_effects")?.toLowerCase();
  if (effects === "reduced") overrides.reduced_effects = true;
  else if (effects === "full") overrides.reduced_effects = false;

  if (params.has("efc_scale")) {
    const scale = parseScale(params.get("efc_scale"));
    if (scale !== undefined) overrides.scale = scale;
  }

  writeStored(overrides);
  return overrides;
}
