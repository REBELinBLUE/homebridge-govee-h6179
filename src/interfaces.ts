export interface AccessoryState {
  On: boolean;
  Brightness: number;
  ColorTemperature: number;
  Connected: boolean;
  Color: HSV;
}

export interface LedCommands {
  POWER: number;
  BRIGHTNESS: number;
  COLOR: number;
}

export interface LedModes {
  MANUAL: number;
  MICROPHONE: number;
  SCENES: number;
}

export interface DeviceConfig {
  name: string;
  address: string;
}

/**
 * [sRGB](https://en.wikipedia.org/wiki/SRGB) colour in
 *  [RGB color model](https://en.wikipedia.org/wiki/RGB_color_model).
 * @property {number} Red - between 0 and 255.
 * @property {number} Green - between 0 and 255.
 * @property {number} Blue - between 0 and 255.
 */
export interface RGB {
  Red: number;
  Green: number;
  Blue: number;
}

/**
 * [sRGB](https://en.wikipedia.org/wiki/SRGB) colour in
 *  [HSV](https://en.wikipedia.org/wiki/HSL_and_HSV).
 * @property {number} Hue - between 0˚ and 360˚.
 * @property {number} Saturation - between 0% and 100%.
 * @property {number} Value - between 0% and 100%.
 */
export interface HSV {
  Hue: number;
  Saturation: number;
  Value: number;
}
