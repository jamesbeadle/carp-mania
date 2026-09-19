import type { Lake } from '../types';
import { RegionCatalogue, type RegionBounds } from '../world/regions';
import type { Farm } from './farms';
import { arrivalTimes, transportQuote, type LakeOnGlobe, type TransportQuote } from './transport';

type WaterPin = Pick<Lake, 'latitude' | 'longitude' | 'region'>;

export interface FarmDeliveryTerms {
	quote: TransportQuote;
	arrivesAt: Date;
	quarantineUntil: Date | null;
}

export function farmGateOf(farm: Farm): LakeOnGlobe {
	return { latitude: farm.latitude, longitude: farm.longitude, region: farm.region };
}

export function waterOnGlobeOf(water: WaterPin): LakeOnGlobe {
	const isPinned = water.latitude !== null && water.longitude !== null;
	if (isPinned) return { latitude: Number(water.latitude), longitude: Number(water.longitude), region: water.region };
	const centre = centreOf(RegionCatalogue[water.region].bounds);
	return { ...centre, region: water.region };
}

export function farmQuoteFor(farm: Farm, water: WaterPin): TransportQuote {
	return transportQuote(farmGateOf(farm), waterOnGlobeOf(water));
}

export function farmDeliveryTermsFor(farm: Farm, water: WaterPin, now: Date): FarmDeliveryTerms {
	const quote = farmQuoteFor(farm, water);
	const times = arrivalTimes(now, quote);
	return { quote, arrivesAt: times.arrivesAt, quarantineUntil: times.quarantineUntil };
}

function centreOf(bounds: RegionBounds) {
	const latitude = (bounds.south + bounds.north) / 2;
	const longitude = (bounds.west + bounds.east) / 2;
	return { latitude, longitude };
}
