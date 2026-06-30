export type Rgb = {
  r: number;
  g: number;
  b: number;
};

export type Hsv = {
  h: number; // [0, 360]
  s: number; // [0, 100]
  v: number; // [0, 100]
};

export function hexToRgb(hex: string): Rgb | null {
  const m = hex
    .replace("#", "")
    .match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
}

export function rgbToHsv({ r, g, b }: Rgb): Hsv {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const sn = s / 100,
    vn = v / 100;
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = vn * (1 - sn);
  const q = vn * (1 - f * sn);
  const t = vn * (1 - (1 - f) * sn);
  const [rn, gn, bn] = [
    [vn, q, p, p, t, vn],
    [t, vn, vn, q, p, p],
    [p, p, t, vn, vn, q],
  ].map((channel) => channel[i]);
  return {
    r: Math.round(rn * 255),
    g: Math.round(gn * 255),
    b: Math.round(bn * 255),
  };
}
