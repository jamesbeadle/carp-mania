import { CylinderGeometry, Quaternion, Vector3, type BufferGeometry } from 'three';
import { pickRandom, randomBetween, type RandomFraction } from '$lib/domain/random';

export interface TrunkLie {
	length: number;
	rise: number;
	sink: number;
}

const Trunk = { Joints: 5, Wander: 0.25 } as const;
const Branch = { Count: 10, FirstShare: 0.25, Length: [1.3, 3.6], Radius: 0.1, TipRadius: 0.018, Sides: 6, DrownedShare: 0.2 } as const;
const Twig = { PerBranch: 3, FromShare: 0.55, Length: [0.5, 1.1], Radius: 0.028, TipRadius: 0.007, Sides: 4 } as const;
const Reach = { Dip: [0.3, 0.7], Rise: [0.5, 1.3], Out: [0.15, 0.6], Side: [0.3, 1.1] } as const;
const Sides = [-1, 1];
const Up = new Vector3(0, 1, 0);

export function limbBetween(from: Vector3, to: Vector3, fromRadius: number, toRadius: number, sides: number): BufferGeometry {
	const direction = to.clone().sub(from);
	const length = direction.length();
	const turn = new Quaternion().setFromUnitVectors(Up, direction.normalize());
	return new CylinderGeometry(toRadius, fromRadius, length, sides, 1, false).translate(0, length / 2, 0).applyQuaternion(turn).translate(from.x, from.y, from.z);
}

export function trunkPoints(lie: TrunkLie, random: RandomFraction) {
	return Array.from({ length: Trunk.Joints + 1 }, (_, joint) => {
		const along = joint / Trunk.Joints;
		const wander = joint === 0 ? 0 : (random() - 0.5) * Trunk.Wander;
		return new Vector3(along * lie.length, lie.rise - (lie.rise + lie.sink) * along * along, wander);
	});
}

function pointOnTrunk(trunk: Vector3[], along: number) {
	const place = along * (trunk.length - 1);
	const joint = Math.min(trunk.length - 2, Math.floor(place));
	return trunk[joint].clone().lerp(trunk[joint + 1], place - joint);
}

function reachingDirection(random: RandomFraction) {
	const isDrowned = random() < Branch.DrownedShare;
	const side = pickRandom(random, Sides);
	const rise = isDrowned ? -randomBetween(random, ...Reach.Dip) : randomBetween(random, ...Reach.Rise);
	return new Vector3(randomBetween(random, ...Reach.Out), rise, side * randomBetween(random, ...Reach.Side)).normalize();
}

function twigsOf(from: Vector3, to: Vector3, random: RandomFraction) {
	return Array.from({ length: Twig.PerBranch }, () => {
		const start = from.clone().lerp(to, Twig.FromShare + random() * (1 - Twig.FromShare) * 0.7);
		const end = start.clone().add(reachingDirection(random).multiplyScalar(randomBetween(random, ...Twig.Length)));
		return limbBetween(start, end, Twig.Radius, Twig.TipRadius, Twig.Sides);
	});
}

const Roots = { Count: 11, Reach: [0.7, 1.4], Back: [0.1, 0.5], Radius: 0.11, TipRadius: 0.015, Sides: 5 } as const;

export function rootsOf(base: Vector3, random: RandomFraction) {
	return Array.from({ length: Roots.Count }, (_, index) => {
		const turn = (index / Roots.Count) * Math.PI * 2 + random() * (Math.PI / Roots.Count);
		const reach = randomBetween(random, ...Roots.Reach);
		const end = base.clone().add(new Vector3(-randomBetween(random, ...Roots.Back), Math.sin(turn) * reach, Math.cos(turn) * reach));
		return limbBetween(base, end, Roots.Radius, Roots.TipRadius, Roots.Sides);
	});
}

export function branchesOf(trunk: Vector3[], random: RandomFraction) {
	return Array.from({ length: Branch.Count }, (_, index) => {
		const along = Branch.FirstShare + (index / Branch.Count) * (1 - Branch.FirstShare);
		const from = pointOnTrunk(trunk, along);
		const to = from.clone().add(reachingDirection(random).multiplyScalar(randomBetween(random, ...Branch.Length) * (1 - along * 0.4)));
		return [limbBetween(from, to, Branch.Radius * (1.2 - along * 0.5), Branch.TipRadius, Branch.Sides), ...twigsOf(from, to, random)];
	}).flat();
}
