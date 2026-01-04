// src/components/battery-summary.ts
// Aggregated battery status bar component

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { formatPower } from "../utils/power";
import { BATTERY_SOC_LOW, BATTERY_SOC_CRITICAL } from "../const";

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
      letter-spacing: 0.5px;
    }

    .battery-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
      border-radius: 12px;
    }

    .soc-container {
      flex: 1;
      min-width: 120px;
    }

    .soc-bar {
      height: 24px;
      background: var(--divider-color, rgba(255, 255, 255, 0.1));
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    }

    .soc-fill {
      height: 100%;
      background: #10b981;
      border-radius: 12px;
      transition: width 0.5s ease, background 0.3s ease;
    }

    .soc-fill.charging {
      background: linear-gradient(90deg, #10b981 0%, #f59e0b 100%);
    }

    .soc-fill.low {
      background: #ff9800;
    }

    .soc-fill.critical {
      background: #f44336;
    }

    .soc-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .stats-container {
      display: flex;
      gap: 8px;
      flex: 1;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 12px;
      border-left: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
    }

    .stat:first-child {
      border-left: none;
    }

    .stat-value {
      font-size: 16px;
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

    .stat.power .stat-value {
      color: var(--power-color, var(--primary-text-color));
    }

    .stat.power.charging .stat-value {
      color: #f59e0b;
    }

    .stat.power.discharging .stat-value {
      color: #8b5cf6;
    }

    @media (max-width: 600px) {
      .battery-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .soc-container {
        max-width: none;
      }

      .stats-container {
        justify-content: space-around;
      }

      .stat {
        border-left: none;
        padding: 0 8px;
      }
    }
  `;

  protected render() {
    const soc = this.soc ?? 0;
    const isLow = soc <= BATTERY_SOC_LOW && soc > BATTERY_SOC_CRITICAL;
    const isCritical = soc <= BATTERY_SOC_CRITICAL;

    let socFillClass = "soc-fill";
    if (isCritical) {
      socFillClass += " critical";
    } else if (isLow) {
      socFillClass += " low";
    } else if (this.charging) {
      socFillClass += " charging";
    }

    const powerStateClass = this.charging
      ? "charging"
      : this.power && this.power < 0
        ? "discharging"
        : "";

    return html`
      <div class="section-title">Battery</div>
      <div class="battery-bar">
        <div class="soc-container">
          <div class="soc-bar">
            <div class="${socFillClass}" style="width: ${soc}%"></div>
            <span class="soc-text">${soc.toFixed(1)}%</span>
          </div>
        </div>

        <div class="stats-container">
          <div class="stat">
            <span class="stat-value"
              >${this._formatVoltage(this.voltage)}</span
            >
            <span class="stat-label">Voltage</span>
          </div>

          <div class="stat">
            <span class="stat-value"
              >${this._formatCurrent(this.current)}</span
            >
            <span class="stat-label">Current</span>
          </div>

          <div class="stat power ${powerStateClass}">
            <span class="stat-value"
              >${formatPower(Math.abs(this.power ?? 0))}</span
            >
            <span class="stat-label"
              >${this.charging ? "Charging" : "Discharging"}</span
            >
          </div>
        </div>
      </div>
    `;
  }

  private _formatVoltage(value: number | null): string {
    if (value === null || value === undefined) return "—";
    return `${value.toFixed(1)} V`;
  }

  private _formatCurrent(value: number | null): string {
    if (value === null || value === undefined) return "—";
    return `${value.toFixed(1)} A`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-battery-summary": EnergyBatterySummary;
  }
}
