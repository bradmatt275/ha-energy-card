// src/styles.ts
// Shared CSS styles for Energy Flow Card

import { css } from "lit";

export const sharedStyles = css`
  :host {
    display: block;
  }

  /* CSS Custom Properties - Energy Colors */
  :host {
    --energy-solar: #f59e0b;
    --energy-solar-container: #fef3c7;
    --energy-grid: #3b82f6;
    --energy-grid-container: #dbeafe;
    --energy-battery: #10b981;
    --energy-battery-container: #d1fae5;
    --energy-home: #8b5cf6;
    --energy-home-container: #ede9fe;

    --energy-success: #4caf50;
    --energy-warning: #ff9800;
    --energy-warning-container: #fef3c7;
    --energy-error: #f44336;

    --flow-active: currentcolor;
    --flow-inactive: var(--divider-color, rgba(255, 255, 255, 0.12));
  }

  /* Dark theme adjustments */
  :host([dark]) {
    --energy-solar-container: rgba(245, 158, 11, 0.15);
    --energy-grid-container: rgba(59, 130, 246, 0.15);
    --energy-battery-container: rgba(16, 185, 129, 0.15);
    --energy-home-container: rgba(139, 92, 246, 0.15);
    --energy-warning-container: rgba(255, 152, 0, 0.15);
  }

  /* Section styling */
  .section-title {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    color: var(--secondary-text-color);
    margin-bottom: 8px;
    padding: 0 4px;
    letter-spacing: 0.5px;
  }

  /* Card container */
  .card-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 0;
  }

  .card-header .title {
    font-size: 16px;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  /* Utility classes */
  .hidden {
    display: none !important;
  }

  .flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .flex-col {
    display: flex;
    flex-direction: column;
  }

  .gap-sm {
    gap: 8px;
  }

  .gap-md {
    gap: 12px;
  }

  .gap-lg {
    gap: 16px;
  }

  /* Typography */
  .text-primary {
    color: var(--primary-text-color);
  }

  .text-secondary {
    color: var(--secondary-text-color);
  }

  .text-sm {
    font-size: 12px;
  }

  .text-md {
    font-size: 14px;
  }

  .text-lg {
    font-size: 16px;
  }

  .text-xl {
    font-size: 20px;
  }

  .font-medium {
    font-weight: 500;
  }

  .font-semibold {
    font-weight: 600;
  }

  .font-mono {
    font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
  }

  .uppercase {
    text-transform: uppercase;
  }

  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Optional section container */
  .optional-section {
    display: flex;
    gap: 12px;
  }

  .optional-section > * {
    flex: 1;
  }

  /* Loading state */
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: var(--secondary-text-color);
  }

  /* Error state */
  .error {
    color: var(--energy-error);
    padding: 16px;
    text-align: center;
  }
`;

export const nodeStyles = css`
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
    background: var(--energy-solar-container);
    color: var(--energy-solar);
  }

  .node-grid {
    background: var(--energy-grid-container);
    color: var(--energy-grid);
  }

  .node-home {
    background: var(--energy-home-container);
    color: var(--energy-home);
  }

  .node-battery {
    background: var(--energy-battery-container);
    color: var(--energy-battery);
  }

  .node-icon {
    font-size: 24px;
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
    gap: 12px;
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

export const flowLineStyles = css`
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
    stroke: var(--energy-solar);
  }
  .flow-line.grid {
    stroke: var(--energy-grid);
  }
  .flow-line.battery {
    stroke: var(--energy-battery);
  }
  .flow-line.home {
    stroke: var(--energy-home);
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

export const chipStyles = css`
  .chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--card-background-color, var(--ha-card-background));
    border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }

  .chip.highlight {
    background: var(--energy-warning-container);
    border-color: var(--energy-warning);
  }

  .chip.zero {
    opacity: 0.5;
  }

  .chip-icon {
    color: var(--secondary-text-color);
    --mdc-icon-size: 18px;
  }

  .chip.highlight .chip-icon {
    color: var(--energy-warning);
  }

  .chip-info {
    flex: 1;
    min-width: 0;
  }

  .chip-name {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chip-value {
    font-size: 14px;
    font-weight: 600;
    font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
  }
`;

export const barStyles = css`
  .progress-bar {
    height: 24px;
    background: var(--divider-color, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    overflow: hidden;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    border-radius: 12px;
    transition: width 0.5s ease;
  }

  .progress-fill.battery {
    background: var(--energy-battery);
  }

  .progress-fill.charging {
    background: linear-gradient(
      90deg,
      var(--energy-battery) 0%,
      var(--energy-solar) 100%
    );
  }

  .progress-fill.low {
    background: var(--energy-warning);
  }

  .progress-fill.critical {
    background: var(--energy-error);
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
`;
