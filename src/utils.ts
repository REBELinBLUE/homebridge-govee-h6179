import { RGB } from './interfaces';

const normaliseUuid = (str: string): string => str.replace(/-/g, '').toLowerCase();
export function normalisedUuidCompare(uuid1: string, uuid2: string): boolean {
  return normaliseUuid(uuid1) === normaliseUuid(uuid2);
}

const normaliseMac = (str: string): string => str.replace(/:/g, '').toLowerCase();
export function normalisedMacCompare(mac1: string, mac2: string): boolean {
  return normaliseMac(mac1) === normaliseMac(mac2);
}

const to255 = (rgb: RGB): RGB => ({
  r: Math.round(rgb.r * 255),
  g: Math.round(rgb.g * 255),
  b: Math.round(rgb.b * 255),
});

/**
 * Convert [Hex Triplet](https://en.wikipedia.org/wiki/Web_colors#Hex_triplet) to {@link RGB}.
 *
 * @param {string} hex - Hex triplet string, for example #00ff00
 * @return {RGB} The corresponding {@link RGB} value.
 */
export function hexToRgb(hex: string): RGB {
  const bits = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(hex);
  if (!bits || bits.length !== 3) {
    throw new Error('Not a valid hex code');
  }

  return to255({
    r: parseInt(bits[0], 16),
    g: parseInt(bits[1], 16),
    b: parseInt(bits[2], 16),
  });
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

  return to255({
    r: red,
    g: green,
    b: blue,
  });
}