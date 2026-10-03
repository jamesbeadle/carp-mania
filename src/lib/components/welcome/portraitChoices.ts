import type { PortraitPart } from '$lib/domain/portrait/portraitLook';
import { Beards, HairColours, HairColourWords, HairStyles, Hats, JacketColours, JacketWords, SkinTones, SkinWords } from '$lib/domain/portrait/portraitParts';

export interface PartChoice {
	label: string;
	swatch?: string;
}

const swatches = (words: readonly string[], colours: readonly string[]): PartChoice[] => words.map((label, index) => ({ label, swatch: colours[index] }));
const words = (labels: readonly string[]): PartChoice[] => labels.map((label) => ({ label }));

export const PortraitPickers: { part: PortraitPart; title: string; choices: PartChoice[] }[] = [
	{ part: 'skin', title: 'Skin', choices: swatches(SkinWords, SkinTones) },
	{ part: 'hairStyle', title: 'Hair', choices: words(HairStyles) },
	{ part: 'hairColour', title: 'Hair colour', choices: swatches(HairColourWords, HairColours) },
	{ part: 'beard', title: 'Beard', choices: words(Beards) },
	{ part: 'hat', title: 'Hat', choices: words(Hats) },
	{ part: 'jacket', title: 'Jacket', choices: swatches(JacketWords, JacketColours) }
];
