// src/utils/power.ts
// Power formatting utilities

/**
 * Format a power value in watts to a human-readable string
 * Automatically switches between W and kW based on magnitude
 */
export function formatPower(
  watts: number,
  unit: "W" | "kW" | "auto" = "auto",
  decimals: number = 1
): string {
  const absWatts = Math.abs(watts);

  if (unit === "kW" || (unit === "auto" && absWatts >= 1000)) {
    return `${(watts / 1000).toFixed(decimals)} kW`;
  }

  return `${Math.round(watts)} W`;
}

/**
 * Format an energy value in kWh
 */
export function formatEnergy(kwh: number | null, decimals: number = 1): string {
  if (kwh === null || kwh === undefined) return "—";
  return `${kwh.toFixed(decimals)} kWh`;
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number | null, decimals: number = 0): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a voltage value
 */
export function formatVoltage(volts: number | null, decimals: number = 1): string {
  if (volts === null || volts === undefined) return "—";
  return `${volts.toFixed(decimals)} V`;
}

/**
 * Format a current value
 */
export function formatCurrent(amps: number | null, decimals: number = 1): string {
  if (amps === null || amps === undefined) return "—";
  return `${amps.toFixed(decimals)} A`;
}

/**
 * Format a price value
 */
export function formatPrice(price: number | null, currency: string = "$", decimals: number = 2): string {
  if (price === null || price === undefined) return "—";
  return `${currency}${price.toFixed(decimals)}/kWh`;
}

/**
 * Sum only positive power values from an array of numbers
 * Useful for home consumption calculation where negative values (e.g., export) should not reduce consumption
 */
export function sumPositivePowers(values: (number | null | undefined)[]): number {
  return values.reduce((sum: number, value) => {
    if (value !== null && value !== undefined && value > 0) {
      return sum + value;
    }
    return sum;
  }, 0);
}

/**
 * Fire a Home Assistant more-info dialog event for an entity
 */
export function fireMoreInfo(element: HTMLElement, entityId: string | null | undefined): void {
  if (!entityId) return;
  
  const event = new CustomEvent("hass-more-info", {
    bubbles: true,
    composed: true,
    detail: { entityId },
  });
  element.dispatchEvent(event);
}
