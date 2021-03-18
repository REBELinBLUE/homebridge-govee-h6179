export interface AccessoryState {
  On: boolean;
  Brightness: number;
  Saturation: number;
  Hue: number;
  ColorTemperature: number;
  Connected: boolean;
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
 * @property {number} r - Red, between 0 and 255.
 * @property {number} g - Green, between 0 and 255.
 * @property {number} b - Blue, between 0 and 255.
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * [sRGB](https://en.wikipedia.org/wiki/SRGB) colour in
 *  [HSV](https://en.wikipedia.org/wiki/HSL_and_HSV).
 * @property {number} h - Hue, between 0˚ and 360˚.
 * @property {number} s - Saturation, between 0% and 100%.
 * @property {number} v - Value, between 0% and 100%.
 */
export interface HSV {
  h: number;
  s: number;
  v: number;
}