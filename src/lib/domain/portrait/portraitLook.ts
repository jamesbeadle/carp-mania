import { Beards, HairColours, HairStyles, Hats, JacketColours, SkinTones } from './portraitParts';

export interface PortraitLook {
	skin: number;
	hairStyle: number;
	hairColour: number;
	beard: number;
	hat: number;
	jacket: number;
}

export type PortraitPart = keyof PortraitLook;

export const PartChoiceCounts: Record<PortraitPart, number> = {
	skin: SkinTones.length,
	hairStyle: HairStyles.length,
	hairColour: HairColours.length,
	beard: Beards.length,
	hat: Hats.length,
	jacket: JacketColours.length
};

export const PartOrder: PortraitPart[] = ['skin', 'hairStyle', 'hairColour', 'beard', 'hat', 'jacket'];

const CodeSeparator = '-';
const PortraitFolder = '/portrait/';
const PortraitExtension = '.svg';

export function lookCode(look: PortraitLook) {
	return PartOrder.map((part) => look[part]).join(CodeSeparator);
}

export function lookFromCode(code: string): PortraitLook | null {
	const choices = code.split(CodeSeparator).map(Number);
	const isWholeCode = choices.length === PartOrder.length;
	if (!isWholeCode) return null;
	const isEveryChoiceOnOffer = PartOrder.every((part, index) => isChoiceOnOffer(part, choices[index]));
	if (!isEveryChoiceOnOffer) return null;
	return Object.fromEntries(PartOrder.map((part, index) => [part, choices[index]])) as unknown as PortraitLook;
}

function isChoiceOnOffer(part: PortraitPart, choice: number) {
	return Number.isInteger(choice) && choice >= 0 && choice < PartChoiceCounts[part];
}

export function portraitPathOf(look: PortraitLook) {
	return `${PortraitFolder}${lookCode(look)}${PortraitExtension}`;
}

export function lookOfPortraitPath(avatarUrl: string | null): PortraitLook | null {
	const isPortraitPath = avatarUrl?.startsWith(PortraitFolder) && avatarUrl.endsWith(PortraitExtension);
	if (!avatarUrl || !isPortraitPath) return null;
	return lookFromCode(avatarUrl.slice(PortraitFolder.length, -PortraitExtension.length));
}
