// src/const.ts
// Constants and default values for Energy Flow Card

export const CARD_VERSION = "1.0.0";

export const CARD_NAME = "energy-flow-card";
export const CARD_EDITOR_NAME = "energy-flow-card-editor";

// Default configuration values
export const DEFAULT_ANIMATION_CONFIG = {
  enabled: true,
  speed: "auto" as const,
  dots: true,
};

export const DEFAULT_DISPLAY_CONFIG = {
  compact_mode: false,
  show_units: true,
  decimal_places: 1,
  power_unit: "auto" as const,
};

export const DEFAULT_CIRCUITS_CONFIG = {
  show: false,
  columns: 5,
  highlight_top: 0,
  items: [],
};

// Power thresholds for animation speed
export const POWER_THRESHOLD_HIGH = 2000; // W
export const POWER_THRESHOLD_MEDIUM = 500; // W
export const POWER_THRESHOLD_LOW = 50; // W - below this, consider idle

// Animation durations
export const ANIMATION_DURATION_FAST = 0.3; // seconds
export const ANIMATION_DURATION_MEDIUM = 0.6;
export const ANIMATION_DURATION_SLOW = 1.0;

// Flow line SVG parameters
export const FLOW_LINE_WIDTH = 3;
export const FLOW_DASH_ARRAY = "8 4";
export const FLOW_DASH_OFFSET = 12;

// Node dimensions
export const NODE_MIN_WIDTH = 100;
export const NODE_PADDING_H = 16;
export const NODE_PADDING_V = 12;
export const NODE_BORDER_RADIUS = 16;

// Color scheme - Material You inspired
export const ENERGY_COLORS = {
  solar: {
    primary: "#F59E0B",
    container: "#FEF3C7",
  },
  grid: {
    primary: "#3B82F6",
    container: "#DBEAFE",
  },
  battery: {
    primary: "#10B981",
    container: "#D1FAE5",
  },
  home: {
    primary: "#8B5CF6",
    container: "#EDE9FE",
  },
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
};

// Icons
export const DEFAULT_ICONS = {
  solar: "mdi:solar-power",
  grid: "mdi:transmission-tower",
  battery: "mdi:battery-high",
  batteryCharging: "mdi:battery-charging",
  batteryLow: "mdi:battery-low",
  home: "mdi:home",
  circuit: "mdi:flash",
  ups: "mdi:power-plug",
  ev: "mdi:ev-station",
  production: "mdi:solar-power",
  consumption: "mdi:home-lightning-bolt",
  import: "mdi:transmission-tower-import",
  export: "mdi:transmission-tower-export",
  selfUse: "mdi:percent",
};

// Battery SOC thresholds
export const BATTERY_SOC_LOW = 20;
export const BATTERY_SOC_CRITICAL = 10;

// SVG viewBox dimensions for flow diagram
export const FLOW_SVG_WIDTH = 400;
export const FLOW_SVG_HEIGHT = 200;

// Editor schema configuration
export const EDITOR_SCHEMA = [
  { name: "title", selector: { text: {} }, label: "Card Title" },
  {
    name: "animation",
    type: "expandable",
    title: "Animation",
    schema: [
      { name: "enabled", selector: { boolean: {} }, label: "Enable Animation" },
      {
        name: "speed",
        selector: {
          select: {
            options: [
              { value: "auto", label: "Auto (based on power)" },
              { value: "fast", label: "Fast" },
              { value: "medium", label: "Medium" },
              { value: "slow", label: "Slow" },
            ],
          },
        },
        label: "Animation Speed",
      },
    ],
  },
];
