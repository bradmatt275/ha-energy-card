// src/utils/flow.ts
// Flow calculation and direction utilities

import { FlowState, FlowSpeed } from "../types";

/**
 * Calculate energy flows between sources
 * 
 * Power sign conventions:
 * - Solar: Always positive (production)
 * - Battery: Positive = charging, Negative = discharging
 * - Grid: Positive = importing, Negative = exporting
 * - Home: Always positive (consumption)
 */
export function calculateFlows(
  solarPower: number,
  gridPower: number,
  batteryPower: number,
  homePower: number
): FlowState {
  const flows: FlowState = {
    solarToHome: 0,
    solarToBattery: 0,
    gridToHome: 0,
    homeToGrid: 0,
    batteryToHome: 0,
    homeToBattery: 0,
  };

  // Solar production flows
  if (solarPower > 0) {
    // Solar feeds home first
    flows.solarToHome = Math.min(solarPower, Math.max(0, homePower));

    const solarExcess = solarPower - flows.solarToHome;

    // Excess solar charges battery
    if (solarExcess > 0 && batteryPower > 0) {
      flows.solarToBattery = Math.min(solarExcess, batteryPower);
    }
  }

  // Grid flows
  if (gridPower > 0) {
    // Importing from grid
    flows.gridToHome = gridPower;
  } else if (gridPower < 0) {
    // Exporting to grid
    flows.homeToGrid = Math.abs(gridPower);
  }

  // Battery flows
  if (batteryPower > 0) {
    // Battery charging (power flowing into battery)
    flows.homeToBattery = batteryPower;
  } else if (batteryPower < 0) {
    // Battery discharging (power flowing out of battery)
    flows.batteryToHome = Math.abs(batteryPower);
  }

  return flows;
}

/**
 * Get animation speed class based on power magnitude
 */
export function getFlowSpeed(power: number): FlowSpeed {
  const absPower = Math.abs(power);
  if (absPower > 2000) return "fast";
  if (absPower > 500) return "medium";
  return "slow";
}

/**
 * Get CSS animation duration based on power
 */
export function getFlowDuration(power: number, speed: "auto" | FlowSpeed = "auto"): string {
  if (speed !== "auto") {
    switch (speed) {
      case "fast": return "0.3s";
      case "medium": return "0.6s";
      case "slow": return "1s";
    }
  }

  const flowSpeed = getFlowSpeed(power);
  switch (flowSpeed) {
    case "fast": return "0.3s";
    case "medium": return "0.6s";
    case "slow": return "1s";
  }
}

/**
 * Check if a flow is active (has power flowing)
 */
export function isFlowActive(power: number, threshold: number = 1): boolean {
  return Math.abs(power) >= threshold;
}

/**
 * Calculate home power from other sources
 * Home = Solar - Battery + Grid
 * Where: Battery+ = charging, Grid+ = import
 */
export function calculateHomePower(
  solarPower: number,
  gridPower: number,
  batteryPower: number
): number {
  return solarPower - batteryPower + gridPower;
}

/**
 * Calculate self-sufficiency percentage
 * Self-sufficiency = (Consumed - Imported) / Consumed * 100
 */
export function calculateSelfSufficiency(
  consumed: number | null,
  imported: number | null
): number | null {
  if (consumed === null || consumed === undefined || consumed === 0) return null;
  if (imported === null || imported === undefined) return null;

  const selfConsumed = consumed - imported;
  return Math.max(0, Math.min(100, (selfConsumed / consumed) * 100));
}

/**
 * Calculate total solar power from arrays
 */
export function calculateTotalSolarPower(
  arrays: Array<{ name: string; power: number }>
): number {
  return arrays.reduce((total, arr) => total + arr.power, 0);
}
