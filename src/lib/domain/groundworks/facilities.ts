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
}

export const FacilityCatalogue: Record<Facility, FacilityProfile> = {
	car_park: { label: 'Car park and track', blurb: 'Fifteen percent more anglers turn up when they can park.', cost: 4000, days: 4, runningPerDay: 0, anglerFactor: 1.15, takingsPerAngler: 0, payFactor: 1, reputationPerDay: 0, multiDayFactor: 1, needs: null },
	lodge: { label: 'Lodge', blurb: 'Bacon rolls and bait. Four pounds a head from every angler.', cost: 12000, days: 10, runningPerDay: 0, anglerFactor: 1, takingsPerAngler: 4, payFactor: 1, reputationPerDay: 0, multiDayFactor: 1, needs: null },
	aerator: { label: 'Aerator', blurb: 'No heatwave losses and a little cleaner water, for fifteen pounds a day.', cost: 2500, days: 2, runningPerDay: 15, anglerFactor: 1, takingsPerAngler: 0, payFactor: 1, reputationPerDay: 0, multiDayFactor: 1, needs: null },
	toilets: { label: 'Toilets and showers', blurb: 'Twelve percent more anglers, and the multi-day ticket sells.', cost: 9000, days: 6, runningPerDay: 10, anglerFactor: 1.12, takingsPerAngler: 0, payFactor: 1, reputationPerDay: 0, multiDayFactor: 1.3, needs: null },
	tackle_shop: { label: 'Tackle shop', blurb: "Sells tackle to visitors at the water's tier, and anglers can buy on site.", cost: 18000, days: 12, runningPerDay: 25, anglerFactor: 1, takingsPerAngler: 0, payFactor: 1, reputationPerDay: 0, multiDayFactor: 1, needs: null },
	bar: { label: 'Bar', blurb: 'Nine pounds a head and a little reputation every day.', cost: 35000, days: 20, runningPerDay: 60, anglerFactor: 1, takingsPerAngler: 9, payFactor: 1, reputationPerDay: 0.3, multiDayFactor: 1, needs: null },
	restaurant: { label: 'Restaurant', blurb: 'Eighteen pounds a head and a fifth more anglers. Needs the bar.', cost: 60000, days: 28, runningPerDay: 120, anglerFactor: 1.2, takingsPerAngler: 18, payFactor: 1, reputationPerDay: 0, multiDayFactor: 1, needs: 'bar' },
	hotel: { label: 'Hotel', blurb: 'Half as many anglers again, and they pay forty percent more. Needs the restaurant.', cost: 180000, days: 45, runningPerDay: 300, anglerFactor: 1.5, takingsPerAngler: 0, payFactor: 1.4, reputationPerDay: 0, multiDayFactor: 1, needs: 'restaurant' }
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

export function whyFacilityCannotBeBuilt(built: Facility[], wanted: Facility) {
	if (built.includes(wanted)) return `The ${FacilityCatalogue[wanted].label.toLowerCase()} is already built`;
	const needs = FacilityCatalogue[wanted].needs;
	if (needs && !built.includes(needs)) return `The ${FacilityCatalogue[wanted].label.toLowerCase()} needs the ${FacilityCatalogue[needs].label.toLowerCase()} first`;
	return null;
}
