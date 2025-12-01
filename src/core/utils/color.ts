/**
 * Color Utilities
 * Functions for color manipulation and generation
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSLA extends HSL {
  a: number;
}

// ============================================
// PARSING
// ============================================

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  
  if (!result) {
    // Try 3-digit hex
    const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (!shortResult) return null;
    
    return {
      r: parseInt(shortResult[1] + shortResult[1], 16),
      g: parseInt(shortResult[2] + shortResult[2], 16),
      b: parseInt(shortResult[3] + shortResult[3], 16),
    };
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Parse RGB string to RGB object
 */
export function parseRgb(rgbString: string): RGB | null {
  const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
  };
}

/**
 * Parse any color string to RGB
 */
export function parseColor(color: string): RGB | null {
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }
  if (color.startsWith('rgb')) {
    return parseRgb(color);
  }
  return null;
}

// ============================================
// CONVERSION
// ============================================

/**
 * Convert RGB to hex
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb) : null;
}

/**
 * Convert HSL to hex
 */
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

// ============================================
// MANIPULATION
// ============================================

/**
 * Lighten a color
 */
export function lighten(color: string, amount: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;

  const hsl = rgbToHsl(rgb);
  hsl.l = Math.min(100, hsl.l + amount);
  return hslToHex(hsl);
}

/**
 * Darken a color
 */
export function darken(color: string, amount: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;

  const hsl = rgbToHsl(rgb);
  hsl.l = Math.max(0, hsl.l - amount);
  return hslToHex(hsl);
}

/**
 * Saturate a color
 */
export function saturate(color: string, amount: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;

  const hsl = rgbToHsl(rgb);
  hsl.s = Math.min(100, hsl.s + amount);
  return hslToHex(hsl);
}

/**
 * Desaturate a color
 */
export function desaturate(color: string, amount: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;

  const hsl = rgbToHsl(rgb);
  hsl.s = Math.max(0, hsl.s - amount);
  return hslToHex(hsl);
}

/**
 * Adjust hue of a color
 */
export function adjustHue(color: string, degrees: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;

  const hsl = rgbToHsl(rgb);
  hsl.h = (hsl.h + degrees) % 360;
  if (hsl.h < 0) hsl.h += 360;
  return hslToHex(hsl);
}

/**
 * Get complementary color
 */
export function getComplementary(color: string): string {
  return adjustHue(color, 180);
}

/**
 * Mix two colors
 */
export function mix(color1: string, color2: string, weight = 0.5): string {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  
  if (!rgb1 || !rgb2) return color1;

  return rgbToHex({
    r: Math.round(rgb1.r * (1 - weight) + rgb2.r * weight),
    g: Math.round(rgb1.g * (1 - weight) + rgb2.g * weight),
    b: Math.round(rgb1.b * (1 - weight) + rgb2.b * weight),
  });
}

/**
 * Get color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;

  const alpha = Math.max(0, Math.min(1, opacity));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

// ============================================
// ANALYSIS
// ============================================

/**
 * Calculate relative luminance
 */
export function getLuminance(color: string): number {
  const rgb = parseColor(color);
  if (!rgb) return 0;

  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standard
 */
export function meetsContrastAA(
  foreground: string,
  background: string,
  largeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast meets WCAG AAA standard
 */
export function meetsContrastAAA(
  foreground: string,
  background: string,
  largeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Determine if color is light or dark
 */
export function isLight(color: string): boolean {
  return getLuminance(color) > 0.5;
}

/**
 * Determine if color is dark
 */
export function isDark(color: string): boolean {
  return !isLight(color);
}

/**
 * Get readable text color for a background
 */
export function getTextColor(backgroundColor: string): string {
  return isLight(backgroundColor) ? '#000000' : '#ffffff';
}

// ============================================
// GENERATION
// ============================================

/**
 * Generate a color scale
 */
export function generateColorScale(
  baseColor: string,
  steps = 10
): string[] {
  const rgb = parseColor(baseColor);
  if (!rgb) return [baseColor];

  const hsl = rgbToHsl(rgb);
  const scale: string[] = [];

  for (let i = 0; i < steps; i++) {
    const lightness = 95 - (i * 90) / (steps - 1);
    scale.push(hslToHex({ ...hsl, l: lightness }));
  }

  return scale;
}

/**
 * Generate triadic colors
 */
export function getTriadic(color: string): [string, string, string] {
  return [
    color,
    adjustHue(color, 120),
    adjustHue(color, 240),
  ];
}

/**
 * Generate analogous colors
 */
export function getAnalogous(color: string, angle = 30): [string, string, string] {
  return [
    adjustHue(color, -angle),
    color,
    adjustHue(color, angle),
  ];
}

/**
 * Generate split complementary colors
 */
export function getSplitComplementary(color: string): [string, string, string] {
  return [
    color,
    adjustHue(color, 150),
    adjustHue(color, 210),
  ];
}

/**
 * Generate random color from a predefined palette
 */
export function getRandomFromPalette(palette: string[]): string {
  return palette[Math.floor(Math.random() * palette.length)];
}

/**
 * Default color palette for projects/categories
 */
export const DEFAULT_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

/**
 * Get color by index (cycles through palette)
 */
export function getColorByIndex(index: number, palette = DEFAULT_PALETTE): string {
  return palette[index % palette.length];
}

