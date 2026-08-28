export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export type GaugeStyle = "SOLID" | "STRIPED" | "SEGMENTED" | "GLOW";

export interface ThemeColors {
  bgDark: RGBAColor;
  bgPanel: RGBAColor;
  bgHeader: RGBAColor;
  bgSlot: RGBAColor;
  bgSlotOccupied: RGBAColor;
  bgSlotSelected: RGBAColor;
  bgButton: RGBAColor;
  bgButtonDisabled: RGBAColor;

  borderNormal: RGBAColor;
  borderSelected: RGBAColor;
  borderButton: RGBAColor;
  borderButtonDisabled: RGBAColor;

  textPrimary: RGBAColor;
  textSecondary: RGBAColor;
  textMuted: RGBAColor;
  textGold: RGBAColor;
  textAccent: RGBAColor;

  health: RGBAColor;
  mana: RGBAColor;
  lust: RGBAColor;
  physique: RGBAColor;
  arcane: RGBAColor;
  corruption: RGBAColor;
  currency: RGBAColor;
  gems: RGBAColor;

  enemy: RGBAColor;
  friendly: RGBAColor;
  companion: RGBAColor;
}

export interface ThemeFile {
  themeName: string;
  fontPath?: string;
  baseFontSize?: number;
  borderRadius: number;
  borderWidth: number;
  gaugeStyle: GaugeStyle;
  panelOpacity: number;
  glassmorphism: boolean;
  colors: ThemeColors;
}

export const colorToCss = (c: RGBAColor, alphaOverride?: number): string => {
  const a = alphaOverride !== undefined ? alphaOverride : c.a / 255;
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
};

export const hexToRgba = (hex: string, a: number = 255): RGBAColor => {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
    a,
  };
};

export const rgbaToHex = (c: RGBAColor): string => {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
};

export const DEFAULT_DARK_FANTASY_THEME: ThemeFile = {
  themeName: "Dark Fantasy (Default)",
  fontPath: "data/fonts/Roboto/static/Roboto-Medium.ttf",
  baseFontSize: 14,
  borderRadius: 4,
  borderWidth: 1,
  gaugeStyle: "SOLID",
  panelOpacity: 100,
  glassmorphism: false,
  colors: {
    bgDark: { r: 20, g: 18, b: 24, a: 255 },
    bgPanel: { r: 30, g: 28, b: 36, a: 255 },
    bgHeader: { r: 42, g: 38, b: 50, a: 255 },
    bgSlot: { r: 38, g: 35, b: 46, a: 255 },
    bgSlotOccupied: { r: 48, g: 52, b: 70, a: 255 },
    bgSlotSelected: { r: 72, g: 58, b: 98, a: 255 },
    bgButton: { r: 65, g: 85, b: 125, a: 255 },
    bgButtonDisabled: { r: 40, g: 40, b: 48, a: 255 },

    borderNormal: { r: 55, g: 50, b: 65, a: 255 },
    borderSelected: { r: 255, g: 215, b: 0, a: 255 },
    borderButton: { r: 90, g: 120, b: 170, a: 255 },
    borderButtonDisabled: { r: 55, g: 55, b: 65, a: 255 },

    textPrimary: { r: 255, g: 255, b: 255, a: 255 },
    textSecondary: { r: 215, g: 220, b: 235, a: 255 },
    textMuted: { r: 135, g: 135, b: 150, a: 255 },
    textGold: { r: 255, g: 215, b: 0, a: 255 },
    textAccent: { r: 185, g: 155, b: 225, a: 255 },

    health: { r: 255, g: 60, b: 90, a: 255 },
    mana: { r: 220, g: 130, b: 255, a: 255 },
    lust: { r: 230, g: 50, b: 150, a: 255 },
    physique: { r: 255, g: 50, b: 120, a: 255 },
    arcane: { r: 180, g: 110, b: 255, a: 255 },
    corruption: { r: 100, g: 200, b: 255, a: 255 },
    currency: { r: 255, g: 215, b: 0, a: 255 },
    gems: { r: 255, g: 100, b: 220, a: 255 },

    enemy: { r: 255, g: 120, b: 170, a: 255 },
    friendly: { r: 100, g: 210, b: 255, a: 255 },
    companion: { r: 120, g: 240, b: 150, a: 255 },
  },
};
