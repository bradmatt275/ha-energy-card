// src/energy-flow-card.ts
// Main Energy Flow Card class

import { LitElement, html, css, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from "custom-card-helpers";

import {
  EnergyFlowCardConfig,
  EnergyState,
  CircuitData,
} from "./types";

import {
  CARD_NAME,
  CARD_VERSION,
  DEFAULT_ANIMATION_CONFIG,
  DEFAULT_DISPLAY_CONFIG,
  DEFAULT_CIRCUITS_CONFIG,
} from "./const";

import {
  calculateFlows,
  calculateHomePower,
  calculateSelfSufficiency,
  calculateTotalSolarPower,
} from "./utils/flow";

// Import components
import "./components/flow-diagram";
import "./components/daily-totals";
import "./components/circuit-grid";
import "./components/battery-summary";
import "./components/inverter-status";
import "./components/ups-status";
import "./components/ev-status";

// Card info for Home Assistant
console.info(
  `%c ENERGY-FLOW-CARD %c v${CARD_VERSION} `,
  "color: white; background: #f59e0b; font-weight: bold;",
  "color: #f59e0b; background: white; font-weight: bold;"
);

// Register card with Home Assistant
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: CARD_NAME,
  name: "Energy Flow Card",
  description: "A card displaying real-time energy flow through your solar/battery system",
  preview: true,
  documentationURL: "https://github.com/mattbrady/energy-flow-card",
});

@customElement(CARD_NAME)
export class EnergyFlowCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: EnergyFlowCardConfig;
  @state() private _state!: EnergyState;

  // Editor configuration
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./editor");
    return document.createElement("energy-flow-card-editor") as LovelaceCardEditor;
  }

  public static getStubConfig(): object {
    return {
      title: "Energy Flow",
      animation: { enabled: true, speed: "auto", dots: true },
      solar: { show: true, arrays: [] },
      grid: { show: true },
      battery: { show: false },
      daily_totals: { show: true },
    };
  }

  public setConfig(config: EnergyFlowCardConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }

    this._config = {
      type: config.type,
      title: config.title ?? "Energy Flow",
      animation: {
        ...DEFAULT_ANIMATION_CONFIG,
        ...config.animation,
      },
      solar: config.solar ?? { show: false },
      grid: config.grid ?? { show: true },
      battery: config.battery ?? { show: false },
      home: config.home ?? {},
      circuits: {
        ...DEFAULT_CIRCUITS_CONFIG,
        ...config.circuits,
      },
      daily_totals: config.daily_totals ?? { show: true },
      ups: config.ups ?? { show: false },
      ev_charger: config.ev_charger ?? { show: false },
      inverter: config.inverter ?? { show: false },
      display: {
        ...DEFAULT_DISPLAY_CONFIG,
        ...config.display,
      },
    };
  }

  public getCardSize(): number {
    let size = 4; // Base for flow diagram
    if (this._config?.daily_totals?.show) size += 1;
    if (this._config?.circuits?.show) size += 2;
    if (this._config?.battery?.show) size += 1;
    if (this._config?.inverter?.show) size += 1;
    if (this._config?.ups?.show || this._config?.ev_charger?.show) size += 1;
    return size;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (changedProps.has("hass") || changedProps.has("_config")) {
      this._updateState();
    }
  }

  private _updateState(): void {
    if (!this.hass || !this._config) return;

    // Calculate solar power
    let solarPower = 0;
    const solarArrays: Array<{ name: string; power: number }> = [];

    if (this._config.solar?.show) {
      if (this._config.solar.total_power) {
        solarPower = this._getNumericState(this._config.solar.total_power) ?? 0;
      }

      if (this._config.solar.arrays) {
        for (const array of this._config.solar.arrays) {
          const power = this._getNumericState(array.power) ?? 0;
          solarArrays.push({ name: array.name, power });
        }
        // If no total_power sensor, sum arrays
        if (!this._config.solar.total_power) {
          solarPower = calculateTotalSolarPower(solarArrays);
        }
      }
    }

    // Get grid power (positive = import, negative = export)
    let gridPower = 0;
    if (this._config.grid?.show) {
      if (this._config.grid.power) {
        gridPower = this._getNumericState(this._config.grid.power) ?? 0;
      } else if (this._config.grid.import_power || this._config.grid.export_power) {
        const importP = this._getNumericState(this._config.grid.import_power) ?? 0;
        const exportP = this._getNumericState(this._config.grid.export_power) ?? 0;
        gridPower = importP - exportP;
      }
    }

    // Get battery power (positive = charging, negative = discharging)
    let batteryPower = 0;
    if (this._config.battery?.show) {
      batteryPower = this._getNumericState(this._config.battery.power) ?? 0;
    }

    // Calculate or get home consumption
    let homePower = 0;
    if (this._config.home?.power) {
      const powerConfig = this._config.home.power;
      const entities = Array.isArray(powerConfig) ? powerConfig : [powerConfig];
      // Sum all entity values
      homePower = entities.reduce((sum, entity) => {
        const value = this._getNumericState(entity);
        return sum + (value ?? 0);
      }, 0);
    } else {
      homePower = calculateHomePower(solarPower, gridPower, batteryPower);
    }

    // Get circuit powers
    const circuits: CircuitData[] = [];
    if (this._config.circuits?.show && this._config.circuits.items) {
      for (const circuit of this._config.circuits.items) {
        circuits.push({
          name: circuit.name,
          icon: circuit.icon ?? "mdi:flash",
          power: this._getNumericState(circuit.power) ?? 0,
          entity: circuit.power,
        });
      }
    }

    // Calculate flows
    const flows = calculateFlows(solarPower, gridPower, batteryPower, homePower);

    // Get daily totals
    const dailyProduction = this._getNumericState(this._config.solar?.daily_production);
    const dailyConsumption = this._getNumericState(this._config.home?.daily_consumption);
    const dailyImport = this._getNumericState(this._config.grid?.daily_import);
    const dailyExport = this._getNumericState(this._config.grid?.daily_export);

    // Calculate self-sufficiency
    const selfSufficiency = calculateSelfSufficiency(dailyConsumption, dailyImport);

    // Build state object
    this._state = {
      solar: {
        power: solarPower,
        arrays: solarArrays,
        dailyProduction,
      },
      grid: {
        power: gridPower,
        importing: gridPower > 0,
        exporting: gridPower < 0,
        dailyImport,
        dailyExport,
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
        dailyConsumption,
      },
      circuits,
      flows,
      selfSufficiency,
      ups: this._config.ups?.show
        ? {
            battery: this._getNumericState(this._config.ups.battery),
            status: this._getStringState(this._config.ups.status),
            load: this._getNumericState(this._config.ups.load),
          }
        : undefined,
      evCharger: this._config.ev_charger?.show
        ? {
            mode: this._getStringState(this._config.ev_charger.mode),
            status: this._getStringState(this._config.ev_charger.status),
            plugStatus: this._getStringState(this._config.ev_charger.plug_status),
            power: this._getNumericState(this._config.ev_charger.power),
          }
        : undefined,
      inverter: this._config.inverter?.show
        ? {
            mode: this._getStringState(this._config.inverter.mode),
            temperature: this._getNumericState(this._config.inverter.temperature),
            dcTemperature: this._getNumericState(this._config.inverter.dc_temperature),
            outputPower: this._getNumericState(this._config.inverter.output_power),
            outputVoltage: this._getNumericState(this._config.inverter.output_voltage),
            outputCurrent: this._getNumericState(this._config.inverter.output_current),
            batterySoc: this._getNumericState(this._config.inverter.battery_soc),
            batteryVoltage: this._getNumericState(this._config.inverter.battery_voltage),
            batteryCurrent: this._getNumericState(this._config.inverter.battery_current),
            gridStatus: this._getStringState(this._config.inverter.grid_status),
          }
        : undefined,
    };
  }

  private _getNumericState(entityId: string | undefined): number | null {
    if (!entityId) return null;
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return null;
    const val = parseFloat(stateObj.state);
    return isNaN(val) ? null : val;
  }

  private _getStringState(entityId: string | undefined): string | null {
    if (!entityId) return null;
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return null;
    return stateObj.state;
  }

  static styles = css`
    :host {
      display: block;

      /* Energy colors */
      --energy-solar: #f59e0b;
      --energy-solar-container: rgba(245, 158, 11, 0.15);
      --energy-grid: #3b82f6;
      --energy-grid-container: rgba(59, 130, 246, 0.15);
      --energy-battery: #10b981;
      --energy-battery-container: rgba(16, 185, 129, 0.15);
      --energy-home: #8b5cf6;
      --energy-home-container: rgba(139, 92, 246, 0.15);

      --energy-success: #4caf50;
      --energy-warning: #ff9800;
      --energy-error: #f44336;
    }

    ha-card {
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 16px 0;
    }

    .card-header .title {
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }

    .optional-section {
      display: flex;
      gap: 12px;
    }

    .optional-section > * {
      flex: 1;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: var(--secondary-text-color);
    }

    @media (max-width: 600px) {
      .optional-section {
        flex-direction: column;
      }
    }
  `;

  protected render(): TemplateResult {
    if (!this._config) {
      return html`<ha-card><div class="loading">No configuration</div></ha-card>`;
    }

    if (!this._state) {
      return html`<ha-card><div class="loading">Loading...</div></ha-card>`;
    }

    return html`
      <ha-card>
        ${this._config.title
          ? html`
              <div class="card-header">
                <span class="title">${this._config.title}</span>
              </div>
            `
          : ""}

        <div class="card-content">
          <!-- Energy Flow Diagram -->
          <energy-flow-diagram
            .solar=${this._state.solar}
            .grid=${this._state.grid}
            .battery=${this._state.battery}
            .home=${this._state.home}
            .flows=${this._state.flows}
            .animation=${this._config.animation}
            .showSolar=${this._config.solar?.show ?? false}
            .showBattery=${this._config.battery?.show ?? false}
            .solarEntity=${this._config.solar?.total_power || this._config.solar?.arrays?.[0]?.power || null}
            .gridEntity=${this._config.grid?.power || null}
            .batteryEntity=${this._config.battery?.soc || this._config.battery?.power || null}
            .homeEntity=${this._config.home?.power || null}
          ></energy-flow-diagram>

          <!-- Daily Totals -->
          ${this._config.daily_totals?.show
            ? html`
                <energy-daily-totals
                  .production=${this._state.solar?.dailyProduction}
                  .consumption=${this._state.home?.dailyConsumption}
                  .gridImport=${this._state.grid?.dailyImport}
                  .gridExport=${this._state.grid?.dailyExport}
                  .selfSufficiency=${this._state.selfSufficiency}
                  .showSelfSufficiency=${this._config.daily_totals.show_self_sufficiency ?? true}
                  .productionEntity=${this._config.solar?.daily_production || null}
                  .consumptionEntity=${this._config.home?.daily_consumption || null}
                  .importEntity=${this._config.grid?.daily_import || null}
                  .exportEntity=${this._config.grid?.daily_export || null}
                ></energy-daily-totals>
              `
            : ""}

          <!-- Battery Summary -->
          ${this._config.battery?.show
            ? html`
                <energy-battery-summary
                  .soc=${this._state.battery?.soc}
                  .power=${this._state.battery?.power}
                  .voltage=${this._state.battery?.voltage}
                  .current=${this._state.battery?.current}
                  .charging=${this._state.battery?.charging ?? false}
                  .socEntity=${this._config.battery?.soc || null}
                  .powerEntity=${this._config.battery?.power || null}
                  .voltageEntity=${this._config.battery?.voltage || null}
                  .currentEntity=${this._config.battery?.current || null}
                ></energy-battery-summary>
              `
            : ""}

          <!-- Inverter Status -->
          ${this._config.inverter?.show
            ? html`
                <energy-inverter-status
                  .hass=${this.hass}
                  .modeEntity=${this._config.inverter?.mode || null}
                  .mode=${this._state.inverter?.mode}
                  .temperature=${this._state.inverter?.temperature}
                  .dcTemperature=${this._state.inverter?.dcTemperature}
                  .outputPower=${this._state.inverter?.outputPower}
                  .outputVoltage=${this._state.inverter?.outputVoltage}
                  .outputCurrent=${this._state.inverter?.outputCurrent}
                  .temperatureEntity=${this._config.inverter?.temperature || null}
                  .dcTemperatureEntity=${this._config.inverter?.dc_temperature || null}
                  .outputPowerEntity=${this._config.inverter?.output_power || null}
                  .outputVoltageEntity=${this._config.inverter?.output_voltage || null}
                  .outputCurrentEntity=${this._config.inverter?.output_current || null}
                  .batterySoc=${this._state.inverter?.batterySoc}
                  .batteryVoltage=${this._state.inverter?.batteryVoltage}
                  .batteryCurrent=${this._state.inverter?.batteryCurrent}
                  .batterySocEntity=${this._config.inverter?.battery_soc || null}
                  .batteryVoltageEntity=${this._config.inverter?.battery_voltage || null}
                  .batteryCurrentEntity=${this._config.inverter?.battery_current || null}
                  .gridStatus=${this._state.inverter?.gridStatus}
                  .gridStatusEntity=${this._config.inverter?.grid_status || null}
                ></energy-inverter-status>
              `
            : ""}

          <!-- Circuits -->
          ${this._config.circuits?.show && this._state.circuits.length > 0
            ? html`
                <energy-circuit-grid
                  .circuits=${this._state.circuits}
                  .columns=${this._config.circuits.columns ?? 5}
                  .highlightTop=${this._config.circuits.highlight_top ?? 0}
                ></energy-circuit-grid>
              `
            : ""}

          <!-- Optional: UPS and EV Charger -->
          ${this._config.ups?.show || this._config.ev_charger?.show
            ? html`
                <div class="optional-section">
                  ${this._config.ups?.show
                    ? html`
                        <energy-ups-status
                          .battery=${this._state.ups?.battery}
                          .status=${this._state.ups?.status}
                          .load=${this._state.ups?.load}
                          .batteryEntity=${this._config.ups?.battery || null}
                          .statusEntity=${this._config.ups?.status || null}
                          .loadEntity=${this._config.ups?.load || null}
                        ></energy-ups-status>
                      `
                    : ""}
                  ${this._config.ev_charger?.show
                    ? html`
                        <energy-ev-status
                          .hass=${this.hass}
                          .modeEntity=${this._config.ev_charger?.mode || null}
                          .mode=${this._state.evCharger?.mode}
                          .status=${this._state.evCharger?.status}
                          .plugStatus=${this._state.evCharger?.plugStatus}
                          .power=${this._state.evCharger?.power}
                        ></energy-ev-status>
                      `
                    : ""}
                </div>
              `
            : ""}
        </div>
      </ha-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-flow-card": EnergyFlowCard;
  }
}
