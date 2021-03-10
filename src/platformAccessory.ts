import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import noble from '@abandonware/noble';

import { ExampleHomebridgePlatform } from './platform';
import { Govee } from './govee';


/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ExamplePlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
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
    this.led = new Govee('A4:C1:38:DA:1A:B6', noble);
    this.led
      .on('ble:disconnect', () => this.platform.log.debug('lost connection'))
      .on('reconnected', () => this.platform.log.debug('reconnected'))
      .on('disconnect', () => this.platform.log.debug('disconnnect'))
      .on('connected', () => this.platform.log.debug('connected'));

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Govee')
      .setCharacteristic(this.platform.Characteristic.Model, 'H6179')
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, '1.00.08')
      .setCharacteristic(this.platform.Characteristic.HardwareRevision, '1.00.01');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this))
      .onGet(this.getBrightness.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.Hue)
      .onSet(this.setHue.bind(this))
      .onGet(this.getHue.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.ColorTemperature)
      .onSet(this.setColorTemperature.bind(this))
      .onGet(this.getColorTemperature.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.Saturation)
      .onSet(this.setSaturation.bind(this))
      .onGet(this.getSaturation.bind(this));
  }

  async setOn(value: CharacteristicValue) {
    this.exampleStates.On = value as boolean;

    this.platform.log.debug('Set Characteristic On ->', value);

    this.led.setState(this.exampleStates.On);
  }

  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const isOn = this.exampleStates.On;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return isOn;
  }

  async setBrightness(value: CharacteristicValue) {
    this.exampleStates.Brightness = value as number;

    this.platform.log.debug('Set Characteristic Brightness -> ', value);

    this.led.setBrightness(this.exampleStates.Brightness);
  }

  async getBrightness(): Promise<CharacteristicValue> {
    const brightness = this.exampleStates.Brightness;

    this.platform.log.debug('Get Characteristic Brightness ->', brightness);

    return brightness;
  }

  async setHue(value: CharacteristicValue) {
    this.exampleStates.Hue = value as number;

    this.platform.log.debug('Set Characteristic Hue -> ', value);

    this.led.setColor(this.exampleStates.Hue, this.exampleStates.Saturation)
  }

  async getHue(): Promise<CharacteristicValue> {
    const hue = this.exampleStates.Hue;

    this.platform.log.debug('Get Characteristic Hue ->', hue);

    return hue;
  }

  async setColorTemperature(value: CharacteristicValue) {
    this.exampleStates.ColorTemperature = value as number;

    this.platform.log.debug('Set Characteristic ColorTemperature -> ', value);
  }

  async getColorTemperature(): Promise<CharacteristicValue> {
    const colorTemperature = this.exampleStates.ColorTemperature;

    this.platform.log.debug('Get Characteristic ColorTemperature ->', colorTemperature);

    return colorTemperature;
  }

  async setSaturation(value: CharacteristicValue) {
    this.exampleStates.Saturation = value as number;

    this.platform.log.debug('Set Characteristic Saturation -> ', value);

    this.led.setColor(this.exampleStates.Hue, this.exampleStates.Saturation)
  }

  async getSaturation(): Promise<CharacteristicValue> {
    const saturation = this.exampleStates.Saturation;

    this.platform.log.debug('Get Characteristic Saturation ->', saturation);

    return saturation;
  }
}
