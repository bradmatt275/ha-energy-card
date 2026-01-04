// src/components/ups-status.ts
// UPS status card component

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fireMoreInfo } from "../utils/power";

@customElement("energy-ups-status")
export class EnergyUPSStatus extends LitElement {
  @property({ type: Number }) battery: number | null = null;
  @property({ type: String }) status: string | null = null;
  @property({ type: Number }) load: number | null = null;
  @property({ type: String }) batteryEntity: string | null = null;
  @property({ type: String }) statusEntity: string | null = null;
  @property({ type: String }) loadEntity: string | null = null;

  static styles = css`
    :host {
      display: block;
    }

    .ups-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
      border-radius: 12px;
    }

    .ups-icon {
      --mdc-icon-size: 24px;
      color: var(--secondary-text-color);
    }

    .ups-icon.online {
      color: #4caf50;
    }

    .ups-icon.battery {
      color: #ff9800;
    }

    .ups-icon.error {
      color: #f44336;
    }

    .ups-label {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      color: var(--secondary-text-color);
      letter-spacing: 0.5px;
    }

    .ups-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--primary-text-color);
    }

    .ups-stat {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 4px;
      border-radius: 4px;
      transition: background 0.2s ease;
    }

    .ups-stat.clickable {
      cursor: pointer;
    }

    .ups-stat.clickable:hover {
      background: var(--divider-color, rgba(255, 255, 255, 0.1));
    }

    .ups-stat::before {
      content: "•";
      color: var(--secondary-text-color);
      margin: 0 4px;
    }

    .ups-stat:first-child::before {
      display: none;
    }

    .ups-battery {
      font-weight: 600;
      color: #10b981;
    }

    .ups-battery.low {
      color: #ff9800;
    }

    .ups-battery.critical {
      color: #f44336;
    }

    .ups-status {
      text-transform: capitalize;
    }

    .ups-load {
      color: var(--secondary-text-color);
    }
  `;

  protected render() {
    const batteryLevel = this.battery ?? 0;
    const isLow = batteryLevel <= 50 && batteryLevel > 20;
    const isCritical = batteryLevel <= 20;

    const statusLower = (this.status || "").toLowerCase();
    const isOnline =
      statusLower === "online" ||
      statusLower === "normal" ||
      statusLower === "ol";
    const isOnBattery =
      statusLower === "on battery" ||
      statusLower === "ob" ||
      statusLower.includes("battery");

    let iconClass = "ups-icon";
    let icon = "mdi:power-plug";

    if (isOnline) {
      iconClass += " online";
      icon = "mdi:power-plug";
    } else if (isOnBattery) {
      iconClass += " battery";
      icon = "mdi:battery-alert";
    } else if (statusLower.includes("error") || statusLower.includes("fault")) {
      iconClass += " error";
      icon = "mdi:alert-circle";
    }

    let batteryClass = "ups-battery";
    if (isCritical) {
      batteryClass += " critical";
    } else if (isLow) {
      batteryClass += " low";
    }

    return html`
      <div class="ups-card">
        <ha-icon class="${iconClass}" icon="${icon}"></ha-icon>
        <span class="ups-label">UPS</span>
        <div class="ups-info">
          <span 
            class="ups-stat ${batteryClass} ${this.batteryEntity ? 'clickable' : ''}"
            @click=${() => this._handleClick(this.batteryEntity)}
          >
            ${this.battery !== null ? `${this.battery}%` : "—"}
          </span>
          <span 
            class="ups-stat ups-status ${this.statusEntity ? 'clickable' : ''}"
            @click=${() => this._handleClick(this.statusEntity)}
          >
            ${this.status || "Unknown"}
          </span>
          ${this.load !== null
            ? html`
                <span 
                  class="ups-stat ups-load ${this.loadEntity ? 'clickable' : ''}"
                  @click=${() => this._handleClick(this.loadEntity)}
                > 
                  ${this.load}% load 
                </span>
              `
            : ""}
        </div>
      </div>
    `;
  }

  private _handleClick(entityId: string | null): void {
    fireMoreInfo(this, entityId);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-ups-status": EnergyUPSStatus;
  }
}
