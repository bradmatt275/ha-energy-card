// src/components/circuit-grid.ts
// Grid of circuit consumption chips

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CircuitData } from "../types";

import "./circuit-chip";

@customElement("energy-circuit-grid")
export class EnergyCircuitGrid extends LitElement {
  @property({ type: Array }) circuits: CircuitData[] = [];
  @property({ type: Number }) columns = 5;
  @property({ type: Number }) highlightTop = 0;

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

    .circuit-grid {
      display: grid;
      gap: 8px;
    }

    .circuit-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
      border-radius: 12px;
      transition: background-color 0.2s ease, border-color 0.2s ease;
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
    if (!this.circuits || this.circuits.length === 0) {
      return html``;
    }

    // Sort circuits by power for highlighting (descending)
    const sortedCircuits = [...this.circuits].sort(
      (a, b) => Math.abs(b.power) - Math.abs(a.power)
    );

    // Get names of top consumers
    const topConsumerNames =
      this.highlightTop > 0
        ? sortedCircuits
            .slice(0, this.highlightTop)
            .filter((c) => c.power > 0)
            .map((c) => c.name)
        : [];

    const gridStyle = `grid-template-columns: repeat(${this.columns}, 1fr);`;

    return html`
      <div class="section-title">Circuits</div>
      <div class="circuit-grid" style="${gridStyle}">
        ${this.circuits.map((circuit) => {
          const isHighlight =
            topConsumerNames.includes(circuit.name) && circuit.power > 0;

          return html`
            <energy-circuit-chip
              .name=${circuit.name}
              .icon=${circuit.icon}
              .power=${circuit.power}
              .highlight=${isHighlight}
              .entityId=${circuit.entity || null}
            ></energy-circuit-chip>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-circuit-grid": EnergyCircuitGrid;
  }
}
