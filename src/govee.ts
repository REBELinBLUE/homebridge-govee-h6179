// @ts-nocheck

import { EventEmitter } from 'events';
import homebridgeLib from 'homebridge-lib';

const {
    xyToHsv, hsvToRgb, ctToXy
} = homebridgeLib.Colour;

export class Govee extends EventEmitter {
  public _noble: any;
  public _addr: any;
  public _disconect_called: any;
  public _pingTimer: any;
  public controller: any;
  public on: any;
  public _dev: any;
  public emit: any;

  //static UUID_CONTROL_CHARACTERISTIC = '00010203-0405-0607-0809-0a0b0c0d2b11';
  static UUID_CONTROL_CHARACTERISTIC = '000102030405060708090a0b0c0d2b11';

  static Ping = Buffer.from([
    0xAA, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xAB
  ]);

  static SHADES_OF_WHITE = [
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
        '#d6e1ff'
    ]

  static LedCommand = {
    POWER: 0x01,
    BRIGHTNESS: 0x04,
    COLOR: 0x05,
  };

  static LedMode = {
    MANUAL: 0x02,
    MICROPHONE: 0x06,
    SCENES: 0x05,
  };

  constructor(address, noble?) {
    super();
    const self = this; // eslint-disable-line

    this._noble = noble;
    this._addr = address;
    this._disconect_called = false;
    this._ping = this._ping.bind(this);
    this._pingTimer;

    console.log(self._addr.toLowerCase());
    console.log(Govee.UUID_CONTROL_CHARACTERISTIC.replace('-', '').toLowerCase());

    this._noble.on('discover', (d) => {
      console.log(d.address.toLowerCase() + ' ' + d.advertisement.localName)
      if (d.address.toLowerCase() !== self._addr.toLowerCase()) {
        return;
      }

      self._noble.stopScanning();
      self.emit('located');

      d.on('disconnect', async () => {
        self.emit('ble:disconnect');
        self.controller = undefined;
        // console.log('disconnected device');

        if (self._disconect_called) {
          self.emit('disconnect');
        } else {
          await self.reconnect();
        }
      });

      d.connect(() => {
        self._dev = d;

        d.discoverSomeServicesAndCharacteristics(
          [],
          [],
          (_, service, chars) => {
            // console.log(service, chars)
            for (const char of chars) {
              console.log (char.uuid.replace('-', '').toLowerCase());
              if (char.uuid.replace('-', '').toLowerCase() === Govee.UUID_CONTROL_CHARACTERISTIC.replace('-', '').toLowerCase()) {
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
      self._noble.startScanning([], false);
    });
  }

  reconnect() {
    const self = this; // eslint-disable-line

    // console.log('reconnecting')
    return new Promise((res) => {
      self._dev.connect(() => {
        self._dev.discoverSomeServicesAndCharacteristics(
          [],
          [],
          (_, service, chars) => {
            // console.log(service, chars)
            for (const char of chars) {
              console.log(char.uuid.replace('-', '').toLowerCase());
              if (char.uuid.replace('-', '').toLowerCase() === Govee.UUID_CONTROL_CHARACTERISTIC.replace('-', '').toLowerCase()) {
                // console.log('reconnected')
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

  disconnect() {
    this._disconect_called = true;
    const self = this; // eslint-disable-line

    return new Promise((res) => {
      if (self._dev) {
        // console.log(self._dev)
        // console.log("disconnecting device");
        self._dev.disconnect(() => {
          // console.log("disconnected.");
          clearTimeout(self._pingTimer);
          res();
        });
      } else {
        res();
      }
    });
  }

  _ping() {
    if (!this.controller) {
      throw new Error('Not connected');
    }

    this.controller.write(Govee.Ping, true);
  }

  _send(cmd, payload) {
    if (!this.controller) {
      throw new Error('Not connected');
    }

    cmd = cmd & 0xff;

    const preChecksum_frame = Buffer.concat([
      Buffer.from([0x33, cmd].flat()),
      Buffer.from([payload].flat()),
    ]);

    const preChecksum_padding_frame = Buffer.concat([
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
        Buffer.from([checksum & 0xff]),
      ]),
      true,
    );
  }

  setState(state) {
    this._send(Govee.LedCommand.POWER, state ? 0x1 : 0x0);
  }

  setBrightness(value) {
    const brightness = Number(value) / 100;

    if (Number.isNaN(brightness) || brightness > 1 || brightness < 0) {
      throw new Error('Brightness if not a valid percent');
    }

    this._send(Govee.LedCommand.BRIGHTNESS, Math.floor(brightness * 0xFF));
  }

  setColor(hue, sat) {
    const { r, g, b } = hsvToRgb(hue, sat)

    this._send(Govee.LedCommand.COLOR, [
      Govee.LedMode.MANUAL,
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ]);
  }

  setTemperature(value) {
      //
      // if (Number.isNaN(value) || value > 1 || value < -1) {
      //     throw new Error('Temperature if not a valid');
      // }
      //
      // const foo = (value+1) / 2
      // const index = Math.round(foo * (Govee.SHADES_OF_WHITE.length-1))
      // let  white = Govee.SHADES_OF_WHITE[index];
      //
      // white = Govee.SHADES_OF_WHITE[Math.floor(Math.random() * Govee.SHADES_OF_WHITE.length)]
      //
      //
      // const bits = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(white);
      //
      //       const rgb = [
      //     parseInt(bits[1], 16),
      //         parseInt(bits[2], 16),
      //         parseInt(bits[3], 16)
      //     ]

      const xy = ctToXy(value);
      const { h, s } = xyToHsv(xy);
      const { r, g, b} = hsvToRgb(h, s);


      this._send(Govee.LedCommand.COLOR, [
          Govee.LedMode.MANUAL,
          255,
          255,
          255,
          1,
          r,
          g,
          b
      ]);
  }
}
