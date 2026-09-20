export type ReelKind = 'carp_small' | 'carp_large' | 'big_pit_entry' | 'big_pit_full' | 'prototype_11000';

export interface ReelProfile {
	label: string;
	spool: number;
	castFactor: number;
	retrieveFactor: number;
	note: string;
}

export const ReelCatalogue: Record<ReelKind, ReelProfile> = {
	carp_small: { label: 'Carp reel, small', spool: 4500, castFactor: 0.85, retrieveFactor: 1, note: 'Cheap, fine in the margins' },
	carp_large: { label: 'Carp reel, large', spool: 6000, castFactor: 1, retrieveFactor: 0.97, note: 'The all-rounder' },
	big_pit_entry: { label: 'Big pit, entry', spool: 8000, castFactor: 1.15, retrieveFactor: 0.92, note: 'The bottom of these beats the top of the carp reels — just' },
	big_pit_full: { label: 'Big pit, full', spool: 10000, castFactor: 1.3, retrieveFactor: 0.88, note: 'Range work, and heavy to hold' },
	prototype_11000: { label: 'Prototype 11000', spool: 11000, castFactor: 1.4, retrieveFactor: 0.9, note: 'One of one — casts further than anything on sale' }
};

export const ReelKinds = Object.keys(ReelCatalogue) as ReelKind[];
