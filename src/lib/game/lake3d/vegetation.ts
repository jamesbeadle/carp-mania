import { Group, type Object3D } from 'three';
import type { CoverWind } from './grass/coverWind';
import type { Trees } from './trees/trees3d';

export class Vegetation {
	readonly group = new Group();

	constructor(private readonly trees: Trees, private readonly coverWind: CoverWind, growth: Object3D[]) {
		this.group.add(trees.group, ...growth);
	}

	blow(timeSeconds: number, windStrength: number) {
		this.trees.blow(timeSeconds, windStrength);
		this.coverWind.blow(timeSeconds, windStrength);
	}
}
