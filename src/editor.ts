// src/editor.ts
// Visual configuration editor for Energy Flow Card

import { LitElement, html, css, TemplateResult, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, fireEvent, LovelaceCardEditor } from "custom-card-helpers";
import { EnergyFlowCardConfig, CircuitItemConfig, SolarArrayConfig, ActionButtonConfig, ActionConfig } from "./types";
import { CARD_EDITOR_NAME } from "./const";

@customElement(CARD_EDITOR_NAME)
export class EnergyFlowCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: EnergyFlowCardConfig;

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

    .form-group {
      margin-bottom: 12px;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-group label {
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 4px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    @media (max-width: 450px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    ha-textfield,
    ha-select,
    ha-selector {
      display: block;
      width: 100%;
    }

    ha-switch {
      --mdc-theme-secondary: var(--primary-color);
    }

    .switch-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .switch-label {
      font-size: 14px;
    }

    .help-text {
      font-size: 11px;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .list-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      position: relative;
    }

    .list-item-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    @media (max-width: 450px) {
      .list-item-row {
        grid-template-columns: 1fr;
      }
    }

    .delete-button {
      position: absolute;
      top: 4px;
      right: 4px;
      --mdc-icon-button-size: 36px;
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
    }

    .delete-button:hover {
      color: var(--error-color, #f44336);
    }

    mwc-button {
      --mdc-theme-primary: var(--primary-color);
      margin-top: 8px;
    }
  `;

  public setConfig(config: EnergyFlowCardConfig): void {
    this._config = config;
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    return html`
      <div class="card-config">
        ${this._renderGeneralSection()}
        ${this._renderAnimationSection()}
        ${this._renderSolarSection()}
        ${this._renderGridSection()}
        ${this._renderBatterySection()}
        ${this._renderInverterSection()}
        ${this._renderHomeSection()}
        ${this._renderDailyTotalsSection()}
        ${this._renderCircuitsSection()}
        ${this._renderActionButtonsSection()}
        ${this._renderUPSSection()}
        ${this._renderEVChargerSection()}
      </div>
    `;
  }

  // ============================================================================
  // Section Renderers
  // ============================================================================

  private _renderGeneralSection(): TemplateResult {
    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:cog"></ha-icon>
          General
        </div>
        <div class="form-group">
          <label>Card Title</label>
          <ha-textfield
            .value=${this._config.title || ""}
            .placeholder=${"Energy Flow"}
            @input=${(e: Event) => this._updateConfig("title", (e.target as HTMLInputElement).value)}
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  private _renderAnimationSection(): TemplateResult {
    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:animation"></ha-icon>
          Animation
        </div>
        <div class="switch-row">
          <span class="switch-label">Enable Animation</span>
          <ha-switch
            .checked=${this._config.animation?.enabled ?? true}
            @change=${(e: Event) => this._updateAnimation("enabled", (e.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        <div class="form-group">
          <label>Animation Speed</label>
          <ha-selector
            .hass=${this.hass}
            .selector=${{
              select: {
                options: [
                  { value: "auto", label: "Auto (based on power)" },
                  { value: "fast", label: "Fast" },
                  { value: "medium", label: "Medium" },
                  { value: "slow", label: "Slow" },
                ],
                mode: "dropdown",
              },
            }}
            .value=${this._config.animation?.speed || "auto"}
            @value-changed=${(e: CustomEvent) => this._updateAnimation("speed", e.detail.value)}
          ></ha-selector>
        </div>
      </div>
    `;
  }

  private _renderSolarSection(): TemplateResult {
    const show = this._config.solar?.show ?? false;
    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:solar-power"></ha-icon>
          Solar
        </div>
        <div class="switch-row">
          <span class="switch-label">Show Solar</span>
          <ha-switch
            .checked=${show}
            @change=${(e: Event) => this._updateSolar("show", (e.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        ${show ? html`
          <div class="form-group">
            <label>Total Power (optional)</label>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: ["sensor"] } }}
              .value=${this._config.solar?.total_power || ""}
              @value-changed=${(e: CustomEvent) => this._updateSolar("total_power", e.detail.value || "")}
            ></ha-selector>
            <span class="help-text">Leave empty to sum array powers</span>
          </div>
          <div class="form-group">
            <label>Daily Production</label>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: ["sensor"] } }}
              .value=${this._config.solar?.daily_production || ""}
              @value-changed=${(e: CustomEvent) => this._updateSolar("daily_production", e.detail.value || "")}
            ></ha-selector>
          </div>
          <div class="form-group">
            <label>PV Arrays</label>
            <div class="items-list">
              ${(this._config.solar?.arrays || []).map((array, index) => this._renderArrayItem(array, index))}
            </div>
            <mwc-button @click=${this._addArray}>
              <ha-icon icon="mdi:plus"></ha-icon>
              Add Array
            </mwc-button>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderArrayItem(array: SolarArrayConfig, index: number): TemplateResult {
    return html`
      <div class="list-item">
        <mwc-icon-button
          class="delete-button"
          @click=${() => this._removeArray(index)}
          title="Remove array"
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </mwc-icon-button>
        <div class="form-group">
          <label>Name</label>
          <ha-textfield
            .value=${array.name || ""}
            @input=${(e: Event) => this._updateArray(index, "name", (e.target as HTMLInputElement).value)}
          ></ha-textfield>
        </div>
        <div class="form-group">
          <label>Power Entity</label>
          <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: { domain: ["sensor"] } }}
            .value=${array.power || ""}
            @value-changed=${(e: CustomEvent) => this._updateArray(index, "power", e.detail.value || "")}
          ></ha-selector>
        </div>
      </div>
    `;
  }

  private _renderGridSection(): TemplateResult {
    const show = this._config.grid?.show ?? true;
    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:transmission-tower"></ha-icon>
          Grid
        </div>
        <div class="switch-row">
          <span class="switch-label">Show Grid</span>
          <ha-switch
            .checked=${show}
            @change=${(e: Event) => this._updateGrid("show", (e.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        ${show ? html`
          <div class="form-group">
            <label>Grid Power</label>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: ["sensor"] } }}
              .value=${this._config.grid?.power || ""}
              @value-changed=${(e: CustomEvent) => this._updateGrid("power", e.detail.value || "")}
            ></ha-selector>
            <span class="help-text">Positive = import, Negative = export</span>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Daily Import</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.grid?.daily_import || ""}
                @value-changed=${(e: CustomEvent) => this._updateGrid("daily_import", e.detail.value || "")}
              ></ha-selector>
            </div>
            <div class="form-group">
              <label>Daily Export</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.grid?.daily_export || ""}
                @value-changed=${(e: CustomEvent) => this._updateGrid("daily_export", e.detail.value || "")}
              ></ha-selector>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderBatterySection(): TemplateResult {
    const show = this._config.battery?.show ?? false;
    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:battery-high"></ha-icon>
          Battery
        </div>
        <div class="switch-row">
          <span class="switch-label">Show Battery</span>
          <ha-switch
            .checked=${show}
            @change=${(e: Event) => this._updateBattery("show", (e.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        ${show ? html`
          <div class="form-group">
            <label>Battery Power</label>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: ["sensor"] } }}
              .value=${this._config.battery?.power || ""}
              @value-changed=${(e: CustomEvent) => this._updateBattery("power", e.detail.value || "")}
            ></ha-selector>
            <span class="help-text">Positive = charging, Negative = discharging</span>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>State of Charge</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.battery?.soc || ""}
                @value-changed=${(e: CustomEvent) => this._updateBattery("soc", e.detail.value || "")}
              ></ha-selector>
            </div>
            <div class="form-group">
              <label>Voltage</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.battery?.voltage || ""}
                @value-changed=${(e: CustomEvent) => this._updateBattery("voltage", e.detail.value || "")}
              ></ha-selector>
            </div>
          </div>
          <div class="form-group">
            <label>Current</label>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: ["sensor"] } }}
              .value=${this._config.battery?.current || ""}
              @value-changed=${(e: CustomEvent) => this._updateBattery("current", e.detail.value || "")}
            ></ha-selector>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderHomeSection(): TemplateResult {
    // Normalize power config to array for display
    const powerEntities = this._getHomePowerEntities();
    
    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:home"></ha-icon>
          Home
        </div>
        <div class="form-group">
          <label>Home Power Entities (optional)</label>
          <div class="items-list">
            ${powerEntities.map((entity, index) => this._renderHomePowerItem(entity, index))}
          </div>
          <mwc-button @click=${this._addHomePowerEntity}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Entity
          </mwc-button>
          <span class="help-text">Leave empty to calculate from Solar - Battery + Grid. Multiple entities will be summed.</span>
        </div>
        <div class="form-group">
          <label>Daily Consumption Entities</label>
          <div class="items-list">
            ${this._getDailyConsumptionEntities().map((entity, index) => this._renderDailyConsumptionItem(entity, index))}
          </div>
          <mwc-button @click=${this._addDailyConsumptionEntity}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Entity
          </mwc-button>
          <span class="help-text">Multiple entities will be summed.</span>
        </div>
      </div>
    `;
  }

  private _getHomePowerEntities(): string[] {
    const power = this._config.home?.power;
    if (!power) return [];
    if (Array.isArray(power)) return power;
    return [power];
  }

  private _renderHomePowerItem(entity: string, index: number): TemplateResult {
    return html`
      <div class="list-item">
        <mwc-icon-button
          class="delete-button"
          @click=${() => this._removeHomePowerEntity(index)}
          title="Remove entity"
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </mwc-icon-button>
        <div class="form-group">
          <label>Power Entity</label>
          <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: { domain: ["sensor"] } }}
            .value=${entity || ""}
            @value-changed=${(e: CustomEvent) => this._updateHomePowerEntity(index, e.detail.value || "")}
          ></ha-selector>
        </div>
      </div>
    `;
  }

  private _addHomePowerEntity(): void {
    const current = this._getHomePowerEntities();
    this._updateHome("power", [...current, ""]);
  }

  private _removeHomePowerEntity(index: number): void {
    const current = this._getHomePowerEntities();
    const updated = current.filter((_, i) => i !== index);
    this._updateHome("power", updated);
  }

  private _updateHomePowerEntity(index: number, value: string): void {
    const current = this._getHomePowerEntities();
    const updated = [...current];
    updated[index] = value;
    this._updateHome("power", updated);
  }

  // Daily Consumption entity management
  private _getDailyConsumptionEntities(): string[] {
    const consumption = this._config.home?.daily_consumption;
    if (!consumption) return [];
    if (Array.isArray(consumption)) return consumption;
    return [consumption];
  }

  private _renderDailyConsumptionItem(entity: string, index: number): TemplateResult {
    return html`
      <div class="list-item">
        <mwc-icon-button
          class="delete-button"
          @click=${() => this._removeDailyConsumptionEntity(index)}
          title="Remove entity"
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </mwc-icon-button>
        <div class="form-group">
          <label>Consumption Entity</label>
          <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: { domain: ["sensor"] } }}
            .value=${entity || ""}
            @value-changed=${(e: CustomEvent) => this._updateDailyConsumptionEntity(index, e.detail.value || "")}
          ></ha-selector>
        </div>
      </div>
    `;
  }

  private _addDailyConsumptionEntity(): void {
    const current = this._getDailyConsumptionEntities();
    this._updateHome("daily_consumption", [...current, ""]);
  }

  private _removeDailyConsumptionEntity(index: number): void {
    const current = this._getDailyConsumptionEntities();
    const updated = current.filter((_, i) => i !== index);
    this._updateHome("daily_consumption", updated);
  }

  private _updateDailyConsumptionEntity(index: number, value: string): void {
    const current = this._getDailyConsumptionEntities();
    const updated = [...current];
    updated[index] = value;
    this._updateHome("daily_consumption", updated);
  }

  private _renderDailyTotalsSection(): TemplateResult {
    const show = this._config.daily_totals?.show ?? true;
    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:calendar-today"></ha-icon>
          Daily Totals
        </div>
        <div class="switch-row">
          <span class="switch-label">Show Daily Totals</span>
          <ha-switch
            .checked=${show}
            @change=${(e: Event) => this._updateDailyTotals("show", (e.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        ${show ? html`
          <div class="switch-row">
            <span class="switch-label">Show Self-Sufficiency</span>
            <ha-switch
              .checked=${this._config.daily_totals?.show_self_sufficiency ?? true}
              @change=${(e: Event) => this._updateDailyTotals("show_self_sufficiency", (e.target as HTMLInputElement).checked)}
            ></ha-switch>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderCircuitsSection(): TemplateResult {
    const show = this._config.circuits?.show ?? false;
    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:flash"></ha-icon>
          Circuits
        </div>
        <div class="switch-row">
          <span class="switch-label">Show Circuits</span>
          <ha-switch
            .checked=${show}
            @change=${(e: Event) => this._updateCircuits("show", (e.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        ${show ? html`
          <div class="form-row">
            <div class="form-group">
              <label>Columns</label>
              <ha-textfield
                type="number"
                min="1"
                max="10"
                .value=${String(this._config.circuits?.columns || 5)}
                @input=${(e: Event) => this._updateCircuits("columns", parseInt((e.target as HTMLInputElement).value) || 5)}
              ></ha-textfield>
            </div>
            <div class="form-group">
              <label>Highlight Top N</label>
              <ha-textfield
                type="number"
                min="0"
                max="10"
                .value=${String(this._config.circuits?.highlight_top || 0)}
                @input=${(e: Event) => this._updateCircuits("highlight_top", parseInt((e.target as HTMLInputElement).value) || 0)}
              ></ha-textfield>
              <span class="help-text">0 = disabled</span>
            </div>
          </div>
          <div class="form-group">
            <label>Circuit Items</label>
            <div class="items-list">
              ${(this._config.circuits?.items || []).map((circuit, index) => this._renderCircuitItem(circuit, index))}
            </div>
            <mwc-button @click=${this._addCircuit}>
              <ha-icon icon="mdi:plus"></ha-icon>
              Add Circuit
            </mwc-button>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderCircuitItem(circuit: CircuitItemConfig, index: number): TemplateResult {
    return html`
      <div class="list-item">
        <mwc-icon-button
          class="delete-button"
          @click=${() => this._removeCircuit(index)}
          title="Remove circuit"
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </mwc-icon-button>
        <div class="list-item-row">
          <div class="form-group">
            <label>Name</label>
            <ha-textfield
              .value=${circuit.name || ""}
              @input=${(e: Event) => this._updateCircuit(index, "name", (e.target as HTMLInputElement).value)}
            ></ha-textfield>
          </div>
          <div class="form-group">
            <label>Icon</label>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ icon: {} }}
              .value=${circuit.icon || "mdi:flash"}
              @value-changed=${(e: CustomEvent) => this._updateCircuit(index, "icon", e.detail.value || "mdi:flash")}
            ></ha-selector>
          </div>
        </div>
        <div class="form-group">
          <label>Power Entity</label>
          <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: { domain: ["sensor"] } }}
            .value=${circuit.power || ""}
            @value-changed=${(e: CustomEvent) => this._updateCircuit(index, "power", e.detail.value || "")}
          ></ha-selector>
        </div>
      </div>
    `;
  }

  private _renderInverterSection(): TemplateResult {
    const show = this._config.inverter?.show ?? false;
    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:power-plug-outline"></ha-icon>
          Inverter (Optional)
        </div>
        <div class="switch-row">
          <span class="switch-label">Show Inverter</span>
          <ha-switch
            .checked=${show}
            @change=${(e: Event) => this._updateInverter("show", (e.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        ${show ? html`
          <div class="form-group">
            <label>Working Mode</label>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: ["select", "input_select", "sensor"] } }}
              .value=${this._config.inverter?.mode || ""}
              @value-changed=${(e: CustomEvent) => this._updateInverter("mode", e.detail.value || "")}
            ></ha-selector>
            <div class="help-text">Select or input_select entity to allow mode changes from card</div>
          </div>
          <div class="form-group">
            <label>Grid Connection Status</label>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: ["binary_sensor", "sensor", "switch"] } }}
              .value=${this._config.inverter?.grid_status || ""}
              @value-changed=${(e: CustomEvent) => this._updateInverter("grid_status", e.detail.value || "")}
            ></ha-selector>
            <div class="help-text">Shows if inverter is connected to grid or running off-grid</div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Inverter Temperature</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.inverter?.temperature || ""}
                @value-changed=${(e: CustomEvent) => this._updateInverter("temperature", e.detail.value || "")}
              ></ha-selector>
            </div>
            <div class="form-group">
              <label>DC Temperature</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.inverter?.dc_temperature || ""}
                @value-changed=${(e: CustomEvent) => this._updateInverter("dc_temperature", e.detail.value || "")}
              ></ha-selector>
            </div>
          </div>
          <div class="form-group">
            <label>Output Power</label>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: ["sensor"] } }}
              .value=${this._config.inverter?.output_power || ""}
              @value-changed=${(e: CustomEvent) => this._updateInverter("output_power", e.detail.value || "")}
            ></ha-selector>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Output Voltage</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.inverter?.output_voltage || ""}
                @value-changed=${(e: CustomEvent) => this._updateInverter("output_voltage", e.detail.value || "")}
              ></ha-selector>
            </div>
            <div class="form-group">
              <label>Output Current</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.inverter?.output_current || ""}
                @value-changed=${(e: CustomEvent) => this._updateInverter("output_current", e.detail.value || "")}
              ></ha-selector>
            </div>
          </div>
          <div class="form-group">
            <label>Battery SOC (Inverter Reported)</label>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: ["sensor"] } }}
              .value=${this._config.inverter?.battery_soc || ""}
              @value-changed=${(e: CustomEvent) => this._updateInverter("battery_soc", e.detail.value || "")}
            ></ha-selector>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Battery Voltage (Inverter)</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.inverter?.battery_voltage || ""}
                @value-changed=${(e: CustomEvent) => this._updateInverter("battery_voltage", e.detail.value || "")}
              ></ha-selector>
            </div>
            <div class="form-group">
              <label>Battery Current (Inverter)</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.inverter?.battery_current || ""}
                @value-changed=${(e: CustomEvent) => this._updateInverter("battery_current", e.detail.value || "")}
              ></ha-selector>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderUPSSection(): TemplateResult {
    const show = this._config.ups?.show ?? false;
    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:power-plug"></ha-icon>
          UPS (Optional)
        </div>
        <div class="switch-row">
          <span class="switch-label">Show UPS</span>
          <ha-switch
            .checked=${show}
            @change=${(e: Event) => this._updateUPS("show", (e.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        ${show ? html`
          <div class="form-group">
            <label>Battery Level</label>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: ["sensor"] } }}
              .value=${this._config.ups?.battery || ""}
              @value-changed=${(e: CustomEvent) => this._updateUPS("battery", e.detail.value || "")}
            ></ha-selector>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Status</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.ups?.status || ""}
                @value-changed=${(e: CustomEvent) => this._updateUPS("status", e.detail.value || "")}
              ></ha-selector>
            </div>
            <div class="form-group">
              <label>Load</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.ups?.load || ""}
                @value-changed=${(e: CustomEvent) => this._updateUPS("load", e.detail.value || "")}
              ></ha-selector>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderEVChargerSection(): TemplateResult {
    const show = this._config.ev_charger?.show ?? false;
    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:ev-station"></ha-icon>
          EV Charger (Optional)
        </div>
        <div class="switch-row">
          <span class="switch-label">Show EV Charger</span>
          <ha-switch
            .checked=${show}
            @change=${(e: Event) => this._updateEVCharger("show", (e.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        ${show ? html`
          <div class="form-row">
            <div class="form-group">
              <label>Mode</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.ev_charger?.mode || ""}
                @value-changed=${(e: CustomEvent) => this._updateEVCharger("mode", e.detail.value || "")}
              ></ha-selector>
            </div>
            <div class="form-group">
              <label>Status</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.ev_charger?.status || ""}
                @value-changed=${(e: CustomEvent) => this._updateEVCharger("status", e.detail.value || "")}
              ></ha-selector>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Plug Status</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.ev_charger?.plug_status || ""}
                @value-changed=${(e: CustomEvent) => this._updateEVCharger("plug_status", e.detail.value || "")}
              ></ha-selector>
            </div>
            <div class="form-group">
              <label>Power</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ["sensor"] } }}
                .value=${this._config.ev_charger?.power || ""}
                @value-changed=${(e: CustomEvent) => this._updateEVCharger("power", e.detail.value || "")}
              ></ha-selector>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }

  // ============================================================================
  // Config Update Methods
  // ============================================================================

  private _updateConfig(key: string, value: unknown): void {
    this._config = { ...this._config, [key]: value };
    this._fireConfigChanged();
  }

  private _updateAnimation(key: string, value: unknown): void {
    this._config = {
      ...this._config,
      animation: { ...this._config.animation, [key]: value },
    };
    this._fireConfigChanged();
  }

  private _updateSolar(key: string, value: unknown): void {
    this._config = {
      ...this._config,
      solar: { ...this._config.solar, [key]: value },
    };
    this._fireConfigChanged();
  }

  private _updateGrid(key: string, value: unknown): void {
    this._config = {
      ...this._config,
      grid: { ...this._config.grid, [key]: value },
    };
    this._fireConfigChanged();
  }

  private _updateBattery(key: string, value: unknown): void {
    this._config = {
      ...this._config,
      battery: { ...this._config.battery, [key]: value },
    };
    this._fireConfigChanged();
  }

  private _updateHome(key: string, value: unknown): void {
    this._config = {
      ...this._config,
      home: { ...this._config.home, [key]: value },
    };
    this._fireConfigChanged();
  }

  private _updateDailyTotals(key: string, value: unknown): void {
    this._config = {
      ...this._config,
      daily_totals: { ...this._config.daily_totals, [key]: value },
    };
    this._fireConfigChanged();
  }

  private _updateCircuits(key: string, value: unknown): void {
    this._config = {
      ...this._config,
      circuits: { ...this._config.circuits, [key]: value },
    };
    this._fireConfigChanged();
  }

  private _updateUPS(key: string, value: unknown): void {
    this._config = {
      ...this._config,
      ups: { ...this._config.ups, [key]: value },
    };
    this._fireConfigChanged();
  }

  private _updateEVCharger(key: string, value: unknown): void {
    this._config = {
      ...this._config,
      ev_charger: { ...this._config.ev_charger, [key]: value },
    };
    this._fireConfigChanged();
  }

  private _updateInverter(key: string, value: unknown): void {
    this._config = {
      ...this._config,
      inverter: { ...this._config.inverter, [key]: value },
    };
    this._fireConfigChanged();
  }

  // Array management
  private _addArray(): void {
    const arrays = [...(this._config.solar?.arrays || [])];
    arrays.push({ name: `PV${arrays.length + 1}`, power: "" });
    this._config = {
      ...this._config,
      solar: { ...this._config.solar, arrays },
    };
    this._fireConfigChanged();
  }

  private _removeArray(index: number): void {
    const arrays = [...(this._config.solar?.arrays || [])];
    arrays.splice(index, 1);
    this._config = {
      ...this._config,
      solar: { ...this._config.solar, arrays },
    };
    this._fireConfigChanged();
  }

  private _updateArray(index: number, field: string, value: string): void {
    const arrays = [...(this._config.solar?.arrays || [])];
    arrays[index] = { ...arrays[index], [field]: value };
    this._config = {
      ...this._config,
      solar: { ...this._config.solar, arrays },
    };
    this._fireConfigChanged();
  }

  // Circuit management
  private _addCircuit(): void {
    const items: CircuitItemConfig[] = [...(this._config.circuits?.items || [])];
    items.push({ name: "", icon: "mdi:flash", power: "" });
    this._config = {
      ...this._config,
      circuits: { ...this._config.circuits, items },
    };
    this._fireConfigChanged();
  }

  private _removeCircuit(index: number): void {
    const items = [...(this._config.circuits?.items || [])];
    items.splice(index, 1);
    this._config = {
      ...this._config,
      circuits: { ...this._config.circuits, items },
    };
    this._fireConfigChanged();
  }

  private _updateCircuit(index: number, field: string, value: string): void {
    const items = [...(this._config.circuits?.items || [])];
    items[index] = { ...items[index], [field]: value };
    this._config = {
      ...this._config,
      circuits: { ...this._config.circuits, items },
    };
    this._fireConfigChanged();
  }

  // ============================================================================
  // Action Buttons Section
  // ============================================================================

  private _renderActionButtonsSection(): TemplateResult {
    const leftButtons = this._config.action_buttons?.left || [];
    const rightButtons = this._config.action_buttons?.right || [];

    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
          Action Buttons
        </div>
        
        <div class="form-group">
          <label>Left Side Buttons</label>
          <div class="items-list">
            ${leftButtons.map((btn, index) => this._renderActionButtonItem(btn, index, "left"))}
          </div>
          <mwc-button @click=${() => this._addActionButton("left")}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Button
          </mwc-button>
        </div>

        <div class="form-group">
          <label>Right Side Buttons</label>
          <div class="items-list">
            ${rightButtons.map((btn, index) => this._renderActionButtonItem(btn, index, "right"))}
          </div>
          <mwc-button @click=${() => this._addActionButton("right")}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Button
          </mwc-button>
        </div>
      </div>
    `;
  }

  private _renderActionButtonItem(button: ActionButtonConfig, index: number, side: "left" | "right"): TemplateResult {
    const actionType = button.tap_action?.action || "navigate";
    
    return html`
      <div class="list-item">
        <mwc-icon-button
          class="delete-button"
          @click=${() => this._removeActionButton(side, index)}
          title="Remove button"
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </mwc-icon-button>

        <div class="list-item-row">
          <div class="form-group">
            <label>Icon</label>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ icon: {} }}
              .value=${button.icon || "mdi:gesture-tap"}
              @value-changed=${(e: CustomEvent) => this._updateActionButton(side, index, "icon", e.detail.value)}
            ></ha-selector>
          </div>
          <div class="form-group">
            <label>Tooltip</label>
            <ha-textfield
              .value=${button.tooltip || ""}
              @input=${(e: Event) => this._updateActionButton(side, index, "tooltip", (e.target as HTMLInputElement).value)}
            ></ha-textfield>
          </div>
        </div>

        <div class="form-group">
          <label>Action Type</label>
          <ha-select
            .value=${actionType}
            @selected=${(e: CustomEvent) => this._updateActionButtonAction(side, index, "action", (e.target as HTMLSelectElement).value)}
            @closed=${(e: Event) => e.stopPropagation()}
          >
            <mwc-list-item value="navigate">Navigate</mwc-list-item>
            <mwc-list-item value="more-info">More Info</mwc-list-item>
            <mwc-list-item value="toggle">Toggle</mwc-list-item>
            <mwc-list-item value="call-service">Call Service</mwc-list-item>
            <mwc-list-item value="url">Open URL</mwc-list-item>
            <mwc-list-item value="none">None</mwc-list-item>
          </ha-select>
        </div>

        ${this._renderActionFields(button, side, index)}
      </div>
    `;
  }

  private _renderActionFields(button: ActionButtonConfig, side: "left" | "right", index: number): TemplateResult {
    const actionType = button.tap_action?.action || "navigate";

    switch (actionType) {
      case "navigate":
        return html`
          <div class="form-group">
            <label>Navigation Path</label>
            <ha-textfield
              .value=${button.tap_action?.navigation_path || ""}
              placeholder="#popup-name or /lovelace/view"
              @input=${(e: Event) => this._updateActionButtonAction(side, index, "navigation_path", (e.target as HTMLInputElement).value)}
            ></ha-textfield>
          </div>
        `;

      case "more-info":
      case "toggle":
        return html`
          <div class="form-group">
            <label>Entity</label>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: {} }}
              .value=${button.tap_action?.entity || ""}
              @value-changed=${(e: CustomEvent) => this._updateActionButtonAction(side, index, "entity", e.detail.value)}
            ></ha-selector>
          </div>
        `;

      case "call-service":
        return html`
          <div class="form-group">
            <label>Service</label>
            <ha-textfield
              .value=${button.tap_action?.service || ""}
              placeholder="domain.service"
              @input=${(e: Event) => this._updateActionButtonAction(side, index, "service", (e.target as HTMLInputElement).value)}
            ></ha-textfield>
            <span class="help-text">For advanced service_data, edit YAML directly</span>
          </div>
        `;

      case "url":
        return html`
          <div class="form-group">
            <label>URL</label>
            <ha-textfield
              .value=${button.tap_action?.url_path || ""}
              placeholder="https://example.com"
              @input=${(e: Event) => this._updateActionButtonAction(side, index, "url_path", (e.target as HTMLInputElement).value)}
            ></ha-textfield>
          </div>
        `;

      default:
        return html``;
    }
  }

  private _addActionButton(side: "left" | "right"): void {
    const buttons = [...(this._config.action_buttons?.[side] || [])];
    buttons.push({ 
      icon: "mdi:gesture-tap", 
      tap_action: { action: "navigate", navigation_path: "" } 
    });
    this._config = {
      ...this._config,
      action_buttons: { 
        ...this._config.action_buttons, 
        [side]: buttons 
      },
    };
    this._fireConfigChanged();
  }

  private _removeActionButton(side: "left" | "right", index: number): void {
    const buttons = [...(this._config.action_buttons?.[side] || [])];
    buttons.splice(index, 1);
    this._config = {
      ...this._config,
      action_buttons: { 
        ...this._config.action_buttons, 
        [side]: buttons 
      },
    };
    this._fireConfigChanged();
  }

  private _updateActionButton(side: "left" | "right", index: number, field: string, value: string): void {
    const buttons = [...(this._config.action_buttons?.[side] || [])];
    buttons[index] = { ...buttons[index], [field]: value };
    this._config = {
      ...this._config,
      action_buttons: { 
        ...this._config.action_buttons, 
        [side]: buttons 
      },
    };
    this._fireConfigChanged();
  }

  private _updateActionButtonAction(side: "left" | "right", index: number, field: string, value: string): void {
    const buttons = [...(this._config.action_buttons?.[side] || [])];
    const currentAction = buttons[index].tap_action || { action: "navigate" as const };
    
    // If changing action type, reset other fields only if action actually changed
    if (field === "action") {
      // Don't reset if the action type hasn't actually changed
      if (currentAction.action === value) {
        return;
      }
      buttons[index] = { 
        ...buttons[index], 
        tap_action: { action: value as ActionConfig["action"] } 
      };
    } else {
      buttons[index] = { 
        ...buttons[index], 
        tap_action: { ...currentAction, [field]: value } 
      };
    }
    
    this._config = {
      ...this._config,
      action_buttons: { 
        ...this._config.action_buttons, 
        [side]: buttons 
      },
    };
    this._fireConfigChanged();
  }

  private _fireConfigChanged(): void {
    fireEvent(this, "config-changed", { config: this._config });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-flow-card-editor": EnergyFlowCardEditor;
  }
}
