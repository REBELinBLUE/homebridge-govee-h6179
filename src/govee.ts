import { EventEmitter } from 'events';
import { Characteristic, Peripheral, Service } from '@abandonware/noble';
import homebridgeLib from 'homebridge-lib';

import { LedCommands, LedModes } from './interfaces';
import Timeout = NodeJS.Timeout;

const { hsvToRgb } = homebridgeLib.Colour;

function normalisedCompare(uuid1: string, uuid2: string): boolean {
  const normalise = (str: string): string => str.replace('-', '').toLowerCase();

  return normalise(uuid1) === normalise(uuid2);
}

export class Govee extends EventEmitter {
  public disconnectCalled = false;
  public _pingTimer: Timeout | undefined;
  public controller: Characteristic | undefined;
  public device: Peripheral | undefined;

  //static UUID_CONTROL_CHARACTERISTIC = '00010203-0405-0607-0809-0a0b0c0d2b11';
  static UUID_CONTROL_CHARACTERISTIC = '000102030405060708090a0b0c0d2b11';

  static Ping: Buffer = Buffer.from([
    0xAA, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xAB,
  ]);

  static SHADES_OF_WHITE: string[] = [
    '#ff8d0b',
    '#ff8912',
    '#ff921d',
    '#ff8e21',
    '#ff9829',
    '#ff932c',
    '#ff9d33',
    '#ff9836',
    '#ffa23c',
    '#ff9d3f',
    '#ffa645',
    '#ffa148',
    '#ffaa4d',
    '#ffa54f',
    '#ffae54',
    '#ffa957',
    '#ffb25b',
    '#ffad5e',
    '#ffb662',
    '#ffb165',
    '#ffb969',
    '#ffb46b',
    '#ffbd6f',
    '#ffb872',
    '#ffc076',
    '#ffbb78',
    '#ffc37c',
    '#ffbe7e',
    '#ffc682',
    '#ffc184',
    '#ffc987',
    '#ffc489',
    '#ffcb8d',
    '#ffc78f',
    '#ffce92',
    '#ffc994',
    '#ffd097',
    '#ffcc99',
    '#ffd39c',
    '#ffce9f',
    '#ffd5a1',
    '#ffd1a3',
    '#ffd7a6',
    '#ffd3a8',
    '#ffd9ab',
    '#ffd5ad',
    '#ffdbaf',
    '#ffd7b1',
    '#ffddb4',
    '#ffd9b6',
    '#ffdfb8',
    '#ffdbba',
    '#ffe1bc',
    '#ffddbe',
    '#ffe2c0',
    '#ffdfc2',
    '#ffe4c4',
    '#ffe1c6',
    '#ffe5c8',
    '#ffe3ca',
    '#ffe7cc',
    '#ffe4ce',
    '#ffe8d0',
    '#ffe6d2',
    '#ffead3',
    '#ffe8d5',
    '#ffebd7',
    '#ffe9d9',
    '#ffedda',
    '#ffebdc',
    '#ffeede',
    '#ffece0',
    '#ffefe1',
    '#ffeee3',
    '#fff0e4',
    '#ffefe6',
    '#fff1e7',
    '#fff0e9',
    '#fff3ea',
    '#fff2ec',
    '#fff4ed',
    '#fff3ef',
    '#fff5f0',
    '#fff4f2',
    '#fff6f3',
    '#fff5f5',
    '#fff7f7',
    '#fff6f8',
    '#fff8f8',
    '#fff8fb',
    '#fff9fb',
    '#fff9fd',
    '#fff9fd',
    '#fef9ff',
    '#fefaff',
    '#fcf7ff',
    '#fcf8ff',
    '#f9f6ff',
    '#faf7ff',
    '#f7f5ff',
    '#f7f5ff',
    '#f5f3ff',
    '#f5f4ff',
    '#f3f2ff',
    '#f3f3ff',
    '#f0f1ff',
    '#f1f1ff',
    '#eff0ff',
    '#eff0ff',
    '#edefff',
    '#eeefff',
    '#ebeeff',
    '#eceeff',
    '#e9edff',
    '#eaedff',
    '#e7ecff',
    '#e9ecff',
    '#e6ebff',
    '#e7eaff',
    '#e4eaff',
    '#e5e9ff',
    '#e3e9ff',
    '#e4e9ff',
    '#e1e8ff',
    '#e3e8ff',
    '#e0e7ff',
    '#e1e7ff',
    '#dee6ff',
    '#e0e6ff',
    '#dde6ff',
    '#dfe5ff',
    '#dce5ff',
    '#dde4ff',
    '#dae4ff',
    '#dce3ff',
    '#d9e3ff',
    '#dbe2ff',
    '#d8e3ff',
    '#dae2ff',
    '#d7e2ff',
    '#d9e1ff',
    '#d6e1ff',
  ];

  static LedCommand: LedCommands = {
    POWER: 0x01,
    BRIGHTNESS: 0x04,
    COLOR: 0x05,
  };

  static LedMode: LedModes = {
    MANUAL: 0x02,
    MICROPHONE: 0x06,
    SCENES: 0x05,
  };

  constructor(
    public readonly address: string,
    public readonly noble: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {
    super();

    const self = this; // eslint-disable-line

    this.disconnectCalled = false;
    this._ping = this._ping.bind(this);
    // this._pingTimer = null;

    this.noble.on('discover', (device: Peripheral) => {
      if (device.address.toLowerCase() !== self.address.toLowerCase()) {
        return;
      }

      self.noble.stopScanning();
      self.emit('located');

      device.on('disconnect', async () => {
        self.emit('ble:disconnect');
        self.controller = undefined;

        if (self.disconnectCalled) {
          self.emit('disconnect');
        } else {
          await self.reconnect();
        }
      });

      device.connect(() => {
        self.device = device;

        device.discoverSomeServicesAndCharacteristics(
          [],
          [],
          (_: string, service: Service[], chars: Characteristic[]) => {
            for (const char of chars) {
              if (normalisedCompare(char.uuid, Govee.UUID_CONTROL_CHARACTERISTIC)) {
                setTimeout(() => self.emit('connected'), 500);

                self._pingTimer = setInterval(self._ping, 2000);
                self.controller = char;
              }
            }
          },
        );
      });
    });

    process.nextTick(() => {
      self.noble.startScanning([], false);
    });
  }

  reconnect(): Promise<void> {
    const self = this; // eslint-disable-line

    return new Promise((res) => {
      self.device?.connect(() => {
        self.device?.discoverSomeServicesAndCharacteristics(
          [],
          [],
          (_: string, service: Service[], chars: Characteristic[]) => {
            for (const char of chars) {
              if (normalisedCompare(char.uuid, Govee.UUID_CONTROL_CHARACTERISTIC)) {
                setTimeout(() => self.emit('reconnected'), 500);

                self.controller = char;
                res();
              }
            }
          },
        );
      });
    });
  }

  disconnect(): Promise<void> {
    this.disconnectCalled = true;
    const self = this; // eslint-disable-line

    return new Promise((res) => {
      if (self.device) {
        self.device.disconnect(() => {
          if (self._pingTimer) {
            clearTimeout(self._pingTimer);
          }

          res();
        });
      } else {
        res();
      }
    });
  }

  _ping(): void {
    if (!this.controller) {
      throw new Error('Not connected');
    }

    this.controller.write(Govee.Ping, true);
  }

  _send(command: number, payload: number | number[]): void {
    if (!this.controller) {
      throw new Error('Not connected');
    }

    const cmd = command & 0xFF;

    const preChecksum_frame = Buffer.concat([
      Buffer.from([0x33, cmd].flat()),
      Buffer.from([payload].flat()),
    ]);

    const preChecksum_padding_frame: Buffer = Buffer.concat([
      preChecksum_frame,
      Buffer.from(new Array(19 - preChecksum_frame.length).fill(0)),
    ]);

    let checksum = 0;
    for (const i of preChecksum_padding_frame) {
      checksum ^= i;
    }

    this.controller.write(
      Buffer.concat([
        preChecksum_padding_frame,
        Buffer.from([checksum & 0xFF]),
      ]),
      true,
    );
  }

  setState(state: boolean): void {
    this._send(Govee.LedCommand.POWER, state ? 0x1 : 0x0);
  }

  setBrightness(value: number): void {
    const brightness = Number(value) / 100;

    if (Number.isNaN(brightness) || brightness > 1 || brightness < 0) {
      throw new Error('Brightness if not a valid percent');
    }

    this._send(Govee.LedCommand.BRIGHTNESS, Math.floor(brightness * 0xFF));
  }

  setColor(hue: number, sat: number): void {
    const { r, g, b } = hsvToRgb(hue, sat);

    this._send(Govee.LedCommand.COLOR, [
      Govee.LedMode.MANUAL,
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255),
      0x00,
      0x00,
      0x00,
      0x00,
    ]);
  }

  setTemperature(value: number): void {
    // Supply a value between -1 (warm) and 1 (cold)
    // if (Number.isNaN(value) || value > 1 || value < -1) {
    //     throw new Error('Temperature if not a valid');
    // }
    //
    const foo = (value+1) / 2;
    const index = Math.round(foo * (Govee.SHADES_OF_WHITE.length-1));
    let white = Govee.SHADES_OF_WHITE[index];

    white = Govee.SHADES_OF_WHITE[Math.floor(Math.random() * Govee.SHADES_OF_WHITE.length)];

    const bits = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(white);
    if (!bits || bits.length !== 3) {
      return;
    }

    this._send(Govee.LedCommand.COLOR, [
      Govee.LedMode.MANUAL,
      0xFF,
      0xFF,
      0xFF,
      0x01,
      Math.round(parseInt(bits[0], 16) * 255),
      Math.round(parseInt(bits[1], 16) * 255),
      Math.round(parseInt(bits[2], 16) * 255),
    ]);
  }
}
