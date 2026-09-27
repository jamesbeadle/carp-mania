import { Color } from 'three';

const ModernHsl = /^hsla?\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%(?:\s*\/\s*[\d.]+)?\s*\)$/;

export function colourOf(css: string) {
	const modern = ModernHsl.exec(css.trim());
	if (!modern) return new Color(css);
	const [, hue, saturation, lightness] = modern;
	return new Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
}
