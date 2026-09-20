export const DepthShade = { AlphaPerFoot: 0.06, MaximumAlpha: 0.5, SoftEdgePixels: 16 } as const;

const Water = { ClearHue: 160, ColouredHueShift: 40, LeastSaturation: 34, ClaritySaturation: 26, SurfaceLightness: 33, DepthDarkening: 12, ColourDarkening: 5 } as const;

export function waterColour(transparency: number, depthFraction: number) {
	const clarity = transparency / 100;
	const hue = Water.ClearHue + (1 - clarity) * Water.ColouredHueShift;
	const saturation = Water.LeastSaturation + clarity * Water.ClaritySaturation;
	const lightness = Water.SurfaceLightness - depthFraction * Water.DepthDarkening - (1 - clarity) * Water.ColourDarkening;
	return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

export function depthShadeColour(feetBelowBase: number) {
	const alpha = Math.min(DepthShade.MaximumAlpha, Math.abs(feetBelowBase) * DepthShade.AlphaPerFoot);
	if (feetBelowBase < 0) return `hsla(70 40% 80% / ${alpha})`;
	return `hsla(205 50% 5% / ${alpha})`;
}

export function weedColour(alpha: number) {
	return `hsla(110 40% 30% / ${alpha})`;
}

export function showingRippleColour(alpha: number) {
	return `hsla(185 35% 92% / ${alpha})`;
}
