import type { Lake } from '../types';

export const Estate = { MostWaters: 5 } as const;

type Water = Pick<Lake, 'name' | 'is_setup_complete'>;

export function whyCannotBuyAnotherWater(waters: Water[]): string | null {
	const underSetup = waters.find((water) => !water.is_setup_complete);
	if (underSetup) return `Finish setting up ${underSetup.name} before buying another water`;
	if (waters.length >= Estate.MostWaters) return `${Estate.MostWaters} waters is an estate — that is as far as it goes`;
	return null;
}

export function isAnEstate(waters: Water[]) {
	return waters.length > 1;
}

export function currentWaterOf<Candidate extends Pick<Lake, 'id'>>(waters: Candidate[], currentLakeId: string | null): Candidate | null {
	return waters.find((water) => water.id === currentLakeId) ?? waters[0] ?? null;
}
