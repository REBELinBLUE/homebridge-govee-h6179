import {
  API, StaticPlatformPlugin, PlatformConfig, AccessoryPlugin,
  Service, Characteristic, Logger,
} from 'homebridge';

import { GoveeAccessory } from './accessory';
import { DeviceConfig } from './interfaces';

export class GoveeHomebridgePlatform implements StaticPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  constructor(public readonly log: Logger, public readonly config: PlatformConfig, public readonly api: API) {
    this.log.debug('Finished initializing platform:', this.config.name);
  }

  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
    const accessories: GoveeAccessory[] = [];

    if (!this.config.devices || !Array.isArray(this.config.devices)) {
      throw new Error('Missing mandatory config "devices"');
    }

    this.config.devices.forEach((device: DeviceConfig) => {
      if (!device.name) {
        throw new Error('Missing mandatory device config "name"');
      }

      if (!device.address) {
        throw new Error('Missing mandatory device config "address"');
      }

      const { name, address } = device;

      accessories.push(new GoveeAccessory(this, name, address));
    });

    callback(accessories);
  }
}
