// src/components/ev-status.ts
// EV charger status card component

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { formatPower } from "../utils/power";
import type { HomeAssistant } from "custom-card-helpers";

@customElement("energy-ev-status")
export class EnergyEVStatus extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: String }) modeEntity: string | null = null;
  @property({ type: String }) mode: string | null = null;
  @property({ type: String }) status: string | null = null;
  @property({ type: String }) plugStatus: string | null = null;
  @property({ type: Number }) power: number | null = null;
  
  @state() private _showModeSelector = false;

  static styles = css`
    :host {
      display: block;
    }

    .ev-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
      border-radius: 12px;
      flex-wrap: wrap;
      min-width: 0;
    }

    .ev-icon {
      --mdc-icon-size: 24px;
      color: var(--secondary-text-color);
      flex-shrink: 0;
    }

    .ev-icon.charging {
      color: #10b981;
    }

    .ev-icon.connected {
      color: #3b82f6;
    }

    .ev-icon.disconnected {
      color: var(--secondary-text-color);
    }

    .ev-label {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      color: var(--secondary-text-color);
      letter-spacing: 0.5px;
    }

    .ev-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--primary-text-color);
      flex-wrap: wrap;
      min-width: 0;
    }

    .ev-stat {
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }

    .ev-stat::before {
      content: "•";
      color: var(--secondary-text-color);
      margin: 0 4px;
    }

    .ev-stat:first-child::before {
      display: none;
    }

    .ev-mode {
      text-transform: capitalize;
    }

    .ev-status {
      text-transform: capitalize;
    }

    .ev-status.charging {
      color: #10b981;
      font-weight: 500;
    }

    .ev-plug {
      color: var(--secondary-text-color);
      text-transform: capitalize;
    }

    .ev-plug.connected {
      color: #3b82f6;
    }

    .ev-power {
      font-weight: 600;
      font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
      color: #10b981;
    }

    /* Mode selector styles */
    .mode-selector-wrapper {
      position: relative;
    }

    .ev-mode.clickable {
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      transition: background 0.2s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .ev-mode.clickable:hover {
      background: var(--divider-color, rgba(255, 255, 255, 0.1));
    }

    .ev-mode.clickable ha-icon {
      --mdc-icon-size: 14px;
      color: var(--secondary-text-color);
    }

    .mode-dropdown {
      position: absolute;
      bottom: 100%;
      left: 0;
      z-index: 100;
      min-width: 120px;
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
      background: var(--primary-color, #03a9f4);
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
  `;

  protected render() {
    const statusLower = (this.status || "").toLowerCase();
    const plugLower = (this.plugStatus || "").toLowerCase();

    const isCharging =
      statusLower === "charging" ||
      statusLower.includes("charging") ||
      (this.power !== null && this.power > 0);
    const isConnected =
      plugLower === "connected" ||
      plugLower === "plugged" ||
      plugLower.includes("connect");
    const isDisconnected =
      plugLower === "disconnected" ||
      plugLower === "unplugged" ||
      plugLower.includes("disconnect");

    let iconClass = "ev-icon";
    if (isCharging) {
      iconClass += " charging";
    } else if (isConnected) {
      iconClass += " connected";
    } else {
      iconClass += " disconnected";
    }

    let plugClass = "ev-plug";
    if (isConnected && !isDisconnected) {
      plugClass += " connected";
    }

    let statusClass = "ev-status";
    if (isCharging) {
      statusClass += " charging";
    }

    // Get mode options from entity if available
    const modeOptions = this._getModeOptions();
    const canSelectMode = modeOptions.length > 0 && this.hass && this.modeEntity;

    return html`
      <div class="ev-card">
        <ha-icon class="${iconClass}" icon="mdi:ev-station"></ha-icon>
        <span class="ev-label">EV Charger</span>
        <div class="ev-info">
          ${this.mode
            ? canSelectMode
              ? html`
                  <div class="mode-selector-wrapper">
                    <span 
                      class="ev-stat ev-mode clickable" 
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
              : html`<span class="ev-stat ev-mode">${this.mode}</span>`
            : ""}
          <span class="ev-stat ${statusClass}">
            ${this.status || "Unknown"}
          </span>
          <span class="ev-stat ${plugClass}">
            ${this.plugStatus || "Unknown"}
          </span>
          ${this.power !== null && this.power > 0
            ? html`
                <span class="ev-stat ev-power">
                  ${formatPower(this.power)}
                </span>
              `
            : ""}
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
      console.error("Failed to set EV charger mode:", err);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-ev-status": EnergyEVStatus;
  }
}
