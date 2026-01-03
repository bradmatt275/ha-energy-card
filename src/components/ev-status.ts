// src/components/ev-status.ts
// EV charger status card component

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { formatPower } from "../utils/power";

@customElement("energy-ev-status")
export class EnergyEVStatus extends LitElement {
  @property({ type: String }) mode: string | null = null;
  @property({ type: String }) status: string | null = null;
  @property({ type: String }) plugStatus: string | null = null;
  @property({ type: Number }) power: number | null = null;

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
    }

    .ev-icon {
      --mdc-icon-size: 24px;
      color: var(--secondary-text-color);
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
    }

    .ev-stat {
      display: flex;
      align-items: center;
      gap: 4px;
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

    return html`
      <div class="ev-card">
        <ha-icon class="${iconClass}" icon="mdi:ev-station"></ha-icon>
        <span class="ev-label">EV Charger</span>
        <div class="ev-info">
          ${this.mode
            ? html` <span class="ev-stat ev-mode">${this.mode}</span> `
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
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-ev-status": EnergyEVStatus;
  }
}
