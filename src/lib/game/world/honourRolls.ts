import type { ProlificAngler, WaterOfLegend } from '$lib/contracts/HallOfFame';
import { formatWeight } from '$lib/format/weight';

export function anglerHonours(anglers: ProlificAngler[]) {
	return anglers.map((angler) => ({
		key: angler.anglerId,
		label: angler.anglerName,
		detail: `best of them ${formatWeight(angler.heaviestLb)}`,
		value: `${angler.catches} landed`,
		href: `/anglers/${angler.anglerId}`
	}));
}

export function waterHonours(waters: WaterOfLegend[]) {
	return waters.map((water) => ({
		key: water.lakeId,
		label: water.lakeName,
		detail: `${water.ownerName}'s water · ${water.catches} fish on the bank`,
		value: formatWeight(water.heaviestLb),
		href: `/lakes/${water.lakeId}`
	}));
}
