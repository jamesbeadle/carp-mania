import { AnglerName } from '../anglerName';
import { pickRandom, type RandomFraction } from '../random';

const Openings = ['Silt', 'Gravel', 'Margin', 'Midnight', 'Boilie', 'Reedbed', 'Zig', 'Hemp', 'Lily', 'Dawn', 'Bivvy', 'Snag', 'Misty', 'Big', 'Swim', 'Lead'];
const Endings = ['Stalker', 'Whisperer', 'Baron', 'Bandit', 'Hunter', 'Ghost', 'Queen', 'King', 'Wizard', 'Raider', 'Shadow', 'Legend', 'Pirate', 'Nomad'];
const TagRange = { Lowest: 1, Highest: 99 } as const;
const ChanceOfATag = 0.5;

export function rolledAnglerHandle(random: RandomFraction) {
	const handle = `${pickRandom(random, Openings)}${pickRandom(random, Endings)}`;
	const isTagged = random() < ChanceOfATag;
	if (!isTagged) return handle;
	const tag = TagRange.Lowest + Math.floor(random() * TagRange.Highest);
	return `${handle}${tag}`.slice(0, AnglerName.LongestLength);
}

export function rolledAnglerHandles(random: RandomFraction, count: number) {
	const handles = new Set<string>();
	let isShortOfIdeas = count > 0;
	while (isShortOfIdeas) {
		handles.add(rolledAnglerHandle(random));
		isShortOfIdeas = handles.size < count;
	}
	return [...handles];
}
