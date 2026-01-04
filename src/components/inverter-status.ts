// src/components/inverter-status.ts
// Inverter status component with mode selector

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { formatPower, fireMoreInfo } from "../utils/power";
import type { HomeAssistant } from "custom-card-helpers";

@customElement("energy-inverter-status")
export class EnergyInverterStatus extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: String }) modeEntity: string | null = null;
  @property({ type: String }) mode: string | null = null;
  @property({ type: Number }) temperature: number | null = null;
  @property({ type: Number }) dcTemperature: number | null = null;
  @property({ type: Number }) outputPower: number | null = null;
  @property({ type: Number }) outputVoltage: number | null = null;
  @property({ type: Number }) outputCurrent: number | null = null;
  @property({ type: String }) temperatureEntity: string | null = null;
  @property({ type: String }) dcTemperatureEntity: string | null = null;
  @property({ type: String }) outputPowerEntity: string | null = null;
  @property({ type: String }) outputVoltageEntity: string | null = null;
  @property({ type: String }) outputCurrentEntity: string | null = null;
  @property({ type: Number }) batterySoc: number | null = null;
  @property({ type: Number }) batteryVoltage: number | null = null;
  @property({ type: Number }) batteryCurrent: number | null = null;
  @property({ type: String }) batterySocEntity: string | null = null;
  @property({ type: String }) batteryVoltageEntity: string | null = null;
  @property({ type: String }) batteryCurrentEntity: string | null = null;

  @state() private _showModeSelector = false;

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
      letter-spacing: 0.5px;
    }

    .inverter-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
      border-radius: 12px;
    }

    .inverter-icon {
      --mdc-icon-size: 32px;
      color: #8b5cf6;
      flex-shrink: 0;
    }

    .inverter-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }

    .inverter-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .inverter-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    /* Mode selector styles */
    .mode-selector-wrapper {
      position: relative;
    }

    .inverter-mode {
      text-transform: capitalize;
      font-size: 12px;
      padding: 2px 8px;
      background: var(--divider-color, rgba(255, 255, 255, 0.1));
      border-radius: 4px;
      color: var(--secondary-text-color);
    }

    .inverter-mode.clickable {
      cursor: pointer;
      transition: background 0.2s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .inverter-mode.clickable:hover {
      background: rgba(139, 92, 246, 0.2);
    }

    .inverter-mode.clickable ha-icon {
      --mdc-icon-size: 14px;
      color: var(--secondary-text-color);
    }

    .mode-dropdown {
      position: absolute;
      bottom: 100%;
      left: 0;
      z-index: 100;
      min-width: 140px;
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.2));
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      margin-bottom: 4px;
    }

    .mode-option {
      padding: 10px 12px;
      cursor: pointer;
      font-size: 13px;
      text-transform: capitalize;
      color: var(--primary-text-color);
      transition: background 0.15s ease;
    }

    .mode-option:hover {
      background: var(--divider-color, rgba(255, 255, 255, 0.1));
    }

    .mode-option.active {
      background: #8b5cf6;
      color: var(--text-primary-color, white);
    }

    .mode-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 99;
    }

    .stats-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4px 12px;
      background: var(--divider-color, rgba(255, 255, 255, 0.05));
      border-radius: 8px;
      transition: background 0.2s ease;
      min-width: 60px;
    }

    .stat.clickable {
      cursor: pointer;
    }

    .stat.clickable:hover {
      background: rgba(139, 92, 246, 0.15);
    }

    .stat-value {
      font-size: 14px;
      font-weight: 600;
      font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
      color: var(--primary-text-color);
    }

    .stat-label {
      font-size: 10px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .stat.temperature .stat-value {
      color: #f59e0b;
    }

    .stat.power .stat-value {
      color: #8b5cf6;
    }

    .stat.voltage .stat-value {
      color: #3b82f6;
    }

    .stat.current .stat-value {
      color: #10b981;
    }

    .stat.soc .stat-value {
      color: #a855f7;
    }

    @media (max-width: 600px) {
      .inverter-card {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .inverter-header {
        justify-content: flex-start;
      }

      .stats-row {
        justify-content: space-around;
      }
    }
  `;

  protected render() {
    // Get mode options from entity if available
    const modeOptions = this._getModeOptions();
    const canSelectMode = modeOptions.length > 0 && this.hass && this.modeEntity;

    return html`
      <div class="section-title">Inverter</div>
      <div class="inverter-card">
        <ha-icon class="inverter-icon" icon="mdi:power-plug-outline"></ha-icon>
        
        <div class="inverter-info">
          <div class="inverter-header">
            <span class="inverter-label">Inverter</span>
            ${this.mode
              ? canSelectMode
                ? html`
                    <div class="mode-selector-wrapper">
                      <span 
                        class="inverter-mode clickable" 
                        @click=${this._toggleModeSelector}
                      >
                        ${this.mode}
                        <ha-icon icon="mdi:chevron-down"></ha-icon>
                      </span>
                      ${this._showModeSelector
                        ? html`
                            <div class="mode-backdrop" @click=${this._closeModeSelector}></div>
                            <div class="mode-dropdown">
                              ${modeOptions.map(
                                (option) => html`
                                  <div
                                    class="mode-option ${option === this.mode ? 'active' : ''}"
                                    @click=${() => this._selectMode(option)}
                                  >
                                    ${option}
                                  </div>
                                `
                              )}
                            </div>
                          `
                        : ""}
                    </div>
                  `
                : html`<span class="inverter-mode">${this.mode}</span>`
              : ""}
          </div>
          
          <div class="stats-row">
            ${this.temperature !== null
              ? html`
                  <div 
                    class="stat temperature ${this.temperatureEntity ? 'clickable' : ''}"
                    @click=${() => this._handleClick(this.temperatureEntity)}
                  >
                    <span class="stat-value">${this._formatTemperature(this.temperature)}</span>
                    <span class="stat-label">Inv Temp</span>
                  </div>
                `
              : ""}
            ${this.dcTemperature !== null
              ? html`
                  <div 
                    class="stat temperature ${this.dcTemperatureEntity ? 'clickable' : ''}"
                    @click=${() => this._handleClick(this.dcTemperatureEntity)}
                  >
                    <span class="stat-value">${this._formatTemperature(this.dcTemperature)}</span>
                    <span class="stat-label">DC Temp</span>
                  </div>
                `
              : ""}
            ${this.outputPower !== null
              ? html`
                  <div 
                    class="stat power ${this.outputPowerEntity ? 'clickable' : ''}"
                    @click=${() => this._handleClick(this.outputPowerEntity)}
                  >
                    <span class="stat-value">${formatPower(this.outputPower)}</span>
                    <span class="stat-label">Output</span>
                  </div>
                `
              : ""}
            ${this.outputVoltage !== null
              ? html`
                  <div 
                    class="stat voltage ${this.outputVoltageEntity ? 'clickable' : ''}"
                    @click=${() => this._handleClick(this.outputVoltageEntity)}
                  >
                    <span class="stat-value">${this._formatVoltage(this.outputVoltage)}</span>
                    <span class="stat-label">Voltage</span>
                  </div>
                `
              : ""}
            ${this.outputCurrent !== null
              ? html`
                  <div 
                    class="stat current ${this.outputCurrentEntity ? 'clickable' : ''}"
                    @click=${() => this._handleClick(this.outputCurrentEntity)}
                  >
                    <span class="stat-value">${this._formatCurrent(this.outputCurrent)}</span>
                    <span class="stat-label">Current</span>
                  </div>
                `
              : ""}
            ${this.batterySoc !== null
              ? html`
                  <div 
                    class="stat soc ${this.batterySocEntity ? 'clickable' : ''}"
                    @click=${() => this._handleClick(this.batterySocEntity)}
                  >
                    <span class="stat-value">${this._formatPercent(this.batterySoc)}</span>
                    <span class="stat-label">Batt SOC</span>
                  </div>
                `
              : ""}
            ${this.batteryVoltage !== null
              ? html`
                  <div 
                    class="stat voltage ${this.batteryVoltageEntity ? 'clickable' : ''}"
                    @click=${() => this._handleClick(this.batteryVoltageEntity)}
                  >
                    <span class="stat-value">${this._formatVoltage(this.batteryVoltage)}</span>
                    <span class="stat-label">Batt V</span>
                  </div>
                `
              : ""}
            ${this.batteryCurrent !== null
              ? html`
                  <div 
                    class="stat current ${this.batteryCurrentEntity ? 'clickable' : ''}"
                    @click=${() => this._handleClick(this.batteryCurrentEntity)}
                  >
                    <span class="stat-value">${this._formatCurrent(this.batteryCurrent)}</span>
                    <span class="stat-label">Batt A</span>
                  </div>
                `
              : ""}
          </div>
        </div>
      </div>
    `;
  }

  private _getModeOptions(): string[] {
    if (!this.hass || !this.modeEntity) return [];
    
    const stateObj = this.hass.states[this.modeEntity];
    if (!stateObj) return [];

    // For select/input_select entities, options are in attributes
    const options = stateObj.attributes?.options;
    if (Array.isArray(options)) {
      return options;
    }

    return [];
  }

  private _toggleModeSelector(e: Event): void {
    e.stopPropagation();
    this._showModeSelector = !this._showModeSelector;
  }

  private _closeModeSelector(): void {
    this._showModeSelector = false;
  }

  private async _selectMode(option: string): Promise<void> {
    if (!this.hass || !this.modeEntity) return;

    this._showModeSelector = false;

    // Determine the domain to call the right service
    const domain = this.modeEntity.split(".")[0];
    
    try {
      if (domain === "select") {
        await this.hass.callService("select", "select_option", {
          entity_id: this.modeEntity,
          option: option,
        });
      } else if (domain === "input_select") {
        await this.hass.callService("input_select", "select_option", {
          entity_id: this.modeEntity,
          option: option,
        });
      }
    } catch (err) {
      console.error("Failed to set inverter mode:", err);
    }
  }

  private _handleClick(entityId: string | null): void {
    fireMoreInfo(this, entityId);
  }

  private _formatTemperature(value: number | null): string {
    if (value === null || value === undefined) return "—";
    return `${value.toFixed(1)}°C`;
  }

  private _formatVoltage(value: number | null): string {
    if (value === null || value === undefined) return "—";
    return `${value.toFixed(1)} V`;
  }

  private _formatCurrent(value: number | null): string {
    if (value === null || value === undefined) return "—";
    return `${value.toFixed(1)} A`;
  }

  private _formatPercent(value: number | null): string {
    if (value === null || value === undefined) return "—";
    return `${value.toFixed(1)}%`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-inverter-status": EnergyInverterStatus;
  }
}
