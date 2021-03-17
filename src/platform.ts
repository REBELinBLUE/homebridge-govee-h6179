import {
  API, StaticPlatformPlugin, PlatformConfig, AccessoryPlugin,
  Service, Characteristic, Logger,
} from 'homebridge';

import { GoveeAccessory } from './accessory';

export class GoveeHomebridgePlatform implements StaticPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);
  }

  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
    const accessories: GoveeAccessory[] = [];

    if (!this.config.devices || !Array.isArray(this.config.devices)) {
      this.config.devices = [];
    }

    for (let i = 0; i < this.config.devices.length; i++) {
      const { name, address } = this.config.devices[i];

      accessories.push(new GoveeAccessory(this, name, address));
    }

    callback(accessories);
  }
}
