import { AccessoryPlugin, Service, CharacteristicValue } from 'homebridge';
import { Peripheral } from '@abandonware/noble';

import { GoveeHomebridgePlatform } from './platform';
import { Govee } from './govee';
import { AccessoryState } from './interfaces';

export class GoveeAccessory implements AccessoryPlugin {
  private readonly informationService: Service;
  private readonly lightbulbService: Service;
  private readonly led: Govee;

  private state: AccessoryState = {
    Connected: false,
    On: false,
    Brightness: 100,
    ColorTemperature: 500,
    Color: {
      Hue: 360,
      Saturation: 100,
      Value: 0,
    },
  };

  private characteristicValueTransitionControl: any; /* eslint-disable-line  @typescript-eslint/no-explicit-any */

  constructor(
    private readonly platform: GoveeHomebridgePlatform,
    public readonly name: string,
    private readonly macAddress: string,
  ) {
    this.led = new Govee(this.macAddress);
    this.informationService = new this.platform.Service.AccessoryInformation();
    this.lightbulbService = new this.platform.Service.Lightbulb(this.name);

    this.initDeviceDiscovery();
    this.initInformationService();
    this.initLightbulbService();
  }

  initDeviceDiscovery(): void {
    this.led
      .on('discovered', this.discovered.bind(this))
      .on('ble:disconnect', this.disconnect.bind(this))
      .on('reconnected', this.reconnected.bind(this))
      .on('disconnected', this.discovered.bind(this))
      .on('located', this.located.bind(this))
      .on('connected', this.connected.bind(this));
  }

  initInformationService(): void {
    this.informationService
      .setCharacteristic(this.platform.Characteristic.Name, this.name)
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Govee')
      .setCharacteristic(this.platform.Characteristic.Model, 'H6179')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.macAddress)
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, '1.00.08')
      .setCharacteristic(this.platform.Characteristic.HardwareRevision, '1.00.01');
  }

  initLightbulbService(): void {
    this.lightbulbService
      .getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));

    this.lightbulbService
      .getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this))
      .onGet(this.getBrightness.bind(this));

    this.lightbulbService
      .getCharacteristic(this.platform.Characteristic.Hue)
      .onSet(this.setHue.bind(this))
      .onGet(this.getHue.bind(this));

    this.lightbulbService
      .getCharacteristic(this.platform.Characteristic.Saturation)
      .onSet(this.setSaturation.bind(this))
      .onGet(this.getSaturation.bind(this));

    this.lightbulbService
      .getCharacteristic(this.platform.Characteristic.ColorTemperature)
      .onSet(this.setColorTemperature.bind(this))
      .onGet(this.getColorTemperature.bind(this));

    this.lightbulbService
      .getCharacteristic(this.platform.Characteristic.CharacteristicValueTransitionControl)
      .onSet(this.setCharacteristicValueTransitionControl.bind(this))
      .onGet(this.getCharacteristicValueTransitionControl.bind(this));
  }

  disconnect(): void {
    this.state.Connected = false;

    this.platform.log.info(`[${this.name}] Connection lost`);
  }

  discovered(device: Peripheral): void {
    this.platform.log.debug(`Discovered BLE device ${device.advertisement.localName} - ${device.address}`);
  }

  located(device: Peripheral): void {
    this.platform.log.info(`${this.name}] Found on ${device.address}`);
  }

  connected(): void {
    this.state.Connected = true;

    this.platform.log.info(`[${this.name}] Connected`);
  }

  disconnected(): void {
    this.state.Connected = false;

    this.platform.log.info(`[${this.name}] Disconnected`);
  }

  reconnected(): void {
    this.state.Connected = true;

    this.platform.log.info(`[${this.name}] Reconnected`);
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.lightbulbService,
    ];
  }

  async setCharacteristicValueTransitionControl(value: CharacteristicValue) {
    this.characteristicValueTransitionControl = value;

    this.platform.log.debug(`[${this.name}] Set Characteristic Value Transition Control On ->`, value);
  }

  async getCharacteristicValueTransitionControl(): Promise<CharacteristicValue> {

    const characteristicValueTransitionControl = this.characteristicValueTransitionControl;

    this.platform.log.debug(`[${this.name}] Get Characteristic Value Transition Control ->`, characteristicValueTransitionControl);

    return characteristicValueTransitionControl;
  }

  async setOn(value: CharacteristicValue) {
    this.state.On = value as boolean;

    this.platform.log.debug(`[${this.name}] Set Characteristic On ->`, value);

    this.led.setState(this.state.On);
  }

  async getOn(): Promise<CharacteristicValue> {
    if (!this.state.Connected) {
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }

    const isOn = this.state.On;

    this.platform.log.debug(`[${this.name}] Get Characteristic On ->`, isOn);

    return isOn;
  }

  async setBrightness(value: CharacteristicValue) {
    this.state.Brightness = value as number;

    this.platform.log.debug(`[${this.name}] Set Characteristic Brightness ->`, value);

    this.led.setBrightness(this.state.Brightness);
  }

  async getBrightness(): Promise<CharacteristicValue> {
    const brightness = this.state.Brightness;

    this.platform.log.debug(`[${this.name}] Get Characteristic Brightness ->`, brightness);

    return brightness;
  }

  async setHue(value: CharacteristicValue) {
    this.state.Color.Hue = value as number;

    this.platform.log.debug(`[${this.name}] Set Characteristic Hue ->`, value);

    this.setLedColor();
  }

  async getHue(): Promise<CharacteristicValue> {
    const hue = this.state.Color.Hue;

    this.platform.log.debug(`[${this.name}] Get Characteristic Hue ->`, hue);

    return hue;
  }

  async setSaturation(value: CharacteristicValue) {
    this.state.Color.Saturation = value as number;

    this.platform.log.debug(`[${this.name}] Set Characteristic Saturation ->`, value);

    this.setLedColor();
  }

  async getSaturation(): Promise<CharacteristicValue> {
    const saturation = this.state.Color.Saturation;

    this.platform.log.debug(`[${this.name}] Get Characteristic Saturation ->`, saturation);

    return saturation;
  }

  setLedColor(): void {
    this.led.setColor(this.state.Color.Hue, this.state.Color.Saturation, this.state.Color.Value);
  }

  async setColorTemperature(value: CharacteristicValue) {
    this.state.ColorTemperature = value as number;

    this.platform.log.debug(`[${this.name}] Set Characteristic ColorTemperature ->`, value);

    this.led.setTemperature(this.state.ColorTemperature);
  }

  async getColorTemperature(): Promise<CharacteristicValue> {
    const colorTemperature = this.state.ColorTemperature;

    this.platform.log.debug(`[${this.name}] Get Characteristic ColorTemperature ->`, colorTemperature);

    return colorTemperature;
  }
}
