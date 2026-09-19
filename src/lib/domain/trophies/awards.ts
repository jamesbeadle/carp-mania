export type AwardKey =
	| 'first_double' | 'first_twenty' | 'first_thirty' | 'first_forty' | 'first_fifty'
	| 'hundred_fish' | 'five_hundred_fish' | 'thousand_fish'
	| 'five_regions' | 'ten_regions' | 'home_grown' | 'light_rod' | 'a_match_won'
	| 'first_record' | 'three_waters' | 'ten_thousand_pounds'
	| 'night_owl' | 'early_bird' | 'the_full_book' | 'dealers_friend' | 'first_bounty';

export interface AwardTallies {
	bestLb: number;
	fishLanded: number;
	regionsFished: number;
	homeGrownBestLb: number;
	lightRodBestLb: number;
	trophies: number;
	recordsSet: number;
	recordWaters: number;
	lifetimeLb: number;
	nightFish: number;
	morningFish: number;
	ticketKindsFished: number;
	fishSold: number;
	bountiesTaken: number;
}

export interface Award {
	label: string;
	words: string;
	tally: keyof AwardTallies;
	target: number;
}

export const AwardCatalogue: Record<AwardKey, Award> = {
	first_double: { label: 'First double', words: 'A carp over ten pounds on the bank', tally: 'bestLb', target: 10 },
	first_twenty: { label: 'First twenty', words: 'A carp over twenty pounds on the bank', tally: 'bestLb', target: 20 },
	first_thirty: { label: 'First thirty', words: 'A thirty — the fish that makes a name', tally: 'bestLb', target: 30 },
	first_forty: { label: 'First forty', words: 'A forty, the fish of a lifetime', tally: 'bestLb', target: 40 },
	first_fifty: { label: 'First fifty', words: 'A fifty. There are not many.', tally: 'bestLb', target: 50 },
	hundred_fish: { label: 'A hundred fish', words: 'The hundredth carp landed', tally: 'fishLanded', target: 100 },
	five_hundred_fish: { label: 'Five hundred fish', words: 'The five hundredth carp landed', tally: 'fishLanded', target: 500 },
	thousand_fish: { label: 'A thousand fish', words: 'A thousand carp on the bank in one lifetime', tally: 'fishLanded', target: 1000 },
	five_regions: { label: 'Five regions', words: 'A fish from five regions of the world', tally: 'regionsFished', target: 5 },
	ten_regions: { label: 'Ten regions', words: 'A fish from ten regions of the world', tally: 'regionsFished', target: 10 },
	home_grown: { label: 'Home grown', words: 'A thirty from your own water', tally: 'homeGrownBestLb', target: 30 },
	light_rod: { label: 'Light rod', words: 'A fish over forty on a rod under three pound test curve', tally: 'lightRodBestLb', target: 40 },
	a_match_won: { label: 'A match won', words: 'The first trophy', tally: 'trophies', target: 1 },
	first_record: { label: 'First record', words: 'The heaviest fish an angler had ever had on that water', tally: 'recordsSet', target: 1 },
	three_waters: { label: 'Three waters', words: 'A lake record on three different waters', tally: 'recordWaters', target: 3 },
	ten_thousand_pounds: { label: 'Ten thousand pounds', words: 'Ten thousand pounds of carp landed in a lifetime', tally: 'lifetimeLb', target: 10000 },
	night_owl: { label: 'Night owl', words: 'Fifty fish after dark', tally: 'nightFish', target: 50 },
	early_bird: { label: 'Early bird', words: 'Fifty fish before eight in the morning', tally: 'morningFish', target: 50 },
	the_full_book: { label: 'The full book', words: 'A fish on a day, a night and a twenty-four hour ticket', tally: 'ticketKindsFished', target: 3 },
	dealers_friend: { label: "The dealer's friend", words: 'A hundred fish sold on', tally: 'fishSold', target: 100 },
	first_bounty: { label: 'First bounty', words: 'The first bounty taken', tally: 'bountiesTaken', target: 1 }
};

export const AwardKeys = Object.keys(AwardCatalogue) as AwardKey[];

export const NoTallies: AwardTallies = {
	bestLb: 0, fishLanded: 0, regionsFished: 0, homeGrownBestLb: 0, lightRodBestLb: 0, trophies: 0, recordsSet: 0,
	recordWaters: 0, lifetimeLb: 0, nightFish: 0, morningFish: 0, ticketKindsFished: 0, fishSold: 0, bountiesTaken: 0
};

export function isAwardKey(value: string): value is AwardKey {
	return (AwardKeys as string[]).includes(value);
}
