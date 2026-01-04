// src/components/energy-node.ts
// Energy source node component (Solar, Grid, Home, Battery)

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { EnergySource, SolarArrayData } from "../types";
import { formatPower, fireMoreInfo } from "../utils/power";

@customElement("energy-node")
export class EnergyNode extends LitElement {
  @property({ type: String }) type: EnergySource = "home";
  @property({ type: String }) icon = "mdi:home";
  @property({ type: String }) label = "Home";
  @property({ type: Number }) power = 0;
  @property({ type: String }) status: string | undefined = undefined;
  @property({ type: Array }) arrays: SolarArrayData[] = [];
  @property({ type: String }) entityId: string | null = null;

  static styles = css`
    :host {
      display: block;
    }

    .node {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 16px;
      border-radius: 16px;
      min-width: 100px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .node.clickable {
      cursor: pointer;
    }

    .node:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .node-solar {
      background: var(--energy-solar-container, rgba(245, 158, 11, 0.15));
      color: var(--energy-solar, #f59e0b);
    }

    .node-grid {
      background: var(--energy-grid-container, rgba(59, 130, 246, 0.15));
      color: var(--energy-grid, #3b82f6);
    }

    .node-home {
      background: var(--energy-home-container, rgba(139, 92, 246, 0.15));
      color: var(--energy-home, #8b5cf6);
    }

    .node-battery {
      background: var(--energy-battery-container, rgba(16, 185, 129, 0.15));
      color: var(--energy-battery, #10b981);
    }

    .node-icon {
      margin-bottom: 4px;
      --mdc-icon-size: 28px;
    }

    .node-label {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      opacity: 0.8;
      letter-spacing: 0.5px;
    }

    .node-power {
      font-size: 20px;
      font-weight: 600;
      margin-top: 2px;
    }

    .node-status {
      font-size: 11px;
      opacity: 0.7;
      text-transform: lowercase;
    }

    .node-arrays {
      display: flex;
      gap: 8px;
      font-size: 11px;
      margin-top: 4px;
      opacity: 0.8;
    }

    .node-arrays span {
      background: rgba(0, 0, 0, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
  `;

  protected render() {
    const isClickable = !!this.entityId;
    
    return html`
      <div 
        class="node node-${this.type} ${isClickable ? 'clickable' : ''}"
        @click=${this._handleClick}
      >
        <ha-icon class="node-icon" icon="${this.icon}"></ha-icon>
        <span class="node-label">${this.label}</span>
        <span class="node-power">${formatPower(Math.abs(this.power))}</span>
        ${this.status
          ? html`<span class="node-status">${this.status}</span>`
          : ""}
        ${this.arrays && this.arrays.length > 1
          ? html`
              <div class="node-arrays">
                ${this.arrays.map(
                  (arr) => html`<span>${arr.name}: ${formatPower(arr.power)}</span>`
                )}
              </div>
            `
          : ""}
      </div>
    `;
  }

  private _handleClick(): void {
    fireMoreInfo(this, this.entityId);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-node": EnergyNode;
  }
}
