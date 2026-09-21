import type { OwnedItem } from '$lib/domain/tackle/tackleBox';

const MillisecondsPerFisheryDay = 60 * 60 * 1000;

export function keepingWordsFor(owned: OwnedItem): string {
	if (owned.isSpoiled) return ' · gone off';
	if (!owned.spoilsAt) return '';
	const daysLeft = Math.max(0, Math.ceil((new Date(owned.spoilsAt).getTime() - Date.now()) / MillisecondsPerFisheryDay));
	return ` · spoils in ${daysLeft} fishery ${daysLeft === 1 ? 'day' : 'days'}`;
}
