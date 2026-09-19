export type LineColour = 'clear' | 'camo' | 'green' | 'brown';
export type BreakingStrainLb = 12 | 15 | 18 | 20;

export interface LineStats {
	colour: LineColour;
	breakingStrainLb: BreakingStrainLb;
	diameterMm: number;
	spoolMetres: number;
}

export const LineColourLabels: Record<LineColour, string> = { clear: 'Clear', camo: 'Camo', green: 'Green', brown: 'Brown' };
export const BreakingStrains: BreakingStrainLb[] = [12, 15, 18, 20];
export const LineColours = Object.keys(LineColourLabels) as LineColour[];
export const SpoolSizes = { Standard: 1000, Large: 1200 } as const;
export const LineVisibilityScale = { InvisibleAtMm: 0.26, RangeMm: 0.3 } as const;
export const SnapLoss = { MetresPastTheBreak: 20 } as const;

export function lineVisibility(line: Pick<LineStats, 'diameterMm'>) {
	const visibility = (line.diameterMm - LineVisibilityScale.InvisibleAtMm) / LineVisibilityScale.RangeMm;
	return Math.min(1, Math.max(0, visibility));
}

export function metresLostOnSnap(castDistanceMetres: number) {
	return Math.round(castDistanceMetres + SnapLoss.MetresPastTheBreak);
}
