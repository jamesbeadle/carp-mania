export const GlobePalette = {
	Land: '#141914',
	Coastline: 'rgba(43, 193, 42, 0.6)',
	Graticule: 'rgba(62, 232, 58, 0.35)',
	Outline: 'rgba(31, 211, 255, 0.5)',
	LimbGlowInner: 'rgba(31, 211, 255, 0.22)',
	LimbGlowOuter: 'rgba(31, 211, 255, 0)',
	RegionFill: 'rgba(62, 232, 58, 0.09)',
	RegionEdge: 'rgba(62, 232, 58, 0.45)',
	PinShadow: 'rgba(0, 0, 0, 0.55)',
	PinPlank: 'rgba(0, 0, 0, 0.3)',
	PinEdge: 'rgba(6, 8, 6, 0.65)',
	PinEdgeEmphasised: '#f2f7f2',
	PlotMarker: '#3ee83a',
	Label: '#f2f7f2',
	LabelSelected: '#3ee83a',
	ClusterRing: '#3ee83a',
	ClusterFill: 'rgba(12, 15, 12, 0.85)',
	ClusterCount: '#a5fca3'
} as const;

export const GlobeFont = {
	Count: "700 12px 'Barlow Condensed', 'Arial Narrow', sans-serif"
} as const;

const PinColourStops = { Low: [143, 157, 143], High: [62, 232, 58] } as const;
const ReputationForFullVolt = 100;

export function pinColourFor(reputation: number) {
	const mix = Math.min(1, Math.max(0, reputation / ReputationForFullVolt));
	const channel = (index: 0 | 1 | 2) => Math.round(PinColourStops.Low[index] + (PinColourStops.High[index] - PinColourStops.Low[index]) * mix);
	return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

export function arcColour(alpha: number) {
	return `rgba(31, 211, 255, ${alpha})`;
}

export function pulseColour(alpha: number) {
	return `rgba(108, 245, 106, ${alpha})`;
}
