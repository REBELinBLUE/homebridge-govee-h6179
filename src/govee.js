const color = require("./color");

class BluetoothLED extends require("events").EventEmitter {
  static UUID_CONTROL_CHARACTERISTIC = "00010203-0405-0607-0809-0a0b0c0d2b11";

  static Ping = Buffer.from([0xAA, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xAB]);

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

	waitForEvent(event) {
	  var self = this;
	  return new Promise((res) => self.on(event, res))
	}

	constructor(address, noble) {
		super();
		var self = this;

		this._noble = noble;
		this._addr = address;
		this._disconect_called = false;
		this._ping = this._ping.bind(this);
		this._pingTimer;

		this._noble.on("discover", (d) => {
			if (d.address.toLowerCase() != self._addr.toLowerCase()) {
			  return;
      }

			self._noble.stopScanning();
			self.emit("located");

			d.on('disconnect', async () =>{
				self.emit('ble:disconnect')
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
						for (let char of chars) {
							if (char.uuid.replace('-', '') == BluetoothLED.UUID_CONTROL_CHARACTERISTIC.replace('-', '')) {
								setTimeout(() => self.emit("connected"), 500);
								self._pingTimer = setInterval(self._ping, 2000);
								self.controller = char;
							}
						}
					}
				);
			});
		});

		process.nextTick(() => {
			self._noble.startScanning([], false);
		});
	}

	reconnect() {
		var self = this;
		// console.log('reconnecting')
		return new Promise((res) => {
			self._dev.connect(() => {
				self._dev.discoverSomeServicesAndCharacteristics(
					[],
					[],
					(_, service, chars) => {
						// console.log(service, chars)
						for (let char of chars) {
							if (char.uuid.replace('-', '') == BluetoothLED.UUID_CONTROL_CHARACTERISTIC.replace('-', '')) {
								// console.log('reconnected')
								setTimeout(() => self.emit("reconnected"), 500);
								self.controller = char;
								res();
							}
						}
					}
				);
			})
		})
	}

	disconnect() {
		this._disconect_called = true;
		var self = this;

		return new Promise((res) => {
			if (self._dev) {
				// console.log(self._dev)
				// console.log("disconnecting device");
				self._dev.disconnect(() => {
					// console.log("disconnected.");
					clearTimeout(self._pingTimer);
					res();
				});
			} else res();
		});
	}

	_ping() {
		if (!this.controller) {
		  throw new Error("Not connected");
    }

		this.controller.write(BluetoothLED.Ping, true);
	}
	_send(cmd, payload) {
		if (!this.controller) {
		  throw new Error("Not connected");
    }

		cmd = cmd & 0xff;

		let preChecksum_frame = Buffer.concat([
			Buffer.from([0x33, cmd].flat()),
			Buffer.from([payload].flat()),
		]);

		let preChecksum_padding_frame = Buffer.concat([
			preChecksum_frame,
			Buffer.from(new Array(19 - preChecksum_frame.length).fill(0)),
		]);

		let checksum = 0;

		for (let i of preChecksum_padding_frame) {
		  checksum ^= i;
    }

		this.controller.write(
			Buffer.concat([
				preChecksum_padding_frame,
				Buffer.from([checksum & 0xff]),
			]),
			true
		);
	}

	_getColor(name) {
		var _parsed = new color(name);
		return [_parsed.r, _parsed.g, _parsed.b];
	}

	setState(state) {
		this._send(BluetoothLED.LedCommand.POWER, state ? 0x1 : 0x0);
	}

	setBrightness(value) {
		var value = Number(value) / 100;
		if (Number.isNaN(value) || value > 1 || value < 0) {
		  throw new Error('Brightness if not a valid percent');
    }

		this._send(BluetoothLED.LedCommand.BRIGHTNESS, Math.floor(value* 0xFF))
	}

	setColor(color) {
		this._send(BluetoothLED.LedCommand.COLOR, [
			BluetoothLED.LedMode.MANUAL,
			...this._getColor(color),
		]);
	}
}

module.exports = BluetoothLED;

