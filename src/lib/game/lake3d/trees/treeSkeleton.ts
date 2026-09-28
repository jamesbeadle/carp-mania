import { Vector3 } from 'three';
import { seededRandom, type RandomFraction } from '$lib/domain/random';
import type { BranchLevel, Habit } from './habitTypes';
import { centredRandom } from './centredRandom';
import { deviate, randomUnit, sampleLimb, UpAxis, type Limb } from './limbPaths';

export type { BranchLevel, Habit } from './habitTypes';

export interface LeafSite {
	at: Vector3;
	heading: Vector3;
	reach: number;
}

export interface Skeleton {
	limbs: Limb[];
	sites: LeafSite[];
}

interface Growth {
	levels: BranchLevel[];
	habit: Habit;
	random: RandomFraction;
	skeleton: Skeleton;
	azimuth: number;
}

const GoldenAngle = Math.PI * (3 - Math.sqrt(5));
const Jitter = { Spacing: 0.7, Azimuth: 0.9, Angle: 0.35, Length: 0.4, SitesFrom: 0.3, SitesSpan: 0.6, BranchSitesFrom: 0.45, BranchSitesSpan: 0.5 } as const;

function traceLimb(growth: Growth, start: Vector3, heading: Vector3, length: number, radius: number, levelIndex: number): Limb {
	const level = growth.levels[levelIndex];
	const points = [start.clone()];
	const radii = [radius];
	const direction = heading.clone();
	const step = length / level.segments;
	for (let segment = 1; segment <= level.segments; segment++) {
		direction.addScaledVector(randomUnit(growth.random), level.wander / level.segments).addScaledVector(UpAxis, level.bend / level.segments).normalize();
		points.push(points[segment - 1].clone().addScaledVector(direction, step));
		radii.push(radius * (1 - ((1 - level.taper) * segment) / level.segments));
	}
	return { points, radii, level: levelIndex };
}

function plantAlong(growth: Growth, limb: Limb, length: number, count: number, from: number, span: number) {
	const { random, skeleton } = growth;
	for (let index = 0; index < count; index++) {
		const along = from + (span * (index + random())) / count;
		const sample = sampleLimb(limb, along);
		skeleton.sites.push({ at: sample.point, heading: sample.direction, reach: length * (1 - along / 2) });
	}
}

function plantSites(growth: Growth, limb: Limb, length: number) {
	const tip = sampleLimb(limb, 1);
	const { skeleton, habit } = growth;
	skeleton.sites.push({ at: tip.point, heading: tip.direction, reach: length });
	plantAlong(growth, limb, length, habit.sitesAlong, Jitter.SitesFrom, Jitter.SitesSpan);
}

function growLimb(growth: Growth, start: Vector3, heading: Vector3, length: number, radius: number, levelIndex: number) {
	const limb = traceLimb(growth, start, heading, length, radius, levelIndex);
	const { skeleton } = growth;
	skeleton.limbs.push(limb);
	const next = growth.levels[levelIndex + 1];
	if (!next) return plantSites(growth, limb, length);
	const { random, habit, levels } = growth;
	if (levelIndex === levels.length - 2) plantAlong(growth, limb, length, habit.sitesOnBranches, Jitter.BranchSitesFrom, Jitter.BranchSitesSpan);
	for (let index = 0; index < next.count; index++) {
		const along = next.from + ((next.to - next.from) * (index + 1 / 2 + centredRandom(random) * Jitter.Spacing)) / next.count;
		const sample = sampleLimb(limb, along);
		growth.azimuth += GoldenAngle + centredRandom(random) * Jitter.Azimuth;
		const childHeading = deviate(sample.direction, next.angle * (1 + centredRandom(random) * Jitter.Angle), growth.azimuth);
		const reach = next.reach ? next.reach(along) : 1;
		const childLength = length * next.length * reach * (1 + centredRandom(random) * Jitter.Length);
		growLimb(growth, sample.point, childHeading, childLength, sample.radius * next.radius, levelIndex + 1);
	}
}

function crownTheLeader(skeleton: Skeleton) {
	const { limbs, sites } = skeleton;
	const tip = sampleLimb(limbs[0], 1);
	const reach = Math.max(...sites.map((site) => site.reach));
	sites.unshift({ at: tip.point, heading: tip.direction, reach });
}

export function growSkeleton(habit: Habit, seed: number): Skeleton {
	const random = seededRandom(seed);
	const growth: Growth = { levels: [habit.trunk, ...habit.levels], habit, random, skeleton: { limbs: [], sites: [] }, azimuth: random() * Math.PI * 2 };
	const { trunk } = habit;
	growLimb(growth, new Vector3(0, 0, 0), UpAxis.clone(), trunk.length, trunk.radius, 0);
	if (habit.hasLeader) crownTheLeader(growth.skeleton);
	return growth.skeleton;
}
