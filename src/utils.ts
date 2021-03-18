import { RGB } from './interfaces';

const normaliseUuid = (str: string): string => str.replace(/-/g, '').toLowerCase();
export function normalisedUuidCompare(uuid1: string, uuid2: string): boolean {
  return normaliseUuid(uuid1) === normaliseUuid(uuid2);
}

const normaliseMac = (str: string): string => str.replace(/:/g, '').toLowerCase();
export function normalisedMacCompare(mac1: string, mac2: string): boolean {
  return normaliseMac(mac1) === normaliseMac(mac2);
}

/**
 * Convert [Hex Triplet](https://en.wikipedia.org/wiki/Web_colors#Hex_triplet) to {@link RGB}.
 *
 * @param {string} hex - Hex triplet string, for example #00ff00
 * @return {RGB} The corresponding {@link RGB} value.
 */
export function hexToRgb(hex: string): RGB {
  const bits = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(hex);
  if (!bits || bits.length !== 4) {
    throw new Error('Not a valid hex code');
  }

  return {
    Red: parseInt(bits[1], 16),
    Green: parseInt(bits[2], 16),
    Blue: parseInt(bits[3], 16),
  };
}

/**
 * Convert {@link HSV} to {@link  RGB}.
 *
 * See [HSV_to_RGB](https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB).
 * @param {integer} hue - Hue, between 0˚ and 360˚.
 * @param {integer} saturation - Saturation, between 0% and 100%.
 * @param {integer} [value=100] - Value, between 0% and 100%.
 * @return {RGB} The corresponding {@link RGB} value.
 */
export function hsvToRgb (hue: number, saturation: number, value = 100): RGB {
  // FIXME: Add validation

  hue /= 60.0;
  saturation /= 100.0;
  value /= 100.0;

  const chroma = value * saturation;
  const match = value - chroma;

  let x = (hue % 2) - 1.0;

  if (x < 0) {
    x = -x;
  }

  x = chroma * (1.0 - x);

  let red = 0;
  let green = 0;
  let blue = 0;

  switch (Math.floor(hue) % 6) {
    case 0:
      red = chroma + match;
      green = x + match;
      blue = match;
      break;
    case 1:
      red = x + match;
      green = chroma + match;
      blue = match;
      break;
    case 2:
      red = match;
      green = chroma + match;
      blue = x + match;
      break;
    case 3:
      red = match;
      green = x + match;
      blue = chroma + match;
      break;
    case 4:
      red = x + match;
      green = match;
      blue = chroma + match;
      break;
    case 5:
      red = chroma + match;
      green = match;
      blue = x + match;
      break;
  }

  return {
    Red: Math.round(red * 255),
    Green: Math.round(green * 255),
    Blue: Math.round(blue * 255),
  };
}

export function hs2rgb(h: number, s: number): RGB{
  /*
    Credit:
    https://github.com/WickyNilliams/pure-color
  */
  h = h / 60;
  s = s / 100;
  const f = h - Math.floor(h);
  const p = 255 * (1 - s);
  const q = 255 * (1 - (s * f));
  const t = 255 * (1 - (s * (1 - f)));
  let rgb;
  switch (Math.floor(h) % 6) {
    case 0:
      rgb = [255, t, p];
      break;
    case 1:
      rgb = [q, 255, p];
      break;
    case 2:
      rgb = [p, 255, t];
      break;
    case 3:
      rgb = [p, q, 255];
      break;
    case 4:
      rgb = [t, p, 255];
      break;
    case 5:
      rgb = [255, p, q];
      break;
    default:
      rgb = [255, 255, 255];
  }

  if (rgb[0] === 255) {
    rgb[1] *= 0.8;
    rgb[2] *= 0.8;
    if (rgb[1] <= 25 && rgb[2] <= 25) {
      rgb[1] = 0;
      rgb[2] = 0;
    }
  }
  return {
    Red: Math.round(rgb[0]),
    Green: Math.round(rgb[1]),
    Blue: Math.round(rgb[2]),
  };
}
