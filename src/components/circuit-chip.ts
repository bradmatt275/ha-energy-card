// src/components/circuit-chip.ts
// Individual circuit chip component

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { formatPower, fireMoreInfo } from "../utils/power";

@customElement("energy-circuit-chip")
export class EnergyCircuitChip extends LitElement {
  @property({ type: String }) name = "";
  @property({ type: String }) icon = "mdi:flash";
  @property({ type: Number }) power = 0;
  @property({ type: Boolean }) highlight = false;
  @property({ type: String }) entityId: string | null = null;

  static styles = css`
    :host {
      display: block;
    }

    .circuit-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
      border-radius: 12px;
      transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .circuit-chip.clickable {
      cursor: pointer;
    }

    .circuit-chip.clickable:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .circuit-chip.highlight {
      background: rgba(255, 152, 0, 0.15);
      border-color: #ff9800;
    }

    .circuit-chip.zero {
      opacity: 0.5;
    }

    .circuit-icon {
      color: var(--secondary-text-color);
      --mdc-icon-size: 18px;
      flex-shrink: 0;
    }

    .circuit-chip.highlight .circuit-icon {
      color: #ff9800;
    }

    .circuit-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .circuit-name {
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--primary-text-color);
    }

    .circuit-power {
      font-size: 14px;
      font-weight: 600;
      font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
      color: var(--primary-text-color);
    }

    .circuit-chip.highlight .circuit-power {
      color: #ff9800;
    }
  `;

  protected render() {
    const isZero = this.power === 0;
    const isClickable = !!this.entityId;
    const chipClass = `circuit-chip ${this.highlight ? "highlight" : ""} ${isZero ? "zero" : ""} ${isClickable ? "clickable" : ""}`;

    return html`
      <div class="${chipClass}" @click=${this._handleClick}>
        <ha-icon class="circuit-icon" icon="${this.icon}"></ha-icon>
        <div class="circuit-info">
          <span class="circuit-name" title="${this.name}">${this.name}</span>
          <span class="circuit-power">${formatPower(this.power)}</span>
        </div>
      </div>
    `;
  }

  private _handleClick(): void {
    fireMoreInfo(this, this.entityId);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-circuit-chip": EnergyCircuitChip;
  }
}
