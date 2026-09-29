import { Group, type Camera, type Object3D } from 'three';
import type { CoverWind } from './grass/coverWind';
import type { GroundCover } from './grass/groundCover';
import type { Trees } from './trees/trees3d';

export class Vegetation {
	readonly group = new Group();

	constructor(private readonly trees: Trees, private readonly coverWind: CoverWind, private readonly cover: GroundCover, growth: Object3D[]) {
		this.group.add(trees.group, cover.group, ...growth);
	}

	fillCoverAround(camera: Camera) {
		this.cover.fillAround(camera);
	}

	blow(timeSeconds: number, windStrength: number) {
		this.trees.blow(timeSeconds, windStrength);
		this.coverWind.blow(timeSeconds, windStrength);
	}
}
