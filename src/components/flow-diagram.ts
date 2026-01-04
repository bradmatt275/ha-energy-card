// src/components/flow-diagram.ts
// Main SVG flow visualization component with animated connections

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  SolarState,
  GridState,
  BatteryState,
  HomeState,
  FlowState,
  AnimationConfig,
} from "../types";
import { formatPower } from "../utils/power";
import { getFlowSpeed, isFlowActive } from "../utils/flow";

@customElement("energy-flow-diagram")
export class EnergyFlowDiagram extends LitElement {
  @property({ type: Object }) solar!: SolarState;
  @property({ type: Object }) grid!: GridState;
  @property({ type: Object }) battery!: BatteryState;
  @property({ type: Object }) home!: HomeState;
  @property({ type: Object }) flows!: FlowState;
  @property({ type: Object }) animation: AnimationConfig = {
    enabled: true,
    speed: "auto",
    dots: true,
  };
  @property({ type: Boolean }) showSolar = true;
  @property({ type: Boolean }) showBattery = true;

  static styles = css`
    :host {
      display: block;
    }

    .flow-container {
      position: relative;
      width: 100%;
      padding: 16px;
    }

    /* Grid layout for hub-and-spoke design */
    .flow-grid {
      display: grid;
      grid-template-areas:
        ". solar ."
        "grid-area home-area battery-area";
      grid-template-columns: minmax(100px, 1fr) minmax(100px, auto) minmax(100px, 1fr);
      grid-template-rows: auto auto;
      gap: 8px 0;
      align-items: center;
      justify-items: center;
    }

    .flow-grid.no-solar {
      grid-template-areas: "grid-area home-area battery-area";
      grid-template-rows: auto;
    }

    .flow-grid.no-battery {
      grid-template-columns: minmax(100px, 1fr) minmax(100px, auto) minmax(100px, 1fr);
      grid-template-areas:
        ". solar ."
        "grid-area home-area .";
    }

    .flow-grid.no-solar.no-battery {
      grid-template-areas: "grid-area home-area .";
      grid-template-columns: minmax(100px, 1fr) minmax(100px, auto) minmax(100px, 1fr);
      grid-template-rows: auto;
    }

    .solar-area {
      grid-area: solar;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .grid-area {
      grid-area: grid-area;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
    }

    .home-area {
      grid-area: home-area;
    }

    .battery-area {
      grid-area: battery-area;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
    }

    /* Flow lines between nodes */
    .flow-line-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .flow-line-svg {
      overflow: visible;
    }

    /* Flow lines */
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

    /* Vertical flow line (solar to home) */
    .solar-flow-line {
      width: 3px;
      height: 80px;
      position: relative;
    }

    .solar-flow-line::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--energy-solar, #f59e0b);
      opacity: 0.2;
    }

    .solar-flow-line.active::before {
      opacity: 1;
      background: linear-gradient(
        to bottom,
        var(--energy-solar, #f59e0b) 0%,
        var(--energy-solar, #f59e0b) 60%,
        transparent 60%,
        transparent 100%
      );
      background-size: 100% 12px;
      animation: verticalFlow var(--flow-duration, 1s) linear infinite;
    }

    @keyframes verticalFlow {
      from {
        background-position: 0 -12px;
      }
      to {
        background-position: 0 0;
      }
    }

    /* Horizontal flow line - dynamic width */
    .horizontal-flow {
      flex: 1;
      min-width: 20px;
      height: 3px;
      position: relative;
    }

    .horizontal-flow::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.2;
    }

    .horizontal-flow.grid::before {
      background: var(--energy-grid, #3b82f6);
    }

    .horizontal-flow.battery::before {
      background: var(--energy-battery, #10b981);
    }

    .horizontal-flow.active::before {
      opacity: 1;
      background-size: 12px 100%;
      animation: horizontalFlow var(--flow-duration, 1s) linear infinite;
    }

    .horizontal-flow.active.grid::before {
      background: linear-gradient(
        to right,
        var(--energy-grid, #3b82f6) 0%,
        var(--energy-grid, #3b82f6) 60%,
        transparent 60%,
        transparent 100%
      );
      background-size: 12px 100%;
    }

    .horizontal-flow.active.battery::before {
      background: linear-gradient(
        to right,
        var(--energy-battery, #10b981) 0%,
        var(--energy-battery, #10b981) 60%,
        transparent 60%,
        transparent 100%
      );
      background-size: 12px 100%;
    }

    .horizontal-flow.reverse::before {
      animation-direction: reverse;
    }

    @keyframes horizontalFlow {
      from {
        background-position: -12px 0;
      }
      to {
        background-position: 0 0;
      }
    }

    /* Speed variations for div-based lines */
    .speed-fast {
      --flow-duration: 0.3s;
    }
    .speed-medium {
      --flow-duration: 0.6s;
    }
    .speed-slow {
      --flow-duration: 1s;
    }

    /* Node styling */
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

    /* Responsive */
    @media (max-width: 500px) {
      .node {
        min-width: 80px;
        padding: 10px 12px;
      }

      .node-power {
        font-size: 16px;
      }

      .node-icon {
        --mdc-icon-size: 24px;
      }

      .node-arrays {
        flex-direction: column;
        gap: 4px;
      }
    }
  `;

  protected render() {
    // Calculate flow values
    const solarToHome = this.flows?.solarToHome || 0;
    const gridToHome = this.flows?.gridToHome || 0;
    const homeToGrid = this.flows?.homeToGrid || 0;
    const batteryToHome = this.flows?.batteryToHome || 0;
    const homeToBattery = this.flows?.homeToBattery || 0;

    // Determine if flows are active (only animate if enabled)
    const animEnabled = this.animation?.enabled ?? true;
    const solarActive = this.showSolar && isFlowActive(solarToHome) && animEnabled;
    const gridImportActive = isFlowActive(gridToHome) && animEnabled;
    const gridExportActive = isFlowActive(homeToGrid) && animEnabled;
    const batteryDischargeActive = this.showBattery && isFlowActive(batteryToHome) && animEnabled;
    const batteryChargeActive = this.showBattery && isFlowActive(homeToBattery) && animEnabled;

    // Build grid class
    let gridClass = "flow-grid";
    if (!this.showSolar) gridClass += " no-solar";
    if (!this.showBattery) gridClass += " no-battery";

    return html`
      <div class="flow-container">
        <div class="${gridClass}">
          <!-- Solar Area (top center) -->
          ${this.showSolar
            ? html`
                <div class="solar-area">
                  <div class="node node-solar">
                    <ha-icon class="node-icon" icon="mdi:solar-power"></ha-icon>
                    <span class="node-label">Solar</span>
                    <span class="node-power">${formatPower(this.solar?.power || 0)}</span>
                    ${this.solar?.arrays && this.solar.arrays.length > 1
                      ? html`
                          <div class="node-arrays">
                            ${this.solar.arrays.map(
                              (arr) => html`<span>${arr.name}: ${formatPower(arr.power)}</span>`
                            )}
                          </div>
                        `
                      : ""}
                  </div>
                  <!-- Solar to Home flow line -->
                  <div class="solar-flow-line ${solarActive ? "active" : ""} ${this._getSpeedClass(solarToHome)}"></div>
                </div>
              `
            : ""}

          <!-- Grid Area (left) with flow line -->
          <div class="grid-area">
            <div class="node node-grid">
              <ha-icon class="node-icon" icon="mdi:transmission-tower"></ha-icon>
              <span class="node-label">Grid</span>
              <span class="node-power">${formatPower(Math.abs(this.grid?.power || 0))}</span>
              <span class="node-status">
                ${this.grid?.importing ? "importing" : this.grid?.exporting ? "exporting" : "idle"}
              </span>
            </div>
            <!-- Grid to Home flow line -->
            <div class="horizontal-flow grid ${gridImportActive ? "active" : gridExportActive ? "active reverse" : ""} ${this._getSpeedClass(gridImportActive ? gridToHome : homeToGrid)}"></div>
          </div>

          <!-- Home Area (center) -->
          <div class="home-area">
            <div class="node node-home">
              <ha-icon class="node-icon" icon="mdi:home"></ha-icon>
              <span class="node-label">Home</span>
              <span class="node-power">${formatPower(this.home?.power || 0)}</span>
            </div>
          </div>

          <!-- Battery Area (right) with flow line -->
          ${this.showBattery
            ? html`
                <div class="battery-area">
                  <!-- Home to Battery flow line -->
                  <div class="horizontal-flow battery ${batteryChargeActive ? "active" : batteryDischargeActive ? "active reverse" : ""} ${this._getSpeedClass(batteryChargeActive ? homeToBattery : batteryToHome)}"></div>
                  <div class="node node-battery">
                    <ha-icon class="node-icon" icon="${this._getBatteryIcon()}"></ha-icon>
                    <span class="node-label">Battery</span>
                    <span class="node-power">${formatPower(Math.abs(this.battery?.power || 0))}</span>
                    <span class="node-status">
                      ${this.battery?.charging ? "charging" : this.battery?.discharging ? "discharging" : "idle"}
                    </span>
                  </div>
                </div>
              `
            : ""}
        </div>
      </div>
    `;
  }

  private _getSpeedClass(power: number): string {
    if (!this.animation?.enabled) return "";
    if (this.animation?.speed !== "auto") {
      return `speed-${this.animation.speed}`;
    }
    return `speed-${getFlowSpeed(power)}`;
  }

  private _getBatteryIcon(): string {
    const soc = this.battery?.soc ?? 50;
    const charging = this.battery?.charging ?? false;

    if (charging) {
      if (soc >= 90) return "mdi:battery-charging-100";
      if (soc >= 70) return "mdi:battery-charging-80";
      if (soc >= 50) return "mdi:battery-charging-60";
      if (soc >= 30) return "mdi:battery-charging-40";
      if (soc >= 10) return "mdi:battery-charging-20";
      return "mdi:battery-charging-outline";
    }

    if (soc >= 90) return "mdi:battery";
    if (soc >= 70) return "mdi:battery-80";
    if (soc >= 50) return "mdi:battery-60";
    if (soc >= 30) return "mdi:battery-40";
    if (soc >= 10) return "mdi:battery-20";
    return "mdi:battery-alert";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-flow-diagram": EnergyFlowDiagram;
  }
}
