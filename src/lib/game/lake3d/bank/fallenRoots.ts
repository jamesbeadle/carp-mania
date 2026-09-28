import { Vector3 } from 'three';
import { randomBetween, type RandomFraction } from '$lib/domain/random';
import { limbBetween } from './fallenLimbs';

const Roots = { Count: 8, Reach: [0.6, 1.1], Back: [0.25, 0.7], Flatten: 0.8, Radius: 0.14, TipRadius: 0.035, Sides: 5 } as const;

export function rootsOf(base: Vector3, random: RandomFraction) {
	return Array.from({ length: Roots.Count }, (_, index) => {
		const turn = (index / Roots.Count) * Math.PI * 2 + random() * (Math.PI / Roots.Count);
		const reach = randomBetween(random, ...Roots.Reach);
		const spread = new Vector3(-randomBetween(random, ...Roots.Back), Math.sin(turn) * reach * Roots.Flatten, Math.cos(turn) * reach);
		return limbBetween(base, base.clone().add(spread), Roots.Radius, Roots.TipRadius, Roots.Sides);
	});
}
