import type { BedType, SwimFeature } from '../types';

export type RigName = 'ronnie' | 'spinner' | 'hair_lead_clip' | 'chod' | 'helicopter' | 'zig';

export interface RigProfile {
	label: string;
	suitsBed: BedType[];
	suitsFeature: SwimFeature[];
	presentationScore: number;
	castFactor: number;
}

export const RigCatalogue: Record<RigName, RigProfile> = {
	ronnie: { label: 'Ronnie rig', suitsBed: ['gravel', 'clay'], suitsFeature: ['open_water', 'island_margin'], presentationScore: 0.9, castFactor: 0.95 },
	spinner: { label: 'Spinner rig', suitsBed: ['gravel', 'clay'], suitsFeature: ['open_water', 'snag', 'island_margin'], presentationScore: 0.9, castFactor: 0.95 },
	hair_lead_clip: { label: 'Hair rig on lead clip', suitsBed: ['clay', 'gravel'], suitsFeature: ['open_water', 'reed_line', 'island_margin'], presentationScore: 0.75, castFactor: 1 },
	chod: { label: 'Chod rig', suitsBed: ['silt'], suitsFeature: ['weed_bed', 'reed_line'], presentationScore: 0.8, castFactor: 0.9 },
	helicopter: { label: 'Helicopter rig', suitsBed: ['silt', 'clay'], suitsFeature: ['weed_bed', 'open_water'], presentationScore: 0.8, castFactor: 1.1 },
	zig: { label: 'Zig rig', suitsBed: ['gravel', 'clay', 'silt'], suitsFeature: ['open_water'], presentationScore: 0.55, castFactor: 1 }
};

export const RigNames = Object.keys(RigCatalogue) as RigName[];
