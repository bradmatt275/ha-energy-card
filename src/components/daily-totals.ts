// src/components/daily-totals.ts
// Daily energy totals row component

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fireMoreInfo } from "../utils/power";

@customElement("energy-daily-totals")
export class EnergyDailyTotals extends LitElement {
  @property({ type: Number }) production: number | null = null;
  @property({ type: Number }) consumption: number | null = null;
  @property({ type: Number }) gridImport: number | null = null;
  @property({ type: Number }) gridExport: number | null = null;
  @property({ type: Number }) selfSufficiency: number | null = null;
  @property({ type: Boolean }) showSelfSufficiency = true;
  
  // Entity IDs for click-to-show-details
  @property({ type: String }) productionEntity: string | null = null;
  @property({ type: String }) consumptionEntity: string | null = null;
  @property({ type: String }) importEntity: string | null = null;
  @property({ type: String }) exportEntity: string | null = null;

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
    .total-icon.self {
      color: #4caf50;
    }

    .total-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color);
      font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
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
          <span class="total-value"
            >${this._formatEnergy(this.consumption)}</span
          >
          <span class="total-label">Consumed</span>
        </div>

        <div 
          class="total-card ${this.importEntity ? 'clickable' : ''}"
          @click=${() => this._handleClick(this.importEntity)}
        >
          <ha-icon
            class="total-icon import"
            icon="mdi:transmission-tower-import"
          ></ha-icon>
          <span class="total-value"
            >${this._formatEnergy(this.gridImport)}</span
          >
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
          <span class="total-value"
            >${this._formatEnergy(this.gridExport)}</span
          >
          <span class="total-label">Exported</span>
        </div>

        ${this.showSelfSufficiency
          ? html`
              <div class="total-card">
                <ha-icon class="total-icon self" icon="mdi:percent"></ha-icon>
                <span class="total-value"
                  >${this._formatPercent(this.selfSufficiency)}</span
                >
                <span class="total-label">Self-use</span>
              </div>
            `
          : ""}
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
