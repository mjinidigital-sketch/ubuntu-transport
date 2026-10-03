// Convert hex to HSL channels (for backward compatibility with shadcn HSL variables)
export function hexToHslChannels(hex: string): string {
  // Strip '#' indicator
  hex = hex.replace(/^#/, "");

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
}

// Convert hex to OKLCH channels (for modern CSS color spaces)
export function hexToOkLchChannels(hex: string): string {
  // Strip '#' indicator
  hex = hex.replace(/^#/, "");

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Convert RGB to linear RGB
  const toLinear = (c: number) => {
    return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
  };

  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);

  // Convert linear RGB to XYZ
  const x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375;
  const y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.072175;
  const z = rLinear * 0.0193339 + gLinear * 0.119192 + bLinear * 0.9503041;

  // Convert XYZ to LMS
  const l = x * 0.818933 + y * 0.361866 + z * 0.128201;
  const m = x * 0.032984 + y * 0.929323 + z * 0.036693;
  const s = x * 0.048200 + y * 0.264366 + z * 0.633434;

  // Convert LMS to Oklab
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  const L = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const a = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const bVal = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;

  // Convert Oklab to OKLCH
  const C = Math.sqrt(a * a + bVal * bVal);
  let H = Math.atan2(bVal, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  // Format as OKLCH string
  const lPct = (L * 100).toFixed(3);
  const cVal = C.toFixed(3);
  const hVal = H.toFixed(3);

  return `${lPct}% ${cVal} ${hVal}`;
}

// Validate hex color
export function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

// Expand shorthand hex (e.g., #abc -> #aabbcc)
export function expandHex(hex: string): string {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    return hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return hex;
}
