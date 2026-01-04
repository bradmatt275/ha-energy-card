# Energy Flow Card for Home Assistant

## Overview

A custom Lovelace card for Home Assistant that displays real-time energy flow through a home solar/battery system with animated flow visualization, daily totals, circuit-level consumption, and battery summary. Designed with Material You styling for a modern, cohesive look.

### Features

- **Real-time Flow Visualization**: Animated flow lines showing power direction and magnitude between solar, grid, battery, and home
- **At-a-glance Status**: Instantly see where power is coming from and going to
- **Daily Energy Totals**: Production, consumption, import/export with self-sufficiency calculation
- **Circuit Monitoring**: Grid of individual circuit consumption with top consumer highlighting
- **Battery Summary**: SOC bar with voltage, current, and power stats
- **UPS Status**: Battery level, status, and load percentage
- **EV Charger Control**: Status display with interactive charge mode selection
- **Click-to-Details**: Tap any entity to open its Home Assistant details dialog
- **Responsive Design**: Adapts layout for mobile and tablet displays
- **Visual Config Editor**: Full GUI configuration without YAML editing

---

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend" section
3. Click the three dots menu and select "Custom repositories"
4. Add the repository URL and select "Lovelace" as the category
5. Search for "Energy Flow Card" and install
6. Refresh your browser

### Manual Installation

1. Download `energy-flow-card.js` from the latest release
2. Copy to `/config/www/community/energy-flow-card/`
3. Add the resource in Home Assistant:
   - Go to Settings → Dashboards → Resources
   - Add `/local/community/energy-flow-card/energy-flow-card.js` as JavaScript Module

---

## Visual Layout

The card uses a hub-and-spoke design with Home at the center:

```
                    ┌─────────────┐
                    │   ☀️ SOLAR   │
                    │   8.6 kW    │
                    │  PV1  PV2   │
                    └──────┬──────┘
                           │
                           ▼ (animated flow)
                           │
┌─────────────┐      ┌─────┴─────┐      ┌─────────────┐
│   ⚡ GRID    │◄────►│  🏠 HOME   │◄────►│ 🔋 BATTERY  │
│   486 W     │      │   618 W   │      │   5.3 kW   │
│  exporting  │      │           │      │  charging  │
└─────────────┘      └───────────┘      └─────────────┘

┌─────────────────────────────────────────────────────┐
│  TODAY                                              │
│  ☀️ 10.6 kWh  🏠 —  ⬇️ 0.3 kWh  ⬆️ 0.1 kWh  📊 —   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  BATTERY                                            │
│  ████████████████░░░░  85.6%  │ 54.1V │ 97.4A │5.3kW│
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  CIRCUITS                                           │
│  🔥 Oven   ❄️ AC    🔌 PP1   🔌 PP2                  │
│    -2 W    21 W     88 W     7 W                   │
└─────────────────────────────────────────────────────┘

┌────────────────────┐  ┌────────────────────────────┐
│ 🔌 UPS 100% Online │  │ 🚗 EV CHARGER  Stopped ▼   │
│      23% load      │  │    Paused • Disconnected   │
└────────────────────┘  └────────────────────────────┘
```

---

## Configuration

### Using the Visual Editor

1. Add a new card to your dashboard
2. Search for "Energy Flow Card"
3. Use the GUI to configure all options:
   - **General**: Card title, animation settings
   - **Solar**: Enable/disable, array configuration, daily production entity
   - **Grid**: Power entity, daily import/export entities
   - **Battery**: SOC, power, voltage, current entities
   - **Home**: Power and daily consumption entities
   - **Daily Totals**: Show/hide, self-sufficiency toggle
   - **Circuits**: Add individual circuits with name, icon, and power entity
   - **UPS**: Battery, status, and load entities
   - **EV Charger**: Mode (select entity), status, plug status, power entities

### YAML Configuration

```yaml
type: custom:energy-flow-card
title: Energy Flow

animation:
  enabled: true
  speed: auto          # 'auto', 'fast', 'medium', 'slow'
  dots: true

solar:
  show: true
  arrays:
    - name: "PV1"
      power: sensor.inverter_pv1_power
    - name: "PV2"
      power: sensor.inverter_pv2_power
  total_power: sensor.inverter_total_pv_power
  daily_production: sensor.inverter_daily_production

grid:
  show: true
  power: sensor.grid_power
  daily_import: sensor.grid_daily_import
  daily_export: sensor.grid_daily_export

battery:
  show: true
  power: sensor.battery_power
  soc: sensor.battery_soc
  voltage: sensor.battery_voltage
  current: sensor.battery_current

home:
  power: sensor.home_consumption
  daily_consumption: sensor.home_daily_consumption

daily_totals:
  show: true
  show_self_sufficiency: true

circuits:
  show: true
  columns: 4
  highlight_top: 3
  items:
    - name: "Oven"
      icon: "mdi:stove"
      power: sensor.oven_power
    - name: "House AC"
      icon: "mdi:air-conditioner"
      power: sensor.house_ac_power
    - name: "Fridge"
      icon: "mdi:fridge"
      power: sensor.fridge_power

ups:
  show: true
  battery: sensor.ups_battery
  status: sensor.ups_status
  load: sensor.ups_load

ev_charger:
  show: true
  mode: select.ev_charger_mode    # Must be a select entity for interactive control
  status: sensor.ev_charger_status
  plug_status: sensor.ev_charger_plug
  power: sensor.ev_charger_power
```

---

## Configuration Options

### General

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | "Energy Flow" | Card title displayed in header |

### Animation

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable flow animations |
| `speed` | string | `"auto"` | Animation speed: `auto`, `fast`, `medium`, `slow` |
| `dots` | boolean | `true` | Use animated dots on flow lines |

### Solar

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show` | boolean | `false` | Show solar section |
| `arrays` | array | `[]` | List of PV arrays with `name` and `power` entity |
| `total_power` | string | - | Entity for total solar power (optional if arrays defined) |
| `daily_production` | string | - | Entity for daily production (kWh) |

### Grid

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show` | boolean | `true` | Show grid section |
| `power` | string | - | Entity for grid power (positive=import, negative=export) |
| `import_power` | string | - | Separate entity for import power |
| `export_power` | string | - | Separate entity for export power |
| `daily_import` | string | - | Entity for daily grid import (kWh) |
| `daily_export` | string | - | Entity for daily grid export (kWh) |

### Battery

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show` | boolean | `false` | Show battery section |
| `power` | string | - | Entity for battery power (positive=charging) |
| `soc` | string | - | Entity for state of charge (%) |
| `voltage` | string | - | Entity for battery voltage |
| `current` | string | - | Entity for battery current |

### Home

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `power` | string | - | Entity for home consumption (auto-calculated if not set) |
| `daily_consumption` | string | - | Entity for daily consumption (kWh) |

### Daily Totals

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show` | boolean | `true` | Show daily totals section |
| `show_self_sufficiency` | boolean | `true` | Show self-sufficiency percentage |

### Circuits

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show` | boolean | `false` | Show circuits section |
| `columns` | number | `5` | Number of columns (responsive on mobile) |
| `highlight_top` | number | `0` | Highlight top N consumers |
| `items` | array | `[]` | List of circuits with `name`, `icon`, `power` |

### UPS

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show` | boolean | `false` | Show UPS section |
| `battery` | string | - | Entity for UPS battery level (%) |
| `status` | string | - | Entity for UPS status |
| `load` | string | - | Entity for UPS load (%) |

### EV Charger

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show` | boolean | `false` | Show EV charger section |
| `mode` | string | - | Entity for charge mode (select/input_select for interactive control) |
| `status` | string | - | Entity for charger status |
| `plug_status` | string | - | Entity for plug connection status |
| `power` | string | - | Entity for charging power |

---

## Interactive Features

### Click-to-Details

All entities configured in the card support click-to-show-details:

- **Flow Diagram Nodes**: Click Solar, Grid, Home, or Battery to open their power entity details
- **Battery Summary**: Click the SOC bar, voltage, current, or power to see respective entity details
- **Daily Totals**: Click any daily stat card to see its entity history
- **Circuits**: Click any circuit chip to view its power entity details
- **UPS Status**: Click battery, status, or load values for their entity details

### EV Charger Mode Selection

When configured with a `select` or `input_select` entity, the EV charger mode becomes interactive:

1. Click on the current mode to open a dropdown
2. Select from available charge modes
3. The card automatically calls the Home Assistant service to change the mode

---

## Responsive Design

The card automatically adapts to different screen sizes:

### Desktop (>600px)
- Full grid layout with configured number of circuit columns
- UPS and EV charger displayed side-by-side
- All stats displayed inline

### Mobile (<600px)
- Circuits grid reduces to 2 columns
- UPS and EV charger stack vertically
- Stats wrap to multiple lines as needed

### Narrow Screens (<400px)
- Circuits grid reduces to single column
- All content stacks vertically

---

## Material You Styling

The card uses a consistent color palette that integrates with Home Assistant themes:

| Element | Color | Usage |
|---------|-------|-------|
| Solar | `#F59E0B` (Amber) | Solar node, production values |
| Grid | `#3B82F6` (Blue) | Grid node, import/export |
| Battery | `#10B981` (Emerald) | Battery node, charging state |
| Home | `#8B5CF6` (Violet) | Home node, consumption |
| Warning | `#FF9800` (Orange) | Low battery, top consumers |
| Error | `#F44336` (Red) | Critical states |
| Success | `#4CAF50` (Green) | Online/healthy states |

Flow line colors match their source and animate based on power magnitude:
- High power (>3kW): Fast animation (0.3s)
- Medium power (500W-3kW): Medium animation (0.6s)
- Low power (<500W): Slow animation (1s)

---

## Troubleshooting

### Card not appearing
- Ensure the resource is added correctly
- Clear browser cache and refresh
- Check browser console for errors

### Entities not showing data
- Verify entity IDs are correct in configuration
- Check that entities exist and have numeric values
- Ensure Home Assistant can access the entities

### Animations not working
- Check that `animation.enabled` is `true`
- Some browsers may disable animations for performance

### EV charger mode not changing
- Ensure the mode entity is a `select.*` or `input_select.*` domain
- Verify you have permission to control the entity

---

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Development build with watch
npm run watch

# Production build
npm run build
```

### Project Structure

```
src/
├── energy-flow-card.ts      # Main card component
├── editor.ts                # Visual configuration editor
├── types.ts                 # TypeScript interfaces
├── const.ts                 # Constants and defaults
├── components/
│   ├── flow-diagram.ts      # Hub-and-spoke flow visualization
│   ├── energy-node.ts       # Individual energy nodes (unused - inline)
│   ├── daily-totals.ts      # Daily statistics row
│   ├── circuit-grid.ts      # Circuit consumption grid
│   ├── circuit-chip.ts      # Individual circuit chip
│   ├── battery-summary.ts   # Battery SOC bar and stats
│   ├── ups-status.ts        # UPS status display
│   └── ev-status.ts         # EV charger with mode selector
└── utils/
    ├── power.ts             # Power formatting and more-info helper
    └── flow.ts              # Flow calculations
```

---

## License

MIT License - See LICENSE file for details.

---

## Credits

Inspired by the Home Assistant Energy Dashboard and designed to complement battery management cards for a complete energy monitoring solution.
