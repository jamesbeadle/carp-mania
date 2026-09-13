export type MilestoneKind = 'twenty' | 'thirty' | 'forty' | 'fifty' | 'first_record' | 'first_trophy' | 'hundred_fish' | 'five_hundred_fish';

export interface MilestoneWords {
	label: string;
	words: string;
}

export const MilestoneKinds: MilestoneKind[] = ['twenty', 'thirty', 'forty', 'fifty', 'first_record', 'first_trophy', 'hundred_fish', 'five_hundred_fish'];

export const MilestoneCatalogue: Record<MilestoneKind, MilestoneWords> = {
	twenty: { label: 'First twenty', words: 'A carp over twenty pounds on the bank' },
	thirty: { label: 'First thirty', words: 'A thirty — the fish that makes a name' },
	forty: { label: 'First forty', words: 'A forty, the fish of a lifetime' },
	fifty: { label: 'First fifty', words: 'A fifty. There are not many.' },
	first_record: { label: 'First record', words: 'The heaviest fish an angler had ever had on that water' },
	first_trophy: { label: 'First trophy', words: 'A match won' },
	hundred_fish: { label: 'A hundred fish', words: 'The hundredth carp landed' },
	five_hundred_fish: { label: 'Five hundred fish', words: 'The five hundredth carp landed' }
};

export function isMilestoneKind(value: string): value is MilestoneKind {
	return (MilestoneKinds as string[]).includes(value);
}
