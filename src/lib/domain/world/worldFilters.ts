import type { WorldPin } from '../../contracts/WorldPin';
import type { RegionCode } from './regionCodes';

export const WorldSorts = ['reputation', 'biggest', 'day_ticket', 'name'] as const;
export type WorldSort = (typeof WorldSorts)[number];

export const WorldSortLabels: Record<WorldSort, string> = {
	reputation: 'Reputation',
	biggest: 'Biggest fish',
	day_ticket: 'Day ticket',
	name: 'Name'
};

export interface WorldFilters {
	search: string;
	region: RegionCode | null;
	minimumReputation: number | null;
	minimumHeaviestLb: number | null;
	maximumDayTicketFee: number | null;
	isOnTheBankOnly: boolean;
	isFavouritesOnly: boolean;
	sort: WorldSort;
}

export const NoWorldFilters: WorldFilters = {
	search: '',
	region: null,
	minimumReputation: null,
	minimumHeaviestLb: null,
	maximumDayTicketFee: null,
	isOnTheBankOnly: false,
	isFavouritesOnly: false,
	sort: 'reputation'
};

export function isWorldSort(value: string): value is WorldSort {
	return (WorldSorts as readonly string[]).includes(value);
}

export function filterWorldPins(pins: WorldPin[], filters: WorldFilters, favouriteIds: ReadonlySet<string>): WorldPin[] {
	const kept = pins.filter((pin) => passesEveryFilter(pin, filters, favouriteIds));
	return sortWorldPins(kept, filters.sort, favouriteIds);
}

export function sortWorldPins(pins: WorldPin[], sort: WorldSort, favouriteIds: ReadonlySet<string>): WorldPin[] {
	const compare = Comparators[sort];
	const rank = (pin: WorldPin) => (favouriteIds.has(pin.id) ? 0 : 1);
	return [...pins].sort((first, second) => rank(first) - rank(second) || compare(first, second));
}

const Comparators: Record<WorldSort, (first: WorldPin, second: WorldPin) => number> = {
	reputation: (first, second) => second.reputation - first.reputation,
	biggest: (first, second) => second.heaviestLb - first.heaviestLb,
	day_ticket: (first, second) => first.dayTicketFee - second.dayTicketFee,
	name: (first, second) => first.name.localeCompare(second.name)
};

function passesEveryFilter(pin: WorldPin, filters: WorldFilters, favouriteIds: ReadonlySet<string>) {
	if (!matchesSearch(pin, filters.search)) return false;
	if (filters.region && pin.region !== filters.region) return false;
	if (filters.minimumReputation !== null && pin.reputation < filters.minimumReputation) return false;
	if (filters.minimumHeaviestLb !== null && pin.heaviestLb < filters.minimumHeaviestLb) return false;
	if (filters.maximumDayTicketFee !== null && pin.dayTicketFee > filters.maximumDayTicketFee) return false;
	if (filters.isOnTheBankOnly && pin.anglersOnBankNow === 0) return false;
	if (filters.isFavouritesOnly && !favouriteIds.has(pin.id)) return false;
	return true;
}

function matchesSearch(pin: WorldPin, search: string) {
	const needle = search.trim().toLowerCase();
	if (needle === '') return true;
	return pin.name.toLowerCase().includes(needle) || pin.ownerName.toLowerCase().includes(needle);
}
