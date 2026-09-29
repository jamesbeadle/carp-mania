import { Vector3 } from 'three';
import type { RandomFraction } from '$lib/domain/random';
import { woodTube } from './woodTube';

export interface TrunkLie {
	length: number;
	rootHeight: number;
	crownSink: number;
}

const Trunk = { Joints: 7, Wander: 0.35, Bow: 0.5, Radius: 0.5, MiddleRadius: 0.34, TipRadius: 0.1, MiddleShare: 0.55, Sides: 12, Roughness: 0.12 } as const;
const Sunk = { WaterlineShare: 0.35 } as const;
const Flare = { Back: 0.25, Forward: 0.9, Radius: 0.68, Sides: 12, Roughness: 0.2 } as const;

export function trunkRadius() {
	return Trunk.Radius;
}

export function trunkPoints(lie: TrunkLie, random: RandomFraction) {
	const lift = lie.rootHeight + Trunk.Radius * (1 - 2 * Sunk.WaterlineShare);
	return Array.from({ length: Trunk.Joints + 1 }, (_, joint) => {
		const along = joint / Trunk.Joints;
		const bow = Math.sin(along * Math.PI) * Trunk.Bow;
		const wander = joint === 0 ? 0 : (random() - 1 / 2) * Trunk.Wander;
		return new Vector3(along * lie.length, lift - (lift + lie.crownSink) * along * along, bow + wander);
	});
}

export function trunkRadiusAlong(share: number) {
	if (share < Trunk.MiddleShare) return Trunk.Radius + (Trunk.MiddleRadius - Trunk.Radius) * (share / Trunk.MiddleShare);
	return Trunk.MiddleRadius + (Trunk.TipRadius - Trunk.MiddleRadius) * ((share - Trunk.MiddleShare) / (1 - Trunk.MiddleShare));
}

export function trunkTubes(points: Vector3[], random: RandomFraction) {
	const middle = Math.round((points.length - 1) * Trunk.MiddleShare);
	const lower = { points: points.slice(0, middle + 1), fromRadius: Trunk.Radius, toRadius: Trunk.MiddleRadius, sides: Trunk.Sides, roughness: Trunk.Roughness };
	const upper = { ...lower, points: points.slice(middle), fromRadius: Trunk.MiddleRadius, toRadius: Trunk.TipRadius };
	const [root, next] = points;
	const heading = next.clone().sub(root).normalize();
	const flarePoints = [root.clone().addScaledVector(heading, -Flare.Back), root.clone().addScaledVector(heading, Flare.Forward)];
	const flare = { points: flarePoints, fromRadius: Flare.Radius, toRadius: Trunk.Radius, sides: Flare.Sides, roughness: Flare.Roughness };
	return [woodTube(lower, random), woodTube(upper, random), woodTube(flare, random)];
}
