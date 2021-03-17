# homebridge-govee-h6179

[![NPM version](https://badge.fury.io/js/homebridge-govee-h6179.svg)](https://badge.fury.io/js/homebridge-govee-h6179)

[Homebridge](https://github.com/nfarina/homebridge) plugin for exposing [Govee H6179 LED TV Backlights](https://www.govee.com/products/144/led-tv-backlights) as a [HomeKit](https://www.apple.com/ios/home/) accessory.

## Installation

Make sure your system matches the prerequisites. You need to have a C compiler and [Node.js](https://nodejs.org/) newer or equal to version 10.0.0 installed.

[Noble](https://github.com/abandonware/noble) is BLE central module library for [Node.js](https://nodejs.org/) used to discover and read values from the Light Strip.

These libraries and their dependencies are required by the [Noble](https://www.npmjs.com/package/@abandonware/noble) library and provide access to the kernel Bluetooth subsystem:

```sh
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
```

For more detailed information and descriptions for other platforms please see the [Noble documentation](https://github.com/abandonware/noble#readme).

### Install homebridge and this plugin
```
[sudo] npm install -g --unsafe-perm @abandonware/noble
[sudo] npm install -g --unsafe-perm homebridge
[sudo] npm install -g homebridge-govee-h6179
```

**Note:** depending on your platform you might need to run `npm install -g`  with root privileges.

See the [Homebridge documentation](https://github.com/nfarina/homebridge#readme) for more information.

If you are running Homebridge as another user than `root`  (you should) then some additional configuration needs to be made to allow [Node.js](https://nodejs.org/) access to the kernel Bluetooth subsystem without root privileges.

You'll need to grant the node binary cap_net_raw privileges:

```
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```

Please see the [Noble documentation](https://github.com/abandonware/noble#running-without-rootsudo) for more details.

### Configuration
Homebridge is setup via `config.json` file sitting in the `~/.homebridge/` directory.

## License

This work is licensed under the MIT license. See [license](LICENSE) for more details.

## Credits

Govee Client based on [nanoguy0/govee-led-client](https://gitlab.com/nanoguy0/govee-led-client) by Ben Bartrim.
