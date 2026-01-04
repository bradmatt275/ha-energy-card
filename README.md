# Energy Flow Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/v/release/bradmatt275/ha-energy-card)](https://github.com/bradmatt275/ha-energy-card/releases)


A custom Home Assistant Lovelace card that displays real-time energy flow through your solar/battery system with animated flow visualization.

![Energy Flow Card Preview](docs/examples/design-example1.png)

## Features

- **Real-time flow visualization** - Animated dashed lines showing power direction and magnitude
- **Hub-style layout** - Solar on top, Home in center, Grid on left, Battery on right
- **Animation speed** - Automatically adjusts based on power magnitude (higher power = faster animation)
- **Daily totals** - Production, consumption, import, export, and self-sufficiency percentage
- **Circuit monitoring** - Grid of all monitored circuits with power consumption
- **Battery summary** - SOC bar with voltage, current, and power stats
- **Optional sections** - UPS status and EV charger status cards
- **Material You styling** - Modern design that matches your BMS card

## Installation

### HACS (Recommended)
[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=bradmatt275&repository=ha-energy-card&category=integration)

1. Open HACS in your Home Assistant instance
2. Go to "Frontend" section
3. Click the three dots menu and select "Custom repositories"
4. Add this repository URL and select "Lovelace" as the category
5. Search for "Energy Flow Card" and install it
6. Refresh your browser

### Manual Installation

1. Download `energy-flow-card.js` from the [latest release](https://github.com/mattbrady/energy-flow-card/releases)
2. Copy it to your `config/www` folder
3. Add the resource in your Lovelace configuration:

```yaml
resources:
  - url: /local/energy-flow-card.js
    type: module
```

## Configuration

### Minimal Configuration

```yaml
type: custom:energy-flow-card
title: "Energy Flow"

solar:
  show: true
  arrays:
    - name: "PV1"
      power: sensor.pv1_power

grid:
  show: true
  power: sensor.grid_power

battery:
  show: true
  power: sensor.battery_power
  soc: sensor.battery_soc
```

### Full Configuration

```yaml
type: custom:energy-flow-card
title: "Energy Flow"

animation:
  enabled: true
  speed: auto          # 'auto', 'fast', 'medium', 'slow'
  dots: true

solar:
  show: true
  arrays:
    - name: "PV1"
      power: sensor.deye_inverter_pv1_power
    - name: "PV2"
      power: sensor.deye_inverter_pv2_power
  total_power: sensor.deye_inverter_pv_total_power  # Optional
  daily_production: sensor.deye_inverter_today_production

grid:
  show: true
  power: sensor.power_grid_power
  daily_import: sensor.grid_daily_import
  daily_export: sensor.grid_daily_export
  price: sensor.power_grid_supply_price  # Optional

battery:
  show: true
  power: sensor.pack_battery_power
  soc: sensor.pack_battery_soc
  voltage: sensor.pack_battery_voltage
  current: sensor.pack_battery_current

home:
  power: sensor.home_consumption_power  # Optional, calculated if not provided
  daily_consumption: sensor.home_daily_consumption

circuits:
  show: true
  columns: 5
  highlight_top: 3  # Highlight top N consumers
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

daily_totals:
  show: true
  show_self_sufficiency: true

ups:
  show: true
  battery: sensor.cyberpower_ups_battery_charge
  status: sensor.cyberpower_ups_status
  load: sensor.cyberpower_ups_load

ev_charger:
  show: true
  mode: sensor.car_charger_charge_mode
  status: sensor.car_charger_status
  plug_status: sensor.car_charger_plug_status
  power: sensor.car_charger_charging_rate

display:
  compact_mode: false
  show_units: true
  decimal_places: 1
  power_unit: auto  # 'W', 'kW', 'auto'
```

## Power Sign Conventions

Understanding the sign conventions is critical for correct flow direction:

| Source   | Positive Value     | Negative Value      |
|----------|-------------------|---------------------|
| Solar    | Production        | N/A (always +)      |
| Battery  | Charging          | Discharging         |
| Grid     | Importing         | Exporting           |
| Home     | Consumption       | N/A (always +)      |

### Home Power Calculation

If no `home.power` sensor is provided, it's calculated as:

```
Home = Solar - Battery + Grid
```

Where battery positive = charging and grid positive = import.

## Animation

The flow animation speed automatically adjusts based on power magnitude:

| Power Level  | Animation Speed |
|-------------|-----------------|
| > 2000W     | Fast (0.3s)     |
| > 500W      | Medium (0.6s)   |
| < 500W      | Slow (1.0s)     |

Set `animation.speed` to `fast`, `medium`, or `slow` to override automatic speed.

## Styling

The card uses CSS custom properties that can be overridden in your theme:

```css
:root {
  /* Energy source colors */
  --energy-solar: #F59E0B;
  --energy-solar-container: #FEF3C7;
  --energy-grid: #3B82F6;
  --energy-grid-container: #DBEAFE;
  --energy-battery: #10B981;
  --energy-battery-container: #D1FAE5;
  --energy-home: #8B5CF6;
  --energy-home-container: #EDE9FE;
  
  /* Status colors */
  --energy-success: #4CAF50;
  --energy-warning: #FF9800;
  --energy-error: #F44336;
}
```

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch mode for development
npm run watch
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.
