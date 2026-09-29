import type { ClearSpot } from '../bank/facilityGrounds';
import { metresBetween } from '../lakeFrame';
import type { PlantedTree } from './plantedTree';
import { CrownReach } from './treeKinds';

const ClearOfBankside = 3;

export function isClearOfBankside(tree: PlantedTree, keepClear: ClearSpot[]) {
	const crownReach = tree.height * CrownReach[tree.kind];
	return keepClear.every((spot) => metresBetween(spot.point, tree.point) > spot.radius + ClearOfBankside + crownReach);
}
