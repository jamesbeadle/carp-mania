import { Group } from 'three';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { WaterRings } from '../effects/waterRings';
import { Splashes } from '../effects/splashes';
import { LeapingFish } from '../fish/leapingFish';
import { worldPointOf, type LakeFrame } from '../lakeFrame';
import { Vector3 } from 'three';

const LeapShare = 0.35;
const EntrySplash = 0.55;

export class WaterLife {
	readonly group = new Group();
	private readonly rings = new WaterRings();
	private readonly splashes = new Splashes();
	private readonly leaper = new LeapingFish();
	private shown = new Set<string>();

	constructor(private readonly frame: LakeFrame) {
		this.group.add(this.rings.group, this.leaper.body, this.splashes.group);
		this.leaper.onEntry = (point, isLanding) => this.plop(point, isLanding ? EntrySplash : EntrySplash / 2);
	}

	ripple(point: Vector3, size: number) {
		this.rings.ripple(point, size);
	}

	plop(point: Vector3, strength: number) {
		this.splashes.splash(point, strength);
		this.rings.ripple(point, strength);
	}

	showFishAt(points: LayoutPoint[]) {
		const keys = points.map((point) => `${point.x.toFixed(4)}:${point.y.toFixed(4)}`);
		points.forEach((point, index) => {
			if (this.shown.has(keys[index])) return;
			const world = worldPointOf(this.frame, point);
			const where = new Vector3(world.x, 0, world.z);
			if (Math.random() < LeapShare) return this.leaper.leapAt(where);
			this.rings.ripple(where);
		});
		this.shown = new Set(keys);
	}

	advance(secondsElapsed: number) {
		this.rings.advance(secondsElapsed);
		this.splashes.advance(secondsElapsed);
		this.leaper.advance(secondsElapsed);
	}
}
