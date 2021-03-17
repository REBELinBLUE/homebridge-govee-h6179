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
    const { address, name } = this.config.devices[0];

    callback([
      new GoveeAccessory(this, name, address),
    ]);
  }
}
