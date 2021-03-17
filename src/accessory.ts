import { AccessoryPlugin, Service, CharacteristicValue } from 'homebridge';
import noble from '@abandonware/noble';

import { GoveeHomebridgePlatform } from './platform';
import { Govee } from './govee';
import { AccessoryState } from './interfaces';

export class GoveeAccessory implements AccessoryPlugin {
  private readonly informationService: Service;
  private readonly lightbulbService: Service;
  private readonly led: Govee;

  private state: AccessoryState = {
    On: false,
    Brightness: 100,
    Saturation: 100,
    Hue: 360,
    ColorTemperature: 500,
    Connected: false,
  };

  constructor(
    private readonly platform: GoveeHomebridgePlatform,
    public readonly name: string,
    private readonly macAddress: string,
  ) {
    this.led = new Govee(this.macAddress, noble);

    this.led
      .on('discovered', (device) => {
        this.platform.log.debug(`Discovered BLE device ${device.advertisement.localName} - ${device.address}`);
      })
      .on('ble:disconnect', () => {
        this.state.Connected = false;
        this.platform.log.info(`[${this.name}] Connection lost`);
      })
      .on('reconnected', () => {
        this.state.Connected = true;
        this.platform.log.info(`[${this.name}] Reconnected`);
      })
      .on('disconnect', () => {
        this.state.Connected = false;
        this.platform.log.info(`[${this.name}] Disconnected`);
      })
      .on('connected', () => {
        this.state.Connected = true;
        this.platform.log.info(`[${this.name}] Connected`);
      });

    this.informationService = new this.platform.Service.AccessoryInformation()
      .setCharacteristic(this.platform.Characteristic.Name, this.name)
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Govee')
      .setCharacteristic(this.platform.Characteristic.Model, 'H6179')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.macAddress)
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, '1.00.08')
      .setCharacteristic(this.platform.Characteristic.HardwareRevision, '1.00.01');

    this.lightbulbService = new this.platform.Service.Lightbulb(this.name);

    this.lightbulbService.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));

    this.lightbulbService.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this))
      .onGet(this.getBrightness.bind(this));

    this.lightbulbService.getCharacteristic(this.platform.Characteristic.Hue)
      .onSet(this.setHue.bind(this))
      .onGet(this.getHue.bind(this));

    this.lightbulbService.getCharacteristic(this.platform.Characteristic.Saturation)
      .onSet(this.setSaturation.bind(this))
      .onGet(this.getSaturation.bind(this));

    this.lightbulbService.getCharacteristic(this.platform.Characteristic.ColorTemperature)
      .onSet(this.setColorTemperature.bind(this))
      .onGet(this.getColorTemperature.bind(this));
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.lightbulbService,
    ];
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
    this.state.Hue = value as number;

    this.platform.log.debug(`[${this.name}] Set Characteristic Hue ->`, value);

    this.led.setColor(this.state.Hue, this.state.Saturation);
  }

  async getHue(): Promise<CharacteristicValue> {
    const hue = this.state.Hue;

    this.platform.log.debug(`[${this.name}] Get Characteristic Hue ->`, hue);

    return hue;
  }

  async setSaturation(value: CharacteristicValue) {
    this.state.Saturation = value as number;

    this.platform.log.debug(`[${this.name}] Set Characteristic Saturation ->`, value);

    this.led.setColor(this.state.Hue, this.state.Saturation);
  }

  async getSaturation(): Promise<CharacteristicValue> {
    const saturation = this.state.Saturation;

    this.platform.log.debug(`[${this.name}] Get Characteristic Saturation ->`, saturation);

    return saturation;
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
