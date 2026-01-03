// src/components/flow-line.ts
// Animated SVG flow line component

import { LitElement, svg, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { EnergySource, FlowSpeed } from "../types";
import { getFlowSpeed, isFlowActive } from "../utils/flow";

@customElement("energy-flow-line")
export class EnergyFlowLine extends LitElement {
  @property({ type: String }) type: EnergySource = "solar";
  @property({ type: Number }) power = 0;
  @property({ type: Boolean }) reverse = false;
  @property({ type: String }) speed: "auto" | FlowSpeed = "auto";
  @property({ type: Boolean }) animationEnabled = true;
  @property({ type: String }) path = "";

  static styles = css`
    :host {
      display: block;
    }

    .flow-line {
      fill: none;
      stroke-width: 3;
      stroke-linecap: round;
    }

    .flow-line.active {
      stroke-dasharray: 8 4;
      animation: flowAnimation var(--flow-duration, 1s) linear infinite;
    }

    .flow-line.reverse {
      animation-direction: reverse;
    }

    .flow-line.inactive {
      opacity: 0.2;
      stroke-dasharray: none;
      animation: none;
    }

    .flow-line.solar {
      stroke: var(--energy-solar, #f59e0b);
    }
    .flow-line.grid {
      stroke: var(--energy-grid, #3b82f6);
    }
    .flow-line.battery {
      stroke: var(--energy-battery, #10b981);
    }
    .flow-line.home {
      stroke: var(--energy-home, #8b5cf6);
    }

    /* Speed classes */
    .flow-line.speed-fast {
      --flow-duration: 0.3s;
    }
    .flow-line.speed-medium {
      --flow-duration: 0.6s;
    }
    .flow-line.speed-slow {
      --flow-duration: 1s;
    }

    @keyframes flowAnimation {
      from {
        stroke-dashoffset: 12;
      }
      to {
        stroke-dashoffset: 0;
      }
    }
  `;

  protected render() {
    const active = isFlowActive(this.power) && this.animationEnabled;
    const speedClass = this._getSpeedClass();

    const classes = [
      "flow-line",
      this.type,
      active ? "active" : "inactive",
      this.reverse && active ? "reverse" : "",
      speedClass,
    ]
      .filter(Boolean)
      .join(" ");

    return svg`
      <path 
        class="${classes}"
        d="${this.path}"
      />
    `;
  }

  private _getSpeedClass(): string {
    if (this.speed !== "auto") {
      return `speed-${this.speed}`;
    }
    return `speed-${getFlowSpeed(this.power)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-flow-line": EnergyFlowLine;
  }
}
