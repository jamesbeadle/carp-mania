export type Presentation = 'bottom' | 'wafter' | 'pop_up' | 'zig';

export const PresentationLabels: Record<Presentation, string> = { bottom: 'Bottom bait', wafter: 'Wafter', pop_up: 'Pop-up', zig: 'Zig' };

export const PresentationWords: Record<Presentation, string> = {
	bottom: 'Sits on the deck — best over a clean bed, lost in silt and weed',
	wafter: 'Balanced, wafts just off the bottom — the best thing over soft ground',
	pop_up: 'Rises off the lead — usually the first bait a fish comes across, best over silt and weed',
	zig: 'Fishes the upper layers — nothing on the bottom matters'
};

export const PairingScore = { Matched: 1, Tolerable: 0.7, Wrong: 0.35 } as const;

export interface Presents {
	presents: Presentation[];
	tolerates: Presentation[];
}

export function pairingScore(rig: Presents, presentation: Presentation) {
	if (rig.presents.includes(presentation)) return PairingScore.Matched;
	if (rig.tolerates.includes(presentation)) return PairingScore.Tolerable;
	return PairingScore.Wrong;
}
