/**
 * Color conversion utilities for HEX, RGB, and CMYK formats
 */

// HEX to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1]!, 16),
				g: parseInt(result[2]!, 16),
				b: parseInt(result[3]!, 16),
			}
		: null;
}

// RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
	return (
		"#" +
		[r, g, b]
			.map((x) => {
				const hex = x.toString(16);
				return hex.length === 1 ? "0" + hex : hex;
			})
			.join("")
			.toUpperCase()
	);
}

// RGB to CMYK
export function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
	if (r === 0 && g === 0 && b === 0) {
		return { c: 0, m: 0, y: 0, k: 100 };
	}

	const c = 1 - r / 255;
	const m = 1 - g / 255;
	const y = 1 - b / 255;
	const k = Math.min(c, m, y);

	return {
		c: Math.round(((c - k) / (1 - k)) * 100),
		m: Math.round(((m - k) / (1 - k)) * 100),
		y: Math.round(((y - k) / (1 - k)) * 100),
		k: Math.round(k * 100),
	};
}

// CMYK to RGB
export function cmykToRgb(c: number, m: number, y: number, k: number): { r: number; g: number; b: number } {
	const _c = c / 100;
	const _m = m / 100;
	const _y = y / 100;
	const _k = k / 100;

	const r = Math.round(255 * (1 - _c) * (1 - _k));
	const g = Math.round(255 * (1 - _m) * (1 - _k));
	const b = Math.round(255 * (1 - _y) * (1 - _k));

	return { r, g, b };
}

// Parse RGB string "255,0,0" to object
export function parseRgbString(rgbString: string): { r: number; g: number; b: number } | null {
	const parts = rgbString.split(",").map((s) => parseInt(s.trim(), 10));
	if (parts.length === 3 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
		return { r: parts[0]!, g: parts[1]!, b: parts[2]! };
	}
	return null;
}

// Parse CMYK string "0,100,100,0" to object
export function parseCmykString(cmykString: string): { c: number; m: number; y: number; k: number } | null {
	const parts = cmykString.split(",").map((s) => parseInt(s.trim(), 10));
	if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 100)) {
		return { c: parts[0]!, m: parts[1]!, y: parts[2]!, k: parts[3]! };
	}
	return null;
}

// Format RGB object to string
export function formatRgb(r: number, g: number, b: number): string {
	return `${Math.round(r)},${Math.round(g)},${Math.round(b)}`;
}

// Format CMYK object to string
export function formatCmyk(c: number, m: number, y: number, k: number): string {
	return `${Math.round(c)},${Math.round(m)},${Math.round(y)},${Math.round(k)}`;
}
