import type { MatchWinner, ProlificAngler, WaterOfLegend } from '$lib/contracts/HallOfFame';
import { formatMoney } from '$lib/format/money';
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

export function matchHonours(winners: MatchWinner[]) {
	return winners.map((winner) => ({
		key: winner.anglerId,
		label: winner.anglerName,
		detail: `${formatMoney(winner.prizeMoney)} in prizes · last won ${winner.latestTitle}`,
		value: `${winner.trophies} ${winner.trophies === 1 ? 'trophy' : 'trophies'}`,
		href: `/anglers/${winner.anglerId}`
	}));
}
