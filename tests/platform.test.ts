import { createMock } from 'ts-auto-mock';
import { API, Logging, PlatformConfig } from 'homebridge';
import { GoveeHomebridgePlatform } from '../src/platform';

describe('GoveeHomebridgePlatform', () => {
  it('throws an error if devices is not set', () => {
    const logger: Logging = createMock<Logging>();
    const config: PlatformConfig = createMock<PlatformConfig>();
    const api: API = createMock<API>();

    //const platform = new GoveeHomebridgePlatform(logger, config, api);
  })
})
