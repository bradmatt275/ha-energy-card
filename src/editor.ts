// src/editor.ts
// Visual configuration editor for Energy Flow Card

import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, fireEvent, LovelaceCardEditor } from "custom-card-helpers";
import { EnergyFlowCardConfig, CircuitItemConfig } from "./types";
import { CARD_EDITOR_NAME } from "./const";

@customElement(CARD_EDITOR_NAME)
export class EnergyFlowCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: EnergyFlowCardConfig;

  public setConfig(config: EnergyFlowCardConfig): void {
    this._config = config;
  }

  private _valueChanged(ev: CustomEvent): void {
    if (!this._config || !this.hass) return;

    const target = ev.target as any;
    const configPath = target.configValue;
    const value = ev.detail?.value ?? target.value ?? target.checked;

    if (!configPath) return;

    const newConfig = { ...this._config };
    this._setNestedValue(newConfig, configPath, value);

    fireEvent(this, "config-changed", { config: newConfig });
  }

  private _setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  static styles = css`
    :host {
      display: block;
    }

    .card-config {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section {
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      border-radius: 12px;
      padding: 16px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-title ha-icon {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
    }

    .field {
      margin-bottom: 12px;
    }

    .field:last-child {
      margin-bottom: 0;
    }

    .field-label {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 4px;
      display: block;
    }

    ha-textfield,
    ha-select,
    ha-entity-picker {
      width: 100%;
    }

    ha-formfield {
      display: block;
      margin-bottom: 8px;
    }

    .row {
      display: flex;
      gap: 12px;
    }

    .row > * {
      flex: 1;
    }

    .arrays-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .array-item {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 8px;
      background: var(--secondary-background-color);
      border-radius: 8px;
    }

    .array-item ha-textfield {
      flex: 0 0 100px;
    }

    .array-item ha-entity-picker {
      flex: 1;
    }

    .array-item ha-icon-button {
      flex: 0 0 auto;
    }

    .add-button {
      margin-top: 8px;
    }

    .circuits-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .circuit-item {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 8px;
      background: var(--secondary-background-color);
      border-radius: 8px;
    }

    .circuit-item ha-textfield {
      flex: 0 0 100px;
    }

    .circuit-item ha-icon-picker {
      flex: 0 0 60px;
    }

    .circuit-item ha-entity-picker {
      flex: 1;
    }

    .help-text {
      font-size: 11px;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }
  `;

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
      <div class="card-config">
        <!-- General Settings -->
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:cog"></ha-icon>
            General
          </div>

          <div class="field">
            <ha-textfield
              label="Card Title"
              .value=${this._config.title || ""}
              .configValue=${"title"}
              @input=${this._valueChanged}
            ></ha-textfield>
          </div>
        </div>

        <!-- Animation Settings -->
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:animation"></ha-icon>
            Animation
          </div>

          <ha-formfield label="Enable Animation">
            <ha-switch
              .checked=${this._config.animation?.enabled ?? true}
              .configValue=${"animation.enabled"}
              @change=${this._valueChanged}
            ></ha-switch>
          </ha-formfield>

          <div class="field">
            <ha-select
              label="Animation Speed"
              .value=${this._config.animation?.speed || "auto"}
              .configValue=${"animation.speed"}
              @selected=${this._valueChanged}
              @closed=${(ev: Event) => ev.stopPropagation()}
            >
              <mwc-list-item value="auto">Auto (based on power)</mwc-list-item>
              <mwc-list-item value="fast">Fast</mwc-list-item>
              <mwc-list-item value="medium">Medium</mwc-list-item>
              <mwc-list-item value="slow">Slow</mwc-list-item>
            </ha-select>
          </div>
        </div>

        <!-- Solar Settings -->
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:solar-power"></ha-icon>
            Solar
          </div>

          <ha-formfield label="Show Solar">
            <ha-switch
              .checked=${this._config.solar?.show ?? false}
              .configValue=${"solar.show"}
              @change=${this._valueChanged}
            ></ha-switch>
          </ha-formfield>

          ${this._config.solar?.show
            ? html`
                <div class="field">
                  <span class="field-label">Total Power (optional)</span>
                  <ha-entity-picker
                    .hass=${this.hass}
                    .value=${this._config.solar?.total_power || ""}
                    .configValue=${"solar.total_power"}
                    @value-changed=${this._valueChanged}
                    .includeDomains=${["sensor"]}
                    allow-custom-entity
                  ></ha-entity-picker>
                  <span class="help-text"
                    >Leave empty to sum array powers</span
                  >
                </div>

                <div class="field">
                  <span class="field-label">Daily Production</span>
                  <ha-entity-picker
                    .hass=${this.hass}
                    .value=${this._config.solar?.daily_production || ""}
                    .configValue=${"solar.daily_production"}
                    @value-changed=${this._valueChanged}
                    .includeDomains=${["sensor"]}
                    allow-custom-entity
                  ></ha-entity-picker>
                </div>

                <span class="field-label">PV Arrays</span>
                <div class="arrays-list">
                  ${(this._config.solar?.arrays || []).map(
                    (array, index) => html`
                      <div class="array-item">
                        <ha-textfield
                          label="Name"
                          .value=${array.name || ""}
                          @input=${(ev: Event) =>
                            this._updateArray(index, "name", (ev.target as any).value)}
                        ></ha-textfield>
                        <ha-entity-picker
                          .hass=${this.hass}
                          .value=${array.power || ""}
                          @value-changed=${(ev: CustomEvent) =>
                            this._updateArray(index, "power", ev.detail.value)}
                          .includeDomains=${["sensor"]}
                          allow-custom-entity
                        ></ha-entity-picker>
                        <ha-icon-button
                          .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
                          @click=${() => this._removeArray(index)}
                        ></ha-icon-button>
                      </div>
                    `
                  )}
                </div>
                <mwc-button class="add-button" @click=${this._addArray}>
                  <ha-icon icon="mdi:plus"></ha-icon>
                  Add Array
                </mwc-button>
              `
            : ""}
        </div>

        <!-- Grid Settings -->
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:transmission-tower"></ha-icon>
            Grid
          </div>

          <ha-formfield label="Show Grid">
            <ha-switch
              .checked=${this._config.grid?.show ?? true}
              .configValue=${"grid.show"}
              @change=${this._valueChanged}
            ></ha-switch>
          </ha-formfield>

          ${this._config.grid?.show
            ? html`
                <div class="field">
                  <span class="field-label">Grid Power</span>
                  <ha-entity-picker
                    .hass=${this.hass}
                    .value=${this._config.grid?.power || ""}
                    .configValue=${"grid.power"}
                    @value-changed=${this._valueChanged}
                    .includeDomains=${["sensor"]}
                    allow-custom-entity
                  ></ha-entity-picker>
                  <span class="help-text"
                    >Positive = import, Negative = export</span
                  >
                </div>

                <div class="row">
                  <div class="field">
                    <span class="field-label">Daily Import</span>
                    <ha-entity-picker
                      .hass=${this.hass}
                      .value=${this._config.grid?.daily_import || ""}
                      .configValue=${"grid.daily_import"}
                      @value-changed=${this._valueChanged}
                      .includeDomains=${["sensor"]}
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                  <div class="field">
                    <span class="field-label">Daily Export</span>
                    <ha-entity-picker
                      .hass=${this.hass}
                      .value=${this._config.grid?.daily_export || ""}
                      .configValue=${"grid.daily_export"}
                      @value-changed=${this._valueChanged}
                      .includeDomains=${["sensor"]}
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                </div>
              `
            : ""}
        </div>

        <!-- Battery Settings -->
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:battery-high"></ha-icon>
            Battery
          </div>

          <ha-formfield label="Show Battery">
            <ha-switch
              .checked=${this._config.battery?.show ?? false}
              .configValue=${"battery.show"}
              @change=${this._valueChanged}
            ></ha-switch>
          </ha-formfield>

          ${this._config.battery?.show
            ? html`
                <div class="field">
                  <span class="field-label">Battery Power</span>
                  <ha-entity-picker
                    .hass=${this.hass}
                    .value=${this._config.battery?.power || ""}
                    .configValue=${"battery.power"}
                    @value-changed=${this._valueChanged}
                    .includeDomains=${["sensor"]}
                    allow-custom-entity
                  ></ha-entity-picker>
                  <span class="help-text"
                    >Positive = charging, Negative = discharging</span
                  >
                </div>

                <div class="row">
                  <div class="field">
                    <span class="field-label">State of Charge</span>
                    <ha-entity-picker
                      .hass=${this.hass}
                      .value=${this._config.battery?.soc || ""}
                      .configValue=${"battery.soc"}
                      @value-changed=${this._valueChanged}
                      .includeDomains=${["sensor"]}
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                  <div class="field">
                    <span class="field-label">Voltage</span>
                    <ha-entity-picker
                      .hass=${this.hass}
                      .value=${this._config.battery?.voltage || ""}
                      .configValue=${"battery.voltage"}
                      @value-changed=${this._valueChanged}
                      .includeDomains=${["sensor"]}
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                </div>

                <div class="field">
                  <span class="field-label">Current</span>
                  <ha-entity-picker
                    .hass=${this.hass}
                    .value=${this._config.battery?.current || ""}
                    .configValue=${"battery.current"}
                    @value-changed=${this._valueChanged}
                    .includeDomains=${["sensor"]}
                    allow-custom-entity
                  ></ha-entity-picker>
                </div>
              `
            : ""}
        </div>

        <!-- Home Settings -->
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:home"></ha-icon>
            Home
          </div>

          <div class="field">
            <span class="field-label">Home Power (optional)</span>
            <ha-entity-picker
              .hass=${this.hass}
              .value=${this._config.home?.power || ""}
              .configValue=${"home.power"}
              @value-changed=${this._valueChanged}
              .includeDomains=${["sensor"]}
              allow-custom-entity
            ></ha-entity-picker>
            <span class="help-text"
              >Leave empty to calculate from Solar - Battery + Grid</span
            >
          </div>

          <div class="field">
            <span class="field-label">Daily Consumption</span>
            <ha-entity-picker
              .hass=${this.hass}
              .value=${this._config.home?.daily_consumption || ""}
              .configValue=${"home.daily_consumption"}
              @value-changed=${this._valueChanged}
              .includeDomains=${["sensor"]}
              allow-custom-entity
            ></ha-entity-picker>
          </div>
        </div>

        <!-- Daily Totals Settings -->
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:calendar-today"></ha-icon>
            Daily Totals
          </div>

          <ha-formfield label="Show Daily Totals">
            <ha-switch
              .checked=${this._config.daily_totals?.show ?? true}
              .configValue=${"daily_totals.show"}
              @change=${this._valueChanged}
            ></ha-switch>
          </ha-formfield>

          ${this._config.daily_totals?.show
            ? html`
                <ha-formfield label="Show Self-Sufficiency">
                  <ha-switch
                    .checked=${this._config.daily_totals?.show_self_sufficiency ?? true}
                    .configValue=${"daily_totals.show_self_sufficiency"}
                    @change=${this._valueChanged}
                  ></ha-switch>
                </ha-formfield>
              `
            : ""}
        </div>

        <!-- Circuits Settings -->
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:flash"></ha-icon>
            Circuits
          </div>

          <ha-formfield label="Show Circuits">
            <ha-switch
              .checked=${this._config.circuits?.show ?? false}
              .configValue=${"circuits.show"}
              @change=${this._valueChanged}
            ></ha-switch>
          </ha-formfield>

          ${this._config.circuits?.show
            ? html`
                <div class="row">
                  <div class="field">
                    <ha-textfield
                      label="Columns"
                      type="number"
                      min="1"
                      max="10"
                      .value=${String(this._config.circuits?.columns || 5)}
                      .configValue=${"circuits.columns"}
                      @input=${this._valueChanged}
                    ></ha-textfield>
                  </div>
                  <div class="field">
                    <ha-textfield
                      label="Highlight Top"
                      type="number"
                      min="0"
                      max="10"
                      .value=${String(this._config.circuits?.highlight_top || 0)}
                      .configValue=${"circuits.highlight_top"}
                      @input=${this._valueChanged}
                    ></ha-textfield>
                    <span class="help-text">0 = disabled</span>
                  </div>
                </div>

                <span class="field-label">Circuit Items</span>
                <div class="circuits-list">
                  ${(this._config.circuits?.items || []).map(
                    (circuit, index) => html`
                      <div class="circuit-item">
                        <ha-textfield
                          label="Name"
                          .value=${circuit.name || ""}
                          @input=${(ev: Event) =>
                            this._updateCircuit(index, "name", (ev.target as any).value)}
                        ></ha-textfield>
                        <ha-icon-picker
                          .hass=${this.hass}
                          .value=${circuit.icon || "mdi:flash"}
                          @value-changed=${(ev: CustomEvent) =>
                            this._updateCircuit(index, "icon", ev.detail.value)}
                        ></ha-icon-picker>
                        <ha-entity-picker
                          .hass=${this.hass}
                          .value=${circuit.power || ""}
                          @value-changed=${(ev: CustomEvent) =>
                            this._updateCircuit(index, "power", ev.detail.value)}
                          .includeDomains=${["sensor"]}
                          allow-custom-entity
                        ></ha-entity-picker>
                        <ha-icon-button
                          .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
                          @click=${() => this._removeCircuit(index)}
                        ></ha-icon-button>
                      </div>
                    `
                  )}
                </div>
                <mwc-button class="add-button" @click=${this._addCircuit}>
                  <ha-icon icon="mdi:plus"></ha-icon>
                  Add Circuit
                </mwc-button>
              `
            : ""}
        </div>

        <!-- UPS Settings -->
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:power-plug"></ha-icon>
            UPS (Optional)
          </div>

          <ha-formfield label="Show UPS">
            <ha-switch
              .checked=${this._config.ups?.show ?? false}
              .configValue=${"ups.show"}
              @change=${this._valueChanged}
            ></ha-switch>
          </ha-formfield>

          ${this._config.ups?.show
            ? html`
                <div class="field">
                  <span class="field-label">Battery Level</span>
                  <ha-entity-picker
                    .hass=${this.hass}
                    .value=${this._config.ups?.battery || ""}
                    .configValue=${"ups.battery"}
                    @value-changed=${this._valueChanged}
                    .includeDomains=${["sensor"]}
                    allow-custom-entity
                  ></ha-entity-picker>
                </div>

                <div class="row">
                  <div class="field">
                    <span class="field-label">Status</span>
                    <ha-entity-picker
                      .hass=${this.hass}
                      .value=${this._config.ups?.status || ""}
                      .configValue=${"ups.status"}
                      @value-changed=${this._valueChanged}
                      .includeDomains=${["sensor"]}
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                  <div class="field">
                    <span class="field-label">Load</span>
                    <ha-entity-picker
                      .hass=${this.hass}
                      .value=${this._config.ups?.load || ""}
                      .configValue=${"ups.load"}
                      @value-changed=${this._valueChanged}
                      .includeDomains=${["sensor"]}
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                </div>
              `
            : ""}
        </div>

        <!-- EV Charger Settings -->
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:ev-station"></ha-icon>
            EV Charger (Optional)
          </div>

          <ha-formfield label="Show EV Charger">
            <ha-switch
              .checked=${this._config.ev_charger?.show ?? false}
              .configValue=${"ev_charger.show"}
              @change=${this._valueChanged}
            ></ha-switch>
          </ha-formfield>

          ${this._config.ev_charger?.show
            ? html`
                <div class="row">
                  <div class="field">
                    <span class="field-label">Mode</span>
                    <ha-entity-picker
                      .hass=${this.hass}
                      .value=${this._config.ev_charger?.mode || ""}
                      .configValue=${"ev_charger.mode"}
                      @value-changed=${this._valueChanged}
                      .includeDomains=${["sensor"]}
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                  <div class="field">
                    <span class="field-label">Status</span>
                    <ha-entity-picker
                      .hass=${this.hass}
                      .value=${this._config.ev_charger?.status || ""}
                      .configValue=${"ev_charger.status"}
                      @value-changed=${this._valueChanged}
                      .includeDomains=${["sensor"]}
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                </div>

                <div class="row">
                  <div class="field">
                    <span class="field-label">Plug Status</span>
                    <ha-entity-picker
                      .hass=${this.hass}
                      .value=${this._config.ev_charger?.plug_status || ""}
                      .configValue=${"ev_charger.plug_status"}
                      @value-changed=${this._valueChanged}
                      .includeDomains=${["sensor"]}
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                  <div class="field">
                    <span class="field-label">Power</span>
                    <ha-entity-picker
                      .hass=${this.hass}
                      .value=${this._config.ev_charger?.power || ""}
                      .configValue=${"ev_charger.power"}
                      @value-changed=${this._valueChanged}
                      .includeDomains=${["sensor"]}
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                </div>
              `
            : ""}
        </div>
      </div>
    `;
  }

  // Array management
  private _addArray(): void {
    const arrays = [...(this._config.solar?.arrays || [])];
    arrays.push({ name: `PV${arrays.length + 1}`, power: "" });

    const newConfig = {
      ...this._config,
      solar: { ...this._config.solar, arrays },
    };
    fireEvent(this, "config-changed", { config: newConfig });
  }

  private _removeArray(index: number): void {
    const arrays = [...(this._config.solar?.arrays || [])];
    arrays.splice(index, 1);

    const newConfig = {
      ...this._config,
      solar: { ...this._config.solar, arrays },
    };
    fireEvent(this, "config-changed", { config: newConfig });
  }

  private _updateArray(index: number, field: string, value: string): void {
    const arrays = [...(this._config.solar?.arrays || [])];
    arrays[index] = { ...arrays[index], [field]: value };

    const newConfig = {
      ...this._config,
      solar: { ...this._config.solar, arrays },
    };
    fireEvent(this, "config-changed", { config: newConfig });
  }

  // Circuit management
  private _addCircuit(): void {
    const items: CircuitItemConfig[] = [...(this._config.circuits?.items || [])];
    items.push({ name: "", icon: "mdi:flash", power: "" });

    const newConfig = {
      ...this._config,
      circuits: { ...this._config.circuits, items },
    };
    fireEvent(this, "config-changed", { config: newConfig });
  }

  private _removeCircuit(index: number): void {
    const items = [...(this._config.circuits?.items || [])];
    items.splice(index, 1);

    const newConfig = {
      ...this._config,
      circuits: { ...this._config.circuits, items },
    };
    fireEvent(this, "config-changed", { config: newConfig });
  }

  private _updateCircuit(index: number, field: string, value: string): void {
    const items = [...(this._config.circuits?.items || [])];
    items[index] = { ...items[index], [field]: value };

    const newConfig = {
      ...this._config,
      circuits: { ...this._config.circuits, items },
    };
    fireEvent(this, "config-changed", { config: newConfig });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-flow-card-editor": EnergyFlowCardEditor;
  }
}
