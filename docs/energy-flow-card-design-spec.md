# Energy Flow Card for Home Assistant

## Project Overview

A custom Lovelace card for Home Assistant that displays real-time energy flow through a home solar/battery system with animated flow visualization, daily totals, circuit-level consumption, and battery summary. Designed to complement the Generic BMS Card with consistent Material You styling.

### Design Goals
- **Real-time visualization**: Animated flow lines showing power direction and magnitude
- **At-a-glance status**: Instantly see where power is coming from and going to
- **Daily context**: Production, consumption, import/export totals
- **Circuit visibility**: See all individual circuit consumption
- **Battery integration**: Aggregated battery status without duplicating BMS card detail
- **Flexible configuration**: Support 1-4 PV strings, optional UPS/EV sections

---

## Visual Design

### Layout Structure (Hero + Details)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Energy Flow                                                    [Settings] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                            ┌─────────────┐                                  │
│                            │   ☀️ SOLAR   │                                  │
│                            │   3,550 W   │                                  │
│                            │  PV1  PV2   │                                  │
│                            │ 3.4k  83W   │                                  │
│                            └──────┬──────┘                                  │
│                                   │                                         │
│                                   ▼ ••••• (animated dots flowing down)      │
│                                   │                                         │
│  ┌─────────────┐            ┌─────┴─────┐            ┌─────────────┐        │
│  │   ⚡ GRID    │◄──•••••───►│  🏠 HOME   │◄───•••••──►│ 🔋 BATTERY  │        │
│  │   51 W      │            │   621 W   │            │  2,956 W   │        │
│  │  importing  │            │           │            │  charging  │        │
│  └─────────────┘            └───────────┘            └─────────────┘        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  TODAY                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │☀️ Produced│ │🏠 Consumed│ │⬇️ Imported│ │⬆️ Exported│ │📊 Self-use│          │
│  │ 12.3 kWh │ │  6.3 kWh │ │  0.4 kWh │ │  0.0 kWh │ │   94%    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├─────────────────────────────────────────────────────────────────────────────┤
│  CIRCUITS                                                                   │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │🔥 Oven     │❄️ House AC  │🔌 PP 1     │🔌 PP 2     │🔌 PP 3     │   │
│  │   -2 W     │    21 W     │    99 W    │     9 W    │     4 W    │   │
│  ├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤   │
│  │🚗 EV       │🏠 Garage AC │💡 Lights 1 │💡 Lights 2 │🌳 Backyard │   │
│  │    4 W     │     3 W     │     9 W    │    10 W    │    33 W    │   │
│  ├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤   │
│  │❄️ Freezer  │💻 PC        │🧊 Fridge   │            │            │   │
│  │   70 W     │     3 W     │   115 W    │            │            │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│  BATTERY                                                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │  ████████████████████░░░░░░  59.1%   │  53.4 V  │  55.5 A  │ 2,956 W ││
│  └────────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐          │
│  │  🔌 UPS                      │  │  🚗 EV CHARGER               │          │
│  │  100% • Online • 22% load   │  │  Stopped • Disconnected     │          │
│  └─────────────────────────────┘  └─────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Material You Color Palette

```css
:root {
  /* Energy source colors */
  --energy-solar: #F59E0B;           /* Amber 500 - solar production */
  --energy-solar-container: #FEF3C7; /* Amber 100 */
  
  --energy-grid: #3B82F6;            /* Blue 500 - grid power */
  --energy-grid-container: #DBEAFE; /* Blue 100 */
  
  --energy-battery: #10B981;         /* Emerald 500 - battery */
  --energy-battery-container: #D1FAE5; /* Emerald 100 */
  
  --energy-home: #8B5CF6;            /* Violet 500 - consumption */
  --energy-home-container: #EDE9FE; /* Violet 100 */
  
  /* Flow states */
  --flow-active: currentColor;       /* Animated flow */
  --flow-inactive: var(--divider-color); /* No flow */
  
  /* Status colors (inherited from BMS card) */
  --energy-success: #4CAF50;
  --energy-warning: #FF9800;
  --energy-error: #F44336;
}
```

### Flow Animation

```css
/* Animated flowing dots */
.flow-line {
  stroke-dasharray: 8 4;
  animation: flow var(--flow-speed, 1s) linear infinite;
}

.flow-line.reverse {
  animation-direction: reverse;
}

.flow-line.inactive {
  stroke-dasharray: none;
  opacity: 0.3;
  animation: none;
}

@keyframes flow {
  from { stroke-dashoffset: 12; }
  to { stroke-dashoffset: 0; }
}

/* Flow speed based on power magnitude */
/* Higher power = faster animation */
.flow-line.power-high { --flow-speed: 0.3s; }
.flow-line.power-medium { --flow-speed: 0.6s; }
.flow-line.power-low { --flow-speed: 1s; }
```

### Typography
- **Section titles**: 12sp, Medium weight, uppercase, secondary color
- **Node labels**: 14sp, Medium weight
- **Power values**: 24sp, Medium weight (hero nodes), 16sp (details)
- **Units**: 14sp, Regular weight, secondary color
- **Circuit values**: 14sp, Regular weight

---

## Configuration Schema

### YAML Configuration

```yaml
type: custom:energy-flow-card
title: "Energy Flow"

# Animation settings
animation:
  enabled: true
  speed: auto          # 'auto' (based on power), 'fast', 'medium', 'slow'
  dots: true           # Use dots vs dashed line

# Solar configuration
solar:
  show: true
  arrays:              # Support 1-4 PV strings
    - name: "PV1"
      power: sensor.deye_inverter_pv1_power
    - name: "PV2"
      power: sensor.deye_inverter_pv2_power
  total_power: sensor.deye_inverter_pv_total_power  # Optional, calculated if not provided
  daily_production: sensor.deye_inverter_today_production

# Grid configuration
grid:
  show: true
  power: sensor.power_grid_power         # Positive = import, negative = export
  # OR separate sensors:
  import_power: sensor.grid_import_power
  export_power: sensor.grid_export_power
  daily_import: sensor.grid_daily_import
  daily_export: sensor.grid_daily_export
  price: sensor.power_grid_supply_price  # Optional, current $/kWh

# Home/consumption configuration
home:
  power: sensor.home_consumption_power   # Optional, calculated from sources if not provided
  daily_consumption: sensor.home_daily_consumption

# Battery configuration
battery:
  show: true
  power: sensor.pack_battery_power       # Positive = charging, negative = discharging
  soc: sensor.pack_battery_soc
  voltage: sensor.pack_battery_voltage
  current: sensor.pack_battery_current
  # Optional state sensor
  state: sensor.deye_inverter_battery_state  # 'charging', 'discharging', 'idle'

# Circuits configuration
circuits:
  show: true
  columns: 5           # Number of columns in grid
  highlight_top: 3     # Highlight top N consumers (optional)
  items:
    - name: "Oven"
      icon: "mdi:stove"
      power: sensor.oven_power
    - name: "House AC"
      icon: "mdi:air-conditioner"
      power: sensor.house_ac_power
    - name: "Power Point 1"
      icon: "mdi:power-socket-au"
      power: sensor.power_point_1_power
    - name: "Power Point 2"
      icon: "mdi:power-socket-au"
      power: sensor.power_point_2_power
    - name: "Power Point 3"
      icon: "mdi:power-socket-au"
      power: sensor.power_point_3_power
    - name: "EV Charger"
      icon: "mdi:ev-station"
      power: sensor.ev_charger_power
    - name: "Garage AC"
      icon: "mdi:air-conditioner"
      power: sensor.garage_ac_power
    - name: "Lights 1"
      icon: "mdi:lightbulb-group"
      power: sensor.lights_1_power
    - name: "Lights 2"
      icon: "mdi:lightbulb-group"
      power: sensor.lights_2_power
    - name: "Back Yard"
      icon: "mdi:tree"
      power: sensor.backyard_power
    - name: "Freezer"
      icon: "mdi:fridge"
      power: sensor.freezer_power
    - name: "PC"
      icon: "mdi:desktop-tower"
      power: sensor.pc_power
    - name: "Fridge"
      icon: "mdi:fridge-outline"
      power: sensor.fridge_power

# Daily totals configuration
daily_totals:
  show: true
  show_self_sufficiency: true   # Calculate and show self-consumption %
  
# Optional sections
ups:
  show: true
  battery: sensor.cyberpower_ups_battery_charge
  status: sensor.cyberpower_ups_status
  load: sensor.cyberpower_ups_load

ev_charger:
  show: true
  mode: sensor.car_charger_charge_mode
  status: sensor.car_charger_status
  plug_status: sensor.car_charger_plug_status
  power: sensor.car_charger_charging_rate

# Display options
display:
  compact_mode: false
  show_units: true
  decimal_places: 1
  power_unit: auto     # 'W', 'kW', or 'auto' (switches at 1000W)
```

---

## Component Architecture

### File Structure

```
energy-flow-card/
├── dist/
│   └── energy-flow-card.js
├── src/
│   ├── energy-flow-card.ts       # Main card class
│   ├── editor.ts                 # Visual config editor
│   ├── types.ts                  # TypeScript interfaces
│   ├── const.ts                  # Constants & defaults
│   ├── styles.ts                 # CSS-in-JS styles
│   │
│   ├── components/
│   │   ├── flow-diagram.ts       # SVG flow visualization
│   │   ├── energy-node.ts        # Solar/Grid/Home/Battery nodes
│   │   ├── flow-line.ts          # Animated connection lines
│   │   ├── daily-totals.ts       # Daily stats row
│   │   ├── circuit-grid.ts       # Circuit consumption grid
│   │   ├── circuit-chip.ts       # Individual circuit chip
│   │   ├── battery-summary.ts    # Aggregated battery bar
│   │   ├── ups-status.ts         # UPS status card
│   │   └── ev-status.ts          # EV charger status card
│   │
│   └── utils/
│       ├── power.ts              # Power calculations & formatting
│       ├── flow.ts               # Flow direction & magnitude logic
│       └── color.ts              # Color utilities
│
├── package.json
├── rollup.config.js
├── tsconfig.json
└── hacs.json
```

### Main Card Class

```typescript
// src/energy-flow-card.ts
import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard } from "custom-card-helpers";

import { EnergyFlowConfig, EnergyState, FlowDirection } from "./types";
import { styles } from "./styles";
import { calculateFlows, getFlowSpeed } from "./utils/flow";
import { formatPower } from "./utils/power";

import "./components/flow-diagram";
import "./components/daily-totals";
import "./components/circuit-grid";
import "./components/battery-summary";
import "./components/ups-status";
import "./components/ev-status";

@customElement("energy-flow-card")
export class EnergyFlowCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: EnergyFlowConfig;
  @state() private _state!: EnergyState;

  static styles = styles;

  public setConfig(config: EnergyFlowConfig): void {
    if (!config) throw new Error("Invalid configuration");
    
    this._config = {
      title: config.title || "Energy Flow",
      animation: {
        enabled: config.animation?.enabled ?? true,
        speed: config.animation?.speed || "auto",
        dots: config.animation?.dots ?? true,
      },
      solar: config.solar || { show: false },
      grid: config.grid || { show: true },
      battery: config.battery || { show: false },
      home: config.home || {},
      circuits: config.circuits || { show: false, items: [] },
      daily_totals: config.daily_totals || { show: true },
      ups: config.ups || { show: false },
      ev_charger: config.ev_charger || { show: false },
      display: {
        compact_mode: config.display?.compact_mode ?? false,
        show_units: config.display?.show_units ?? true,
        decimal_places: config.display?.decimal_places ?? 1,
        power_unit: config.display?.power_unit || "auto",
      },
    };
  }

  protected updated(changedProps: PropertyValues): void {
    if (changedProps.has("hass") || changedProps.has("_config")) {
      this._updateState();
    }
  }

  private _updateState(): void {
    if (!this.hass || !this._config) return;

    // Calculate solar power (sum of arrays or use total sensor)
    let solarPower = 0;
    const solarArrays: Array<{ name: string; power: number }> = [];
    
    if (this._config.solar?.show) {
      if (this._config.solar.total_power) {
        solarPower = this._getNumericState(this._config.solar.total_power) || 0;
      }
      
      if (this._config.solar.arrays) {
        for (const array of this._config.solar.arrays) {
          const power = this._getNumericState(array.power) || 0;
          solarArrays.push({ name: array.name, power });
          if (!this._config.solar.total_power) {
            solarPower += power;
          }
        }
      }
    }

    // Get grid power (positive = import, negative = export)
    let gridPower = 0;
    if (this._config.grid?.show) {
      if (this._config.grid.power) {
        gridPower = this._getNumericState(this._config.grid.power) || 0;
      } else {
        const importP = this._getNumericState(this._config.grid.import_power) || 0;
        const exportP = this._getNumericState(this._config.grid.export_power) || 0;
        gridPower = importP - exportP;
      }
    }

    // Get battery power (positive = charging, negative = discharging)
    let batteryPower = 0;
    if (this._config.battery?.show) {
      batteryPower = this._getNumericState(this._config.battery.power) || 0;
    }

    // Calculate home consumption
    // Home = Solar + Grid Import - Grid Export - Battery Charging + Battery Discharging
    // Or: Home = Solar + Grid - Battery (where signs handle direction)
    let homePower = 0;
    if (this._config.home?.power) {
      homePower = this._getNumericState(this._config.home.power) || 0;
    } else {
      // Calculate: what goes into the house
      // Solar produces, grid can import(+) or export(-), battery can charge(+) or discharge(-)
      // Home = Solar - BatteryCharging + BatteryDischarging + GridImport - GridExport
      // With our sign convention: Home = Solar - Battery + Grid (when battery+ = charging, grid+ = import)
      // Actually: Home = Solar + GridImport - GridExport - BatteryCharge + BatteryDischarge
      // Simplified: Home = Solar - Battery + Grid (if battery positive = charging, grid positive = import)
      homePower = solarPower - batteryPower + gridPower;
    }

    // Get circuit powers
    const circuits: Array<{ name: string; icon: string; power: number }> = [];
    if (this._config.circuits?.show && this._config.circuits.items) {
      for (const circuit of this._config.circuits.items) {
        circuits.push({
          name: circuit.name,
          icon: circuit.icon || "mdi:flash",
          power: this._getNumericState(circuit.power) || 0,
        });
      }
    }

    // Calculate flows
    const flows = calculateFlows(solarPower, gridPower, batteryPower, homePower);

    this._state = {
      solar: {
        power: solarPower,
        arrays: solarArrays,
        dailyProduction: this._getNumericState(this._config.solar?.daily_production),
      },
      grid: {
        power: gridPower,
        importing: gridPower > 0,
        exporting: gridPower < 0,
        dailyImport: this._getNumericState(this._config.grid?.daily_import),
        dailyExport: this._getNumericState(this._config.grid?.daily_export),
        price: this._getNumericState(this._config.grid?.price),
      },
      battery: {
        power: batteryPower,
        soc: this._getNumericState(this._config.battery?.soc),
        voltage: this._getNumericState(this._config.battery?.voltage),
        current: this._getNumericState(this._config.battery?.current),
        charging: batteryPower > 0,
        discharging: batteryPower < 0,
      },
      home: {
        power: homePower,
        dailyConsumption: this._getNumericState(this._config.home?.daily_consumption),
      },
      circuits,
      flows,
      selfSufficiency: this._calculateSelfSufficiency(),
      ups: this._config.ups?.show ? {
        battery: this._getNumericState(this._config.ups.battery),
        status: this._getStringState(this._config.ups.status),
        load: this._getNumericState(this._config.ups.load),
      } : undefined,
      evCharger: this._config.ev_charger?.show ? {
        mode: this._getStringState(this._config.ev_charger.mode),
        status: this._getStringState(this._config.ev_charger.status),
        plugStatus: this._getStringState(this._config.ev_charger.plug_status),
        power: this._getNumericState(this._config.ev_charger.power),
      } : undefined,
    };
  }

  private _getNumericState(entityId: string | undefined): number | null {
    if (!entityId || !this.hass.states[entityId]) return null;
    const val = parseFloat(this.hass.states[entityId].state);
    return isNaN(val) ? null : val;
  }

  private _getStringState(entityId: string | undefined): string | null {
    if (!entityId || !this.hass.states[entityId]) return null;
    return this.hass.states[entityId].state;
  }

  private _calculateSelfSufficiency(): number | null {
    const produced = this._state?.solar?.dailyProduction;
    const consumed = this._state?.home?.dailyConsumption;
    const imported = this._state?.grid?.dailyImport;
    
    if (consumed === null || consumed === undefined || consumed === 0) return null;
    if (imported === null || imported === undefined) return null;
    
    // Self-sufficiency = (Consumed - Imported) / Consumed * 100
    // Or: (Solar used directly + Battery discharge) / Consumed
    const selfConsumed = consumed - imported;
    return Math.max(0, Math.min(100, (selfConsumed / consumed) * 100));
  }

  protected render() {
    if (!this._config || !this._state) {
      return html`<ha-card>Loading...</ha-card>`;
    }

    const { _config: config, _state: state } = this;

    return html`
      <ha-card>
        <div class="card-header">
          <span class="title">${config.title}</span>
        </div>

        <div class="card-content">
          <!-- Energy Flow Diagram -->
          <energy-flow-diagram
            .solar=${state.solar}
            .grid=${state.grid}
            .battery=${state.battery}
            .home=${state.home}
            .flows=${state.flows}
            .animation=${config.animation}
            .showSolar=${config.solar?.show}
            .showBattery=${config.battery?.show}
          ></energy-flow-diagram>

          <!-- Daily Totals -->
          ${config.daily_totals?.show ? html`
            <energy-daily-totals
              .production=${state.solar?.dailyProduction}
              .consumption=${state.home?.dailyConsumption}
              .gridImport=${state.grid?.dailyImport}
              .gridExport=${state.grid?.dailyExport}
              .selfSufficiency=${state.selfSufficiency}
            ></energy-daily-totals>
          ` : ""}

          <!-- Circuits -->
          ${config.circuits?.show ? html`
            <energy-circuit-grid
              .circuits=${state.circuits}
              .columns=${config.circuits.columns || 5}
              .highlightTop=${config.circuits.highlight_top}
            ></energy-circuit-grid>
          ` : ""}

          <!-- Battery Summary -->
          ${config.battery?.show ? html`
            <energy-battery-summary
              .soc=${state.battery?.soc}
              .power=${state.battery?.power}
              .voltage=${state.battery?.voltage}
              .current=${state.battery?.current}
              .charging=${state.battery?.charging}
            ></energy-battery-summary>
          ` : ""}

          <!-- Optional: UPS and EV Charger -->
          ${config.ups?.show || config.ev_charger?.show ? html`
            <div class="optional-section">
              ${config.ups?.show ? html`
                <energy-ups-status
                  .battery=${state.ups?.battery}
                  .status=${state.ups?.status}
                  .load=${state.ups?.load}
                ></energy-ups-status>
              ` : ""}
              
              ${config.ev_charger?.show ? html`
                <energy-ev-status
                  .mode=${state.evCharger?.mode}
                  .status=${state.evCharger?.status}
                  .plugStatus=${state.evCharger?.plugStatus}
                  .power=${state.evCharger?.power}
                ></energy-ev-status>
              ` : ""}
            </div>
          ` : ""}
        </div>
      </ha-card>
    `;
  }

  public getCardSize(): number {
    let size = 4; // Base for flow diagram
    if (this._config.daily_totals?.show) size += 1;
    if (this._config.circuits?.show) size += 2;
    if (this._config.battery?.show) size += 1;
    if (this._config.ups?.show || this._config.ev_charger?.show) size += 1;
    return size;
  }
}
```

### Flow Diagram Component

```typescript
// src/components/flow-diagram.ts
import { LitElement, html, svg, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { SolarState, GridState, BatteryState, HomeState, FlowState, AnimationConfig } from "../types";
import { formatPower } from "../utils/power";

@customElement("energy-flow-diagram")
export class EnergyFlowDiagram extends LitElement {
  @property({ type: Object }) solar!: SolarState;
  @property({ type: Object }) grid!: GridState;
  @property({ type: Object }) battery!: BatteryState;
  @property({ type: Object }) home!: HomeState;
  @property({ type: Object }) flows!: FlowState;
  @property({ type: Object }) animation!: AnimationConfig;
  @property({ type: Boolean }) showSolar = true;
  @property({ type: Boolean }) showBattery = true;

  static styles = css`
    :host {
      display: block;
    }

    .flow-container {
      position: relative;
      width: 100%;
      padding: 16px;
    }

    .flow-svg {
      width: 100%;
      height: 200px;
    }

    /* Node styling */
    .node {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 16px;
      border-radius: 16px;
      min-width: 100px;
    }

    .node-solar {
      background: var(--energy-solar-container, #FEF3C7);
      color: var(--energy-solar, #F59E0B);
    }

    .node-grid {
      background: var(--energy-grid-container, #DBEAFE);
      color: var(--energy-grid, #3B82F6);
    }

    .node-home {
      background: var(--energy-home-container, #EDE9FE);
      color: var(--energy-home, #8B5CF6);
    }

    .node-battery {
      background: var(--energy-battery-container, #D1FAE5);
      color: var(--energy-battery, #10B981);
    }

    .node-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .node-label {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      opacity: 0.8;
    }

    .node-power {
      font-size: 20px;
      font-weight: 600;
    }

    .node-status {
      font-size: 11px;
      opacity: 0.7;
    }

    .node-arrays {
      display: flex;
      gap: 12px;
      font-size: 12px;
      margin-top: 4px;
      opacity: 0.8;
    }

    /* Flow lines */
    .flow-line {
      fill: none;
      stroke-width: 3;
      stroke-linecap: round;
    }

    .flow-line.active {
      stroke-dasharray: 8 4;
      animation: flowAnimation var(--flow-duration, 1s) linear infinite;
    }

    .flow-line.reverse {
      animation-direction: reverse;
    }

    .flow-line.inactive {
      opacity: 0.2;
      stroke-dasharray: none;
    }

    .flow-line.solar { stroke: var(--energy-solar, #F59E0B); }
    .flow-line.grid { stroke: var(--energy-grid, #3B82F6); }
    .flow-line.battery { stroke: var(--energy-battery, #10B981); }

    /* Speed classes */
    .flow-line.speed-fast { --flow-duration: 0.3s; }
    .flow-line.speed-medium { --flow-duration: 0.6s; }
    .flow-line.speed-slow { --flow-duration: 1s; }

    @keyframes flowAnimation {
      from { stroke-dashoffset: 12; }
      to { stroke-dashoffset: 0; }
    }

    /* Layout */
    .nodes-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }

    .top-row {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .middle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
    }
  `;

  protected render() {
    const solarFlow = this.flows?.solarToHome || 0;
    const solarToBattery = this.flows?.solarToBattery || 0;
    const gridFlow = this.flows?.gridToHome || 0;
    const gridExport = this.flows?.homeToGrid || 0;
    const batteryFlow = this.flows?.batteryToHome || 0;
    const batteryCharge = this.flows?.homeToBattery || 0;

    return html`
      <div class="flow-container">
        <!-- Top Row: Solar -->
        ${this.showSolar ? html`
          <div class="top-row">
            <div class="node node-solar">
              <ha-icon class="node-icon" icon="mdi:solar-power"></ha-icon>
              <span class="node-label">Solar</span>
              <span class="node-power">${formatPower(this.solar?.power || 0)}</span>
              ${this.solar?.arrays && this.solar.arrays.length > 1 ? html`
                <div class="node-arrays">
                  ${this.solar.arrays.map(arr => html`
                    <span>${arr.name}: ${formatPower(arr.power)}</span>
                  `)}
                </div>
              ` : ""}
            </div>
          </div>
        ` : ""}

        <!-- SVG Flow Lines -->
        <svg class="flow-svg" viewBox="0 0 400 100" preserveAspectRatio="xMidYMid meet">
          <!-- Solar to Home -->
          ${this.showSolar && solarFlow > 0 ? svg`
            <path 
              class="flow-line solar active ${this._getSpeedClass(solarFlow)}"
              d="M 200 0 L 200 50"
            />
          ` : ""}
          
          <!-- Grid to Home -->
          ${gridFlow > 0 ? svg`
            <path 
              class="flow-line grid active ${this._getSpeedClass(gridFlow)}"
              d="M 50 50 L 150 50"
            />
          ` : gridExport > 0 ? svg`
            <path 
              class="flow-line grid active reverse ${this._getSpeedClass(gridExport)}"
              d="M 50 50 L 150 50"
            />
          ` : svg`
            <path class="flow-line grid inactive" d="M 50 50 L 150 50" />
          `}

          <!-- Battery to Home -->
          ${this.showBattery && batteryFlow > 0 ? svg`
            <path 
              class="flow-line battery active reverse ${this._getSpeedClass(batteryFlow)}"
              d="M 350 50 L 250 50"
            />
          ` : this.showBattery && batteryCharge > 0 ? svg`
            <path 
              class="flow-line battery active ${this._getSpeedClass(batteryCharge)}"
              d="M 250 50 L 350 50"
            />
          ` : this.showBattery ? svg`
            <path class="flow-line battery inactive" d="M 250 50 L 350 50" />
          ` : ""}
        </svg>

        <!-- Middle Row: Grid - Home - Battery -->
        <div class="middle-row">
          <!-- Grid Node -->
          <div class="node node-grid">
            <ha-icon class="node-icon" icon="mdi:transmission-tower"></ha-icon>
            <span class="node-label">Grid</span>
            <span class="node-power">${formatPower(Math.abs(this.grid?.power || 0))}</span>
            <span class="node-status">
              ${this.grid?.importing ? "importing" : this.grid?.exporting ? "exporting" : "idle"}
            </span>
          </div>

          <!-- Home Node -->
          <div class="node node-home">
            <ha-icon class="node-icon" icon="mdi:home"></ha-icon>
            <span class="node-label">Home</span>
            <span class="node-power">${formatPower(this.home?.power || 0)}</span>
          </div>

          <!-- Battery Node -->
          ${this.showBattery ? html`
            <div class="node node-battery">
              <ha-icon class="node-icon" icon="mdi:battery-high"></ha-icon>
              <span class="node-label">Battery</span>
              <span class="node-power">${formatPower(Math.abs(this.battery?.power || 0))}</span>
              <span class="node-status">
                ${this.battery?.charging ? "charging" : this.battery?.discharging ? "discharging" : "idle"}
              </span>
            </div>
          ` : ""}
        </div>
      </div>
    `;
  }

  private _getSpeedClass(power: number): string {
    if (this.animation?.speed !== "auto") {
      return `speed-${this.animation?.speed || "medium"}`;
    }
    if (power > 2000) return "speed-fast";
    if (power > 500) return "speed-medium";
    return "speed-slow";
  }
}
```

### Circuit Grid Component

```typescript
// src/components/circuit-grid.ts
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CircuitData } from "../types";
import { formatPower } from "../utils/power";

@customElement("energy-circuit-grid")
export class EnergyCircuitGrid extends LitElement {
  @property({ type: Array }) circuits: CircuitData[] = [];
  @property({ type: Number }) columns = 5;
  @property({ type: Number }) highlightTop = 0;

  static styles = css`
    :host {
      display: block;
    }

    .section-title {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      color: var(--secondary-text-color);
      margin-bottom: 8px;
      padding: 0 4px;
    }

    .circuit-grid {
      display: grid;
      gap: 8px;
    }

    .circuit-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color, rgba(255,255,255,0.1));
      border-radius: 12px;
      transition: background-color 0.2s ease;
    }

    .circuit-chip.highlight {
      background: var(--energy-warning-container, #FEF3C7);
      border-color: var(--energy-warning, #F59E0B);
    }

    .circuit-chip.zero {
      opacity: 0.5;
    }

    .circuit-icon {
      color: var(--secondary-text-color);
      --mdc-icon-size: 18px;
    }

    .circuit-chip.highlight .circuit-icon {
      color: var(--energy-warning, #F59E0B);
    }

    .circuit-info {
      flex: 1;
      min-width: 0;
    }

    .circuit-name {
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .circuit-power {
      font-size: 14px;
      font-weight: 600;
      font-family: monospace;
    }
  `;

  protected render() {
    const gridStyle = `grid-template-columns: repeat(${this.columns}, 1fr);`;
    
    // Sort circuits by power for highlighting
    const sortedCircuits = [...this.circuits].sort((a, b) => Math.abs(b.power) - Math.abs(a.power));
    const topConsumers = this.highlightTop > 0 
      ? sortedCircuits.slice(0, this.highlightTop).map(c => c.name)
      : [];

    return html`
      <div class="section-title">Circuits</div>
      <div class="circuit-grid" style="${gridStyle}">
        ${this.circuits.map(circuit => {
          const isHighlight = topConsumers.includes(circuit.name) && circuit.power > 0;
          const isZero = circuit.power === 0;
          
          return html`
            <div class="circuit-chip ${isHighlight ? 'highlight' : ''} ${isZero ? 'zero' : ''}">
              <ha-icon class="circuit-icon" icon="${circuit.icon}"></ha-icon>
              <div class="circuit-info">
                <div class="circuit-name">${circuit.name}</div>
                <div class="circuit-power">${formatPower(circuit.power)}</div>
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }
}
```

### Battery Summary Component

```typescript
// src/components/battery-summary.ts
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { formatPower } from "../utils/power";

@customElement("energy-battery-summary")
export class EnergyBatterySummary extends LitElement {
  @property({ type: Number }) soc: number | null = null;
  @property({ type: Number }) power: number | null = null;
  @property({ type: Number }) voltage: number | null = null;
  @property({ type: Number }) current: number | null = null;
  @property({ type: Boolean }) charging = false;

  static styles = css`
    :host {
      display: block;
    }

    .section-title {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      color: var(--secondary-text-color);
      margin-bottom: 8px;
      padding: 0 4px;
    }

    .battery-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color, rgba(255,255,255,0.1));
      border-radius: 12px;
    }

    .soc-container {
      flex: 1;
      max-width: 200px;
    }

    .soc-bar {
      height: 24px;
      background: var(--divider-color, rgba(255,255,255,0.1));
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    }

    .soc-fill {
      height: 100%;
      background: var(--energy-battery, #10B981);
      border-radius: 12px;
      transition: width 0.5s ease;
    }

    .soc-fill.charging {
      background: linear-gradient(
        90deg,
        var(--energy-battery, #10B981) 0%,
        var(--energy-solar, #F59E0B) 100%
      );
    }

    .soc-fill.low {
      background: var(--energy-warning, #FF9800);
    }

    .soc-fill.critical {
      background: var(--energy-error, #F44336);
    }

    .soc-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 12px;
      border-left: 1px solid var(--divider-color, rgba(255,255,255,0.1));
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      font-family: monospace;
    }

    .stat-label {
      font-size: 10px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
    }

    .stat.power .stat-value {
      color: ${this.charging ? 'var(--energy-solar, #F59E0B)' : 'var(--energy-home, #8B5CF6)'};
    }
  `;

  protected render() {
    const soc = this.soc ?? 0;
    const socClass = soc <= 10 ? 'critical' : soc <= 20 ? 'low' : this.charging ? 'charging' : '';

    return html`
      <div class="section-title">Battery</div>
      <div class="battery-bar">
        <div class="soc-container">
          <div class="soc-bar">
            <div class="soc-fill ${socClass}" style="width: ${soc}%"></div>
            <span class="soc-text">${soc.toFixed(1)}%</span>
          </div>
        </div>
        
        <div class="stat">
          <span class="stat-value">${this.voltage?.toFixed(1) ?? '—'} V</span>
          <span class="stat-label">Voltage</span>
        </div>
        
        <div class="stat">
          <span class="stat-value">${this.current?.toFixed(1) ?? '—'} A</span>
          <span class="stat-label">Current</span>
        </div>
        
        <div class="stat power">
          <span class="stat-value">${formatPower(Math.abs(this.power ?? 0))}</span>
          <span class="stat-label">${this.charging ? 'Charging' : 'Discharging'}</span>
        </div>
      </div>
    `;
  }
}
```

### Daily Totals Component

```typescript
// src/components/daily-totals.ts
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("energy-daily-totals")
export class EnergyDailyTotals extends LitElement {
  @property({ type: Number }) production: number | null = null;
  @property({ type: Number }) consumption: number | null = null;
  @property({ type: Number }) gridImport: number | null = null;
  @property({ type: Number }) gridExport: number | null = null;
  @property({ type: Number }) selfSufficiency: number | null = null;

  static styles = css`
    :host {
      display: block;
    }

    .section-title {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      color: var(--secondary-text-color);
      margin-bottom: 8px;
      padding: 0 4px;
    }

    .totals-grid {
      display: flex;
      gap: 8px;
    }

    .total-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 8px;
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color, rgba(255,255,255,0.1));
      border-radius: 12px;
    }

    .total-icon {
      --mdc-icon-size: 20px;
      margin-bottom: 4px;
    }

    .total-icon.solar { color: var(--energy-solar, #F59E0B); }
    .total-icon.home { color: var(--energy-home, #8B5CF6); }
    .total-icon.import { color: var(--energy-grid, #3B82F6); }
    .total-icon.export { color: var(--energy-battery, #10B981); }
    .total-icon.self { color: var(--energy-success, #4CAF50); }

    .total-value {
      font-size: 16px;
      font-weight: 600;
    }

    .total-label {
      font-size: 10px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
    }
  `;

  protected render() {
    return html`
      <div class="section-title">Today</div>
      <div class="totals-grid">
        <div class="total-card">
          <ha-icon class="total-icon solar" icon="mdi:solar-power"></ha-icon>
          <span class="total-value">${this._formatEnergy(this.production)}</span>
          <span class="total-label">Produced</span>
        </div>
        
        <div class="total-card">
          <ha-icon class="total-icon home" icon="mdi:home-lightning-bolt"></ha-icon>
          <span class="total-value">${this._formatEnergy(this.consumption)}</span>
          <span class="total-label">Consumed</span>
        </div>
        
        <div class="total-card">
          <ha-icon class="total-icon import" icon="mdi:transmission-tower-import"></ha-icon>
          <span class="total-value">${this._formatEnergy(this.gridImport)}</span>
          <span class="total-label">Imported</span>
        </div>
        
        <div class="total-card">
          <ha-icon class="total-icon export" icon="mdi:transmission-tower-export"></ha-icon>
          <span class="total-value">${this._formatEnergy(this.gridExport)}</span>
          <span class="total-label">Exported</span>
        </div>
        
        <div class="total-card">
          <ha-icon class="total-icon self" icon="mdi:percent"></ha-icon>
          <span class="total-value">${this.selfSufficiency?.toFixed(0) ?? '—'}%</span>
          <span class="total-label">Self-use</span>
        </div>
      </div>
    `;
  }

  private _formatEnergy(value: number | null): string {
    if (value === null) return '—';
    return `${value.toFixed(1)} kWh`;
  }
}
```

---

## Types Definition

```typescript
// src/types.ts

export interface EnergyFlowConfig {
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
  display?: DisplayConfig;
}

export interface AnimationConfig {
  enabled: boolean;
  speed: "auto" | "fast" | "medium" | "slow";
  dots: boolean;
}

export interface SolarConfig {
  show: boolean;
  arrays?: Array<{
    name: string;
    power: string;
  }>;
  total_power?: string;
  daily_production?: string;
}

export interface GridConfig {
  show: boolean;
  power?: string;
  import_power?: string;
  export_power?: string;
  daily_import?: string;
  daily_export?: string;
  price?: string;
}

export interface BatteryConfig {
  show: boolean;
  power?: string;
  soc?: string;
  voltage?: string;
  current?: string;
  state?: string;
}

export interface HomeConfig {
  power?: string;
  daily_consumption?: string;
}

export interface CircuitsConfig {
  show: boolean;
  columns?: number;
  highlight_top?: number;
  items?: Array<{
    name: string;
    icon?: string;
    power: string;
  }>;
}

export interface DailyTotalsConfig {
  show: boolean;
  show_self_sufficiency?: boolean;
}

export interface UPSConfig {
  show: boolean;
  battery?: string;
  status?: string;
  load?: string;
}

export interface EVChargerConfig {
  show: boolean;
  mode?: string;
  status?: string;
  plug_status?: string;
  power?: string;
}

export interface DisplayConfig {
  compact_mode?: boolean;
  show_units?: boolean;
  decimal_places?: number;
  power_unit?: "W" | "kW" | "auto";
}

// State interfaces
export interface EnergyState {
  solar?: SolarState;
  grid?: GridState;
  battery?: BatteryState;
  home?: HomeState;
  circuits: CircuitData[];
  flows: FlowState;
  selfSufficiency: number | null;
  ups?: UPSState;
  evCharger?: EVChargerState;
}

export interface SolarState {
  power: number;
  arrays: Array<{ name: string; power: number }>;
  dailyProduction: number | null;
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
```

---

## Utility Functions

```typescript
// src/utils/power.ts

export function formatPower(watts: number, unit: "W" | "kW" | "auto" = "auto"): string {
  const absWatts = Math.abs(watts);
  
  if (unit === "kW" || (unit === "auto" && absWatts >= 1000)) {
    return `${(watts / 1000).toFixed(1)} kW`;
  }
  
  return `${Math.round(watts)} W`;
}

export function formatEnergy(kwh: number | null): string {
  if (kwh === null) return "—";
  return `${kwh.toFixed(1)} kWh`;
}


// src/utils/flow.ts

import { FlowState } from "../types";

export function calculateFlows(
  solarPower: number,
  gridPower: number,
  batteryPower: number,
  homePower: number
): FlowState {
  // Solar always flows to home first, excess to battery or grid
  // Battery positive = charging, negative = discharging
  // Grid positive = import, negative = export
  
  const flows: FlowState = {
    solarToHome: 0,
    solarToBattery: 0,
    gridToHome: 0,
    homeToGrid: 0,
    batteryToHome: 0,
    homeToBattery: 0,
  };

  // Solar production
  if (solarPower > 0) {
    // Solar goes to home consumption first
    flows.solarToHome = Math.min(solarPower, Math.max(0, homePower));
    
    const solarExcess = solarPower - flows.solarToHome;
    
    // Excess solar charges battery
    if (solarExcess > 0 && batteryPower > 0) {
      flows.solarToBattery = Math.min(solarExcess, batteryPower);
    }
  }

  // Grid flows
  if (gridPower > 0) {
    flows.gridToHome = gridPower;
  } else if (gridPower < 0) {
    flows.homeToGrid = Math.abs(gridPower);
  }

  // Battery flows
  if (batteryPower > 0) {
    flows.homeToBattery = batteryPower;
  } else if (batteryPower < 0) {
    flows.batteryToHome = Math.abs(batteryPower);
  }

  return flows;
}

export function getFlowSpeed(power: number): "fast" | "medium" | "slow" {
  if (power > 2000) return "fast";
  if (power > 500) return "medium";
  return "slow";
}
```

---

## Example Configuration (Your Setup)

```yaml
type: custom:energy-flow-card
title: "Energy Flow"

animation:
  enabled: true
  speed: auto

solar:
  show: true
  arrays:
    - name: "PV1"
      power: sensor.deye_inverter_pv1_power
    - name: "PV2"
      power: sensor.deye_inverter_pv2_power
  daily_production: sensor.deye_inverter_today_production

grid:
  show: true
  power: sensor.power_grid_power
  daily_import: sensor.grid_daily_import
  daily_export: sensor.grid_daily_export
  price: sensor.power_grid_supply_price

battery:
  show: true
  power: sensor.pack_battery_power
  soc: sensor.pack_battery_soc
  voltage: sensor.pack_battery_voltage
  current: sensor.pack_battery_current

home:
  daily_consumption: sensor.home_daily_consumption

circuits:
  show: true
  columns: 5
  highlight_top: 3
  items:
    - name: "Oven"
      icon: "mdi:stove"
      power: sensor.oven_power
    - name: "House AC"
      icon: "mdi:air-conditioner"
      power: sensor.house_ac_power
    - name: "PP 1"
      icon: "mdi:power-socket-au"
      power: sensor.power_point_1_power
    - name: "PP 2"
      icon: "mdi:power-socket-au"
      power: sensor.power_point_2_power
    - name: "PP 3"
      icon: "mdi:power-socket-au"
      power: sensor.power_point_3_power
    - name: "EV Charger"
      icon: "mdi:ev-station"
      power: sensor.ev_charger_power
    - name: "Garage AC"
      icon: "mdi:air-conditioner"
      power: sensor.garage_ac_power
    - name: "Lights 1"
      icon: "mdi:lightbulb-group"
      power: sensor.lights_1_power
    - name: "Lights 2"
      icon: "mdi:lightbulb-group"
      power: sensor.lights_2_power
    - name: "Backyard"
      icon: "mdi:tree"
      power: sensor.backyard_power
    - name: "Freezer"
      icon: "mdi:fridge"
      power: sensor.freezer_power
    - name: "PC"
      icon: "mdi:desktop-tower"
      power: sensor.pc_power
    - name: "Fridge"
      icon: "mdi:fridge-outline"
      power: sensor.fridge_power

daily_totals:
  show: true
  show_self_sufficiency: true

ups:
  show: true
  battery: sensor.cyberpower_ups_battery_charge
  status: sensor.cyberpower_ups_status
  load: sensor.cyberpower_ups_load

ev_charger:
  show: true
  mode: sensor.car_charger_charge_mode
  status: sensor.car_charger_status
  plug_status: sensor.car_charger_plug_status
  power: sensor.car_charger_charging_rate
```

---

## Implementation Notes for Copilot

### Key Points

1. **Flow calculation priority**: Solar feeds home first, then battery, then grid export
2. **Animation speed**: Scale with power magnitude for intuitive feedback
3. **Power sign conventions**: 
   - Battery: positive = charging, negative = discharging
   - Grid: positive = import, negative = export
4. **Home power**: Can be provided directly or calculated from sources
5. **Self-sufficiency**: (Consumed - Imported) / Consumed × 100

### Material You Consistency

- Use same border-radius values as BMS card (16px card, 12px sections, 8px elements)
- Same color variables for status (success/warning/error)
- Same typography scale
- Same spacing (16px card padding, 8-12px element gaps)

### SVG Flow Diagram

- Use viewBox for responsive scaling
- Curved paths for visual appeal (quadratic bezier)
- Line thickness can vary with power magnitude
- Consider glow effect on high-power flows

### Testing Checklist

- [ ] Animation toggles on/off correctly
- [ ] Speed scales with power (auto mode)
- [ ] Flows reverse direction correctly
- [ ] Missing entities don't break card
- [ ] Multiple PV arrays sum correctly
- [ ] Grid export shows correctly
- [ ] Self-sufficiency calculates accurately
- [ ] Circuits sort by power for highlighting
- [ ] Dark/light theme compatibility
