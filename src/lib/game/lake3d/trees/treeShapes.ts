import type { BufferGeometry } from 'three';
import { seededRandom } from '$lib/domain/random';
import { renderQuality } from '../renderQuality';
import { Canopies } from './canopies';
import { crownGeometry } from './crownShape';
import type { TreeKind } from './plantedTree';
import { trunkGeometry } from './trunkShape';

export interface TreeShape {
	crown: BufferGeometry;
	trunk: BufferGeometry;
}

const ShapeSeed = 17;

export function treeShapeOf(kind: TreeKind): TreeShape {
	const canopy = Canopies[kind];
	const random = seededRandom(ShapeSeed + kind.length);
	return { crown: crownGeometry(canopy, renderQuality().leafCardShare, random), trunk: trunkGeometry(canopy, random) };
}
