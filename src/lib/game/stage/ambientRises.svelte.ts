import type { LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { isInWater } from '$lib/domain/layout/waterArea';

const Rises = { EveryMilliseconds: 6500, MostAtOnce: 3, LingerMilliseconds: 7000, Attempts: 30 } as const;

export class AmbientRises {
	points = $state<LayoutPoint[]>([]);

	start(layout: LakeLayout) {
		const rising = setInterval(() => this.rise(layout), Rises.EveryMilliseconds);
		return () => clearInterval(rising);
	}

	private rise(layout: LakeLayout) {
		const spot = randomWaterSpot(layout);
		if (!spot) return;
		this.points = [...this.points.slice(-(Rises.MostAtOnce - 1)), spot];
		setTimeout(() => (this.points = this.points.filter((point) => point !== spot)), Rises.LingerMilliseconds);
	}
}

function randomWaterSpot(layout: LakeLayout): LayoutPoint | null {
	for (let attempt = 0; attempt < Rises.Attempts; attempt++) {
		const candidate = { x: Math.random(), y: Math.random() };
		if (isInWater(layout, candidate)) return candidate;
	}
	return null;
}
