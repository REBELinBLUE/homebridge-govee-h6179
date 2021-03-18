import { createMock } from 'ts-auto-mock';
import { API, Logger, PlatformConfig } from 'homebridge';
import { GoveeHomebridgePlatform } from '../src/platform';

describe('GoveeHomebridgePlatform', () => {
it('throws an error if devices is not set', () => {
    const logger: Logger = createMock<Logger>();
    const config: PlatformConfig = createMock<PlatformConfig>();
    const api: API = createMock<API>();

    expect('foo').toBe('foo');
    // const platform = new GoveeHomebridgePlatform(logger, config, api);
  })
})
