// src/types.ts
// TypeScript interfaces for Energy Flow Card

import { LovelaceCardConfig } from "custom-card-helpers";

// ============================================================================
// Configuration Types
// ============================================================================

export interface EnergyFlowCardConfig extends LovelaceCardConfig {
  type: string;
  title?: string;
  animation?: AnimationConfig;
  solar?: SolarConfig;
  grid?: GridConfig;
  battery?: BatteryConfig;
  home?: HomeConfig;
  circuits?: CircuitsConfig;
  daily_totals?: DailyTotalsConfig;
  ups?: UPSConfig;
  ev_charger?: EVChargerConfig;
  inverter?: InverterConfig;
  display?: DisplayConfig;
}

export interface AnimationConfig {
  enabled?: boolean;
  speed?: "auto" | "fast" | "medium" | "slow";
  dots?: boolean;
}

export interface SolarConfig {
  show?: boolean;
  arrays?: SolarArrayConfig[];
  total_power?: string;
  daily_production?: string;
}

export interface SolarArrayConfig {
  name: string;
  power: string;
}

export interface GridConfig {
  show?: boolean;
  power?: string;
  import_power?: string;
  export_power?: string;
  daily_import?: string;
  daily_export?: string;
  price?: string;
}

export interface BatteryConfig {
  show?: boolean;
  power?: string;
  soc?: string;
  voltage?: string;
  current?: string;
  state?: string;
}

export interface HomeConfig {
  power?: string | string[];
  daily_consumption?: string;
}

export interface CircuitsConfig {
  show?: boolean;
  columns?: number;
  highlight_top?: number;
  items?: CircuitItemConfig[];
}

export interface CircuitItemConfig {
  name: string;
  icon?: string;
  power: string;
}

export interface DailyTotalsConfig {
  show?: boolean;
  show_self_sufficiency?: boolean;
}

export interface UPSConfig {
  show?: boolean;
  battery?: string;
  status?: string;
  load?: string;
}

export interface EVChargerConfig {
  show?: boolean;
  mode?: string;
  status?: string;
  plug_status?: string;
  power?: string;
}

export interface InverterConfig {
  show?: boolean;
  mode?: string;
  temperature?: string;
  dc_temperature?: string;
  output_power?: string;
  output_voltage?: string;
  output_current?: string;
  battery_soc?: string;
  battery_voltage?: string;
  battery_current?: string;
  grid_status?: string;
}

export interface DisplayConfig {
  compact_mode?: boolean;
  show_units?: boolean;
  decimal_places?: number;
  power_unit?: "W" | "kW" | "auto";
}

// ============================================================================
// State Types (Runtime Data)
// ============================================================================

export interface EnergyState {
  solar: SolarState;
  grid: GridState;
  battery: BatteryState;
  home: HomeState;
  circuits: CircuitData[];
  flows: FlowState;
  selfSufficiency: number | null;
  ups?: UPSState;
  evCharger?: EVChargerState;
  inverter?: InverterState;
}

export interface SolarState {
  power: number;
  arrays: SolarArrayData[];
  dailyProduction: number | null;
}

export interface SolarArrayData {
  name: string;
  power: number;
}

export interface GridState {
  power: number;
  importing: boolean;
  exporting: boolean;
  dailyImport: number | null;
  dailyExport: number | null;
  price: number | null;
}

export interface BatteryState {
  power: number;
  soc: number | null;
  voltage: number | null;
  current: number | null;
  charging: boolean;
  discharging: boolean;
}

export interface HomeState {
  power: number;
  dailyConsumption: number | null;
}

export interface CircuitData {
  name: string;
  icon: string;
  power: number;
  entity?: string;
}

export interface FlowState {
  solarToHome: number;
  solarToBattery: number;
  gridToHome: number;
  homeToGrid: number;
  batteryToHome: number;
  homeToBattery: number;
}

export interface UPSState {
  battery: number | null;
  status: string | null;
  load: number | null;
}

export interface EVChargerState {
  mode: string | null;
  status: string | null;
  plugStatus: string | null;
  power: number | null;
}

export interface InverterState {
  mode: string | null;
  temperature: number | null;
  dcTemperature: number | null;
  outputPower: number | null;
  outputVoltage: number | null;
  outputCurrent: number | null;
  batterySoc: number | null;
  batteryVoltage: number | null;
  batteryCurrent: number | null;
  gridStatus: string | null;
}

// ============================================================================
// Component Property Types
// ============================================================================

export type FlowSpeed = "fast" | "medium" | "slow";

export type EnergySource = "solar" | "grid" | "battery" | "home";

export interface NodeConfig {
  type: EnergySource;
  icon: string;
  label: string;
  power: number;
  status?: string;
  details?: string;
}

// ============================================================================
// Card Registration
// ============================================================================

// Remove conflicting declarations - these are declared inline in components
