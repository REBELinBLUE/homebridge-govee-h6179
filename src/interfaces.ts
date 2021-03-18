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