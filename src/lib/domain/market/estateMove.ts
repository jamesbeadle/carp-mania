import type { Carp, Lake } from '../types';

type MovingFish = Pick<Carp, 'id' | 'name' | 'lake_id' | 'transit_until' | 'quarantine_until'>;
type OwnedWater = Pick<Lake, 'id' | 'name' | 'is_setup_complete'>;

export function whyFishCannotMove(fish: MovingFish, destinationId: string) {
	if (fish.lake_id === destinationId) return `${fish.name} is already there`;
	if (fish.transit_until || fish.quarantine_until) return `${fish.name} is already on the move`;
	return null;
}

export function destinationsFor(waters: OwnedWater[], currentLakeId: string) {
	return waters.filter((water) => water.id !== currentLakeId && water.is_setup_complete);
}

export function whyCannotMoveTo(waters: OwnedWater[], currentLakeId: string, destinationId: string) {
	const destination = destinationsFor(waters, currentLakeId).find((water) => water.id === destinationId);
	if (!destination) return 'That is not one of your other waters';
	return null;
}
