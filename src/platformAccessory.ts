import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import noble from '@abandonware/noble';

import { ExampleHomebridgePlatform } from './platform';
import { Govee } from './govee';

export class ExamplePlatformAccessory {
  private service: Service;

  private states = {
    On: false,
    Brightness: 100,
    Saturation: 100,
    Hue: 360,
    ColorTemperature: 500,
  };

  private led: Govee;

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.led = new Govee(accessory.context.device.uniqueId, noble);

    this.led
      .on('ble:disconnect', () => this.platform.log.debug('Lost connection'))
      .on('reconnected', () => this.platform.log.debug('Reconnected'))
      .on('disconnect', () => this.platform.log.debug('Disconnnect'))
      .on('connected', () => this.platform.log.debug('Connected'));

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Govee')
      .setCharacteristic(this.platform.Characteristic.Model, 'H6179')
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, '1.00.08')
      .setCharacteristic(this.platform.Characteristic.HardwareRevision, '1.00.01');

    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this))
      .onGet(this.getBrightness.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.Hue)
      .onSet(this.setHue.bind(this))
      .onGet(this.getHue.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.Saturation)
      .onSet(this.setSaturation.bind(this))
      .onGet(this.getSaturation.bind(this));

    // this.service.getCharacteristic(this.platform.Characteristic.ColorTemperature)
    //   .onSet(this.setColorTemperature.bind(this))
    //   .onGet(this.getColorTemperature.bind(this));

  }

  async setOn(value: CharacteristicValue) {
    this.states.On = value as boolean;

    this.platform.log.debug('Set Characteristic On ->', value);

    this.led.setState(this.states.On);
  }

  async getOn(): Promise<CharacteristicValue> {
    const isOn = this.states.On;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return isOn;
  }

  async setBrightness(value: CharacteristicValue) {
    this.states.Brightness = value as number;

    this.platform.log.debug('Set Characteristic Brightness -> ', value);

    this.led.setBrightness(this.states.Brightness);
  }

  async getBrightness(): Promise<CharacteristicValue> {
    const brightness = this.states.Brightness;

    this.platform.log.debug('Get Characteristic Brightness -> ', brightness);

    return brightness;
  }

  async setHue(value: CharacteristicValue) {
    this.states.Hue = value as number;

    this.platform.log.debug('Set Characteristic Hue -> ', value);

    this.led.setColor(this.states.Hue, this.states.Saturation);
  }

  async getHue(): Promise<CharacteristicValue> {
    const hue = this.states.Hue;

    this.platform.log.debug('Get Characteristic Hue -> ', hue);

    return hue;
  }

  async setSaturation(value: CharacteristicValue) {
    this.states.Saturation = value as number;

    this.platform.log.debug('Set Characteristic Saturation -> ', value);

    this.led.setColor(this.states.Hue, this.states.Saturation);
  }

  async getSaturation(): Promise<CharacteristicValue> {
    const saturation = this.states.Saturation;

    this.platform.log.debug('Get Characteristic Saturation -> ', saturation);

    return saturation;
  }

  // async setColorTemperature(value: CharacteristicValue) {
  //   this.states.ColorTemperature = value as number;
  //
  //   this.platform.log.debug('Set Characteristic ColorTemperature -> ', value);
  //
  //   this.led.setTemperature(this.states.ColorTemperature);
  // }
  //
  // async getColorTemperature(): Promise<CharacteristicValue> {
  //   const colorTemperature = this.states.ColorTemperature;
  //
  //   this.platform.log.debug('Get Characteristic ColorTemperature -> ', colorTemperature);
  //
  //   return colorTemperature;
  // }
}
