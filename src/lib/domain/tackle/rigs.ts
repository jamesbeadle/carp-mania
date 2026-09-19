import type { BedType, SwimFeature } from '../types';
import type { Presentation } from './presentations';

export type RigName = 'ronnie' | 'spinner' | 'hair_lead_clip' | 'chod' | 'helicopter' | 'zig';

export interface RigProfile {
	label: string;
	suitsBed: BedType[];
	suitsFeature: SwimFeature[];
	presentationScore: number;
	castFactor: number;
	holdsPosition: number;
	presents: Presentation[];
	tolerates: Presentation[];
	behaviour: string;
}

export const RigCatalogue: Record<RigName, RigProfile> = {
	hair_lead_clip: { label: 'Hair rig on a lead clip', suitsBed: ['clay', 'gravel'], suitsFeature: ['open_water', 'reed_line', 'island_margin'], presentationScore: 0.8, castFactor: 1, holdsPosition: 1, presents: ['bottom'], tolerates: ['wafter'], behaviour: 'Sits where it lands' },
	ronnie: { label: 'Ronnie rig', suitsBed: ['gravel', 'clay'], suitsFeature: ['open_water', 'island_margin', 'gravel_bar'], presentationScore: 0.9, castFactor: 0.95, holdsPosition: 1, presents: ['pop_up', 'wafter'], tolerates: [], behaviour: 'Rights itself — back to the same position every time' },
	spinner: { label: 'Spinner rig', suitsBed: ['gravel', 'clay'], suitsFeature: ['open_water', 'snag', 'island_margin', 'gravel_bar'], presentationScore: 0.9, castFactor: 0.95, holdsPosition: 1, presents: ['pop_up', 'wafter'], tolerates: [], behaviour: 'As the Ronnie, and turns harder in the mouth' },
	chod: { label: 'Chod rig', suitsBed: ['silt'], suitsFeature: ['weed_bed', 'reed_line', 'lily_pads'], presentationScore: 0.8, castFactor: 0.9, holdsPosition: 0.4, presents: ['pop_up'], tolerates: [], behaviour: 'Slides — lands anywhere and fishes anyway' },
	helicopter: { label: 'Helicopter rig', suitsBed: ['silt', 'clay'], suitsFeature: ['weed_bed', 'open_water'], presentationScore: 0.85, castFactor: 1.1, holdsPosition: 0.3, presents: ['pop_up', 'wafter'], tolerates: ['bottom'], behaviour: 'Moves on the leader; casts a long way, but it does not stay put' },
	zig: { label: 'Zig rig', suitsBed: ['gravel', 'clay', 'silt'], suitsFeature: ['open_water'], presentationScore: 0.55, castFactor: 1, holdsPosition: 0.6, presents: ['zig'], tolerates: [], behaviour: 'Fishes the upper layers; nothing on the bottom matters' }
};

export const RigNames = Object.keys(RigCatalogue) as RigName[];
export const SpinnerHold = 1.03;
