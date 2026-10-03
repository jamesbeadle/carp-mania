import type { PortraitLook } from '$lib/domain/portrait/portraitLook';

export interface LicenceDraft {
	name: string;
	look: PortraitLook | null;
	purse: number;
}

export interface NameAvailability {
	name: string;
	isFree: boolean;
	reason: string;
}

export const LicenceField = { Name: 'name', Look: 'look' } as const;
export const NameCheckParam = 'name';
