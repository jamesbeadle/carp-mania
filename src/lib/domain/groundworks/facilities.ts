import type { Facility } from '../layout/layoutTypes';

export interface FacilityProfile {
	label: string;
	blurb: string;
	cost: number;
	days: number;
	runningPerDay: number;
	anglerFactor: number;
	takingsPerAngler: number;
	payFactor: number;
	reputationPerDay: number;
	multiDayFactor: number;
	needs: Facility | null;
	replaces: Facility | null;
}

export const FacilityCatalogue: Record<Facility, FacilityProfile> = {
	car_park: { label: 'Car park and track', blurb: 'Fifteen percent more anglers turn up when they can park.', cost: 4000, days: 4, runningPerDay: 0, anglerFactor: 1.15, takingsPerAngler: 0, payFactor: 1, reputationPerDay: 0, multiDayFactor: 1, needs: null, replaces: null },
	lodge: { label: 'Lodge', blurb: 'Bacon rolls and bait. Four pounds a head from every angler.', cost: 12000, days: 10, runningPerDay: 0, anglerFactor: 1, takingsPerAngler: 4, payFactor: 1, reputationPerDay: 0, multiDayFactor: 1, needs: null, replaces: null },
	aerator: { label: 'Aerator', blurb: 'No heatwave losses and a little cleaner water, for fifteen pounds a day.', cost: 2500, days: 2, runningPerDay: 15, anglerFactor: 1, takingsPerAngler: 0, payFactor: 1, reputationPerDay: 0, multiDayFactor: 1, needs: null, replaces: null },
	toilets: { label: 'Toilets and showers', blurb: 'Twelve percent more anglers, and the multi-day ticket sells.', cost: 9000, days: 6, runningPerDay: 10, anglerFactor: 1.12, takingsPerAngler: 0, payFactor: 1, reputationPerDay: 0, multiDayFactor: 1.3, needs: null, replaces: null },
	washrooms: { label: 'Washrooms', blurb: 'Hot showers and a drying room. Eighteen percent more anglers, and half as many again stay on. Replaces the toilets.', cost: 24000, days: 12, runningPerDay: 25, anglerFactor: 1.18, takingsPerAngler: 0, payFactor: 1, reputationPerDay: 0.05, multiDayFactor: 1.5, needs: 'toilets', replaces: 'toilets' },
	club_house: { label: 'Club house', blurb: 'Washrooms, a kitchen and a fire to sit by. A quarter more anglers, three pounds a head, and they pay a little more. Replaces the washrooms.', cost: 60000, days: 24, runningPerDay: 70, anglerFactor: 1.25, takingsPerAngler: 3, payFactor: 1.05, reputationPerDay: 0.15, multiDayFactor: 1.7, needs: 'washrooms', replaces: 'washrooms' },
	estate_house: { label: 'Estate house', blurb: 'A house on the water with rooms to let. A third more anglers, a fifth more on the ticket, and the week-long sits fill up. Replaces the club house.', cost: 160000, days: 40, runningPerDay: 200, anglerFactor: 1.35, takingsPerAngler: 6, payFactor: 1.2, reputationPerDay: 0.3, multiDayFactor: 2, needs: 'club_house', replaces: 'club_house' },
	tackle_shop: { label: 'Tackle shop', blurb: "Sells tackle to visitors at the water's tier, and anglers can buy on site.", cost: 18000, days: 12, runningPerDay: 25, anglerFactor: 1, takingsPerAngler: 0, payFactor: 1, reputationPerDay: 0, multiDayFactor: 1, needs: null, replaces: null },
	bar: { label: 'Bar', blurb: 'Nine pounds a head and a little reputation every day.', cost: 35000, days: 20, runningPerDay: 60, anglerFactor: 1, takingsPerAngler: 9, payFactor: 1, reputationPerDay: 0.3, multiDayFactor: 1, needs: null, replaces: null },
	restaurant: { label: 'Restaurant', blurb: 'Eighteen pounds a head and a fifth more anglers. Needs the bar.', cost: 60000, days: 28, runningPerDay: 120, anglerFactor: 1.2, takingsPerAngler: 18, payFactor: 1, reputationPerDay: 0, multiDayFactor: 1, needs: 'bar', replaces: null },
	hotel: { label: 'Hotel', blurb: 'Half as many anglers again, and they pay forty percent more. Needs the restaurant.', cost: 180000, days: 45, runningPerDay: 300, anglerFactor: 1.5, takingsPerAngler: 0, payFactor: 1.4, reputationPerDay: 0, multiDayFactor: 1, needs: 'restaurant', replaces: null }
};

export function isFacility(kind: string): kind is Facility {
	return kind in FacilityCatalogue;
}

export function facilitiesOf(built: Facility[]) {
	return built.map((facility) => FacilityCatalogue[facility]);
}

export function anglerFactorOf(built: Facility[]) {
	return facilitiesOf(built).reduce((factor, facility) => factor * facility.anglerFactor, 1);
}

export function takingsPerAnglerOf(built: Facility[]) {
	return facilitiesOf(built).reduce((total, facility) => total + facility.takingsPerAngler, 0);
}

export function payFactorOf(built: Facility[]) {
	return facilitiesOf(built).reduce((factor, facility) => factor * facility.payFactor, 1);
}

export function runningCostOf(built: Facility[]) {
	return facilitiesOf(built).reduce((total, facility) => total + facility.runningPerDay, 0);
}

export function reputationPerDayOf(built: Facility[]) {
	return facilitiesOf(built).reduce((total, facility) => total + facility.reputationPerDay, 0);
}

export function multiDayFactorOf(built: Facility[]) {
	return facilitiesOf(built).reduce((factor, facility) => factor * facility.multiDayFactor, 1);
}

export function upgradeOf(built: Facility[], wanted: Facility) {
	return built.find((facility) => tiersBelow(facility).includes(wanted)) ?? null;
}

function tiersBelow(facility: Facility): Facility[] {
	const replaced = FacilityCatalogue[facility].replaces;
	return replaced ? [replaced, ...tiersBelow(replaced)] : [];
}

function nameOf(facility: Facility) {
	const profile = FacilityCatalogue[facility];
	return profile.label.toLowerCase();
}

export function whyFacilityCannotBeBuilt(built: Facility[], wanted: Facility) {
	if (built.includes(wanted)) return `The ${nameOf(wanted)} is already built`;
	const upgrade = upgradeOf(built, wanted);
	if (upgrade) return `Already upgraded to the ${nameOf(upgrade)}`;
	const needs = FacilityCatalogue[wanted].needs;
	if (needs && !built.includes(needs)) return `The ${nameOf(wanted)} needs the ${nameOf(needs)} first`;
	return null;
}

export function builtAfter(built: Facility[], finished: Facility) {
	const replaced = FacilityCatalogue[finished].replaces;
	return [...built.filter((facility) => facility !== replaced), finished];
}
