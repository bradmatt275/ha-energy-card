// src/components/daily-totals.ts
// Daily energy totals row component

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fireMoreInfo } from "../utils/power";

@customElement("energy-daily-totals")
export class EnergyDailyTotals extends LitElement {
  @property({ type: Number }) production: number | null = null;
  @property({ type: Number }) consumption: number | null = null;
  @property({ type: Number }) gridImport: number | null = null;
  @property({ type: Number }) gridExport: number | null = null;
  @property({ type: Number }) batteryCharge: number | null = null;
  @property({ type: Number }) batteryDischarge: number | null = null;
  @property({ type: Number }) selfSufficiency: number | null = null;
  @property({ type: Boolean }) showSelfSufficiency = true;
  @property({ type: Boolean }) compactLayout = false;
  
  // Entity IDs for click-to-show-details
  @property({ type: String }) productionEntity: string | null = null;
  @property({ type: String }) consumptionEntity: string | null = null;
  @property({ type: String }) importEntity: string | null = null;
  @property({ type: String }) exportEntity: string | null = null;
  @property({ type: String }) chargeEntity: string | null = null;
  @property({ type: String }) dischargeEntity: string | null = null;

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
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
      border-radius: 12px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .total-card.clickable {
      cursor: pointer;
    }

    .total-card:hover {
      transform: translateY(-2px);
    }

    .total-card.clickable:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .total-icon {
      --mdc-icon-size: 20px;
      margin-bottom: 4px;
    }

    .total-icon.solar {
      color: #f59e0b;
    }
    .total-icon.home {
      color: #8b5cf6;
    }
    .total-icon.import {
      color: #3b82f6;
    }
    .total-icon.export {
      color: #10b981;
    }
    .total-icon.grid {
      color: #3b82f6;
    }
    .total-icon.battery {
      color: #22c55e;
    }
    .total-icon.discharge {
      color: #f59e0b;
    }
    .total-icon.self {
      color: #4caf50;
    }

    .total-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color);
      font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
    }

    .combined-values {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }

    .combined-row {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 14px;
      font-weight: 600;
      font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
    }

    .combined-row .arrow {
      font-size: 12px;
      opacity: 0.7;
    }

    .combined-row.import-row {
      color: #3b82f6;
    }

    .combined-row.export-row {
      color: #10b981;
    }

    .combined-row.charge-row {
      color: #22c55e;
    }

    .combined-row.discharge-row {
      color: #f59e0b;
    }

    .total-label {
      font-size: 10px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-top: 2px;
    }

    @media (max-width: 600px) {
      .totals-grid {
        flex-wrap: wrap;
      }

      .total-card {
        min-width: calc(33% - 6px);
      }
    }
  `;

  // Check if battery daily entities are configured
  private get _hasBatteryDaily(): boolean {
    return !!(this.chargeEntity || this.dischargeEntity);
  }

  protected render() {
    return html`
      <div class="section-title">Today</div>
      <div class="totals-grid">
        <div 
          class="total-card ${this.productionEntity ? 'clickable' : ''}"
          @click=${() => this._handleClick(this.productionEntity)}
        >
          <ha-icon class="total-icon solar" icon="mdi:solar-power"></ha-icon>
          <span class="total-value">${this._formatEnergy(this.production)}</span>
          <span class="total-label">Produced</span>
        </div>

        <div 
          class="total-card ${this.consumptionEntity ? 'clickable' : ''}"
          @click=${() => this._handleClick(this.consumptionEntity)}
        >
          <ha-icon
            class="total-icon home"
            icon="mdi:home-lightning-bolt"
          ></ha-icon>
          <span class="total-value">${this._formatEnergy(this.consumption)}</span>
          <span class="total-label">Consumed</span>
        </div>

        ${this.compactLayout ? this._renderCombinedGridCard() : this._renderSeparateGridCards()}

        ${this._hasBatteryDaily 
          ? (this.compactLayout ? this._renderCombinedBatteryCard() : this._renderSeparateBatteryCards())
          : nothing}

        ${this.showSelfSufficiency
          ? html`
              <div class="total-card">
                <ha-icon class="total-icon self" icon="mdi:percent"></ha-icon>
                <span class="total-value">${this._formatPercent(this.selfSufficiency)}</span>
                <span class="total-label">Self-use</span>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderSeparateGridCards() {
    return html`
      <div 
        class="total-card ${this.importEntity ? 'clickable' : ''}"
        @click=${() => this._handleClick(this.importEntity)}
      >
        <ha-icon
          class="total-icon import"
          icon="mdi:transmission-tower-import"
        ></ha-icon>
        <span class="total-value">${this._formatEnergy(this.gridImport)}</span>
        <span class="total-label">Imported</span>
      </div>

      <div 
        class="total-card ${this.exportEntity ? 'clickable' : ''}"
        @click=${() => this._handleClick(this.exportEntity)}
      >
        <ha-icon
          class="total-icon export"
          icon="mdi:transmission-tower-export"
        ></ha-icon>
        <span class="total-value">${this._formatEnergy(this.gridExport)}</span>
        <span class="total-label">Exported</span>
      </div>
    `;
  }

  private _renderCombinedGridCard() {
    return html`
      <div class="total-card">
        <ha-icon class="total-icon grid" icon="mdi:transmission-tower"></ha-icon>
        <div class="combined-values">
          <div class="combined-row import-row">
            <span class="arrow">↓</span>
            <span>${this._formatEnergyCompact(this.gridImport)}</span>
          </div>
          <div class="combined-row export-row">
            <span class="arrow">↑</span>
            <span>${this._formatEnergyCompact(this.gridExport)}</span>
          </div>
        </div>
        <span class="total-label">Grid</span>
      </div>
    `;
  }

  private _renderSeparateBatteryCards() {
    return html`
      ${this.chargeEntity ? html`
        <div 
          class="total-card clickable"
          @click=${() => this._handleClick(this.chargeEntity)}
        >
          <ha-icon
            class="total-icon battery"
            icon="mdi:battery-arrow-up"
          ></ha-icon>
          <span class="total-value">${this._formatEnergy(this.batteryCharge)}</span>
          <span class="total-label">Charged</span>
        </div>
      ` : nothing}

      ${this.dischargeEntity ? html`
        <div 
          class="total-card clickable"
          @click=${() => this._handleClick(this.dischargeEntity)}
        >
          <ha-icon
            class="total-icon discharge"
            icon="mdi:battery-arrow-down"
          ></ha-icon>
          <span class="total-value">${this._formatEnergy(this.batteryDischarge)}</span>
          <span class="total-label">Discharged</span>
        </div>
      ` : nothing}
    `;
  }

  private _renderCombinedBatteryCard() {
    return html`
      <div class="total-card">
        <ha-icon class="total-icon battery" icon="mdi:battery-charging"></ha-icon>
        <div class="combined-values">
          <div class="combined-row charge-row">
            <span class="arrow">↑</span>
            <span>${this._formatEnergyCompact(this.batteryCharge)}</span>
          </div>
          <div class="combined-row discharge-row">
            <span class="arrow">↓</span>
            <span>${this._formatEnergyCompact(this.batteryDischarge)}</span>
          </div>
        </div>
        <span class="total-label">Battery</span>
      </div>
    `;
  }

  private _handleClick(entityId: string | null): void {
    fireMoreInfo(this, entityId);
  }

  private _formatEnergy(value: number | null): string {
    if (value === null || value === undefined) return "—";
    return `${value.toFixed(1)} kWh`;
  }

  private _formatEnergyCompact(value: number | null): string {
    if (value === null || value === undefined) return "—";
    return `${value.toFixed(1)}`;
  }

  private _formatPercent(value: number | null): string {
    if (value === null || value === undefined) return "—";
    return `${value.toFixed(0)}%`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-daily-totals": EnergyDailyTotals;
  }
}
