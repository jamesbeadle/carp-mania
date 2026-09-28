import { Vector3, type Color } from 'three';
import type { RandomFraction } from '$lib/domain/random';
import { crownNormal, crownShade, shadedColour, type CrownVolume } from './crownShading';
import { AtlasRegions } from './foliageAtlas';
import type { FoliageStyle } from './foliageStyles';
import type { GeometryWriter } from './geometryWriter';
import { writeCard, type ShadeLeaf } from './leafCards';
import { deviate, randomUnit, UpAxis } from './limbPaths';
import type { LeafSite } from './treeSkeleton';

export interface FoliageContext {
	style: FoliageStyle;
	volume: CrownVolume;
	random: RandomFraction;
	cards: number;
	growth: number;
	longestReach: number;
	occlusion: number;
	tint: () => Color;
}

const Clump = { Scatter: 0.6, Outward: 0.9, Randomness: 0.75, SmallestReach: 0.75, ReachGain: 0.5 } as const;

export function clumpShading(context: FoliageContext, centre: Vector3, radius: number, cardNormal: Vector3, tint: Color): ShadeLeaf {
	const { volume, occlusion } = context;
	return (position) => ({ normal: crownNormal(volume, position, centre, cardNormal), colour: shadedColour(tint, Math.pow(crownShade(volume, position, centre, radius), occlusion)) });
}

export function writeClump(writer: GeometryWriter, site: LeafSite, context: FoliageContext) {
	const { style, random, volume } = context;
	const radius = style.clumpRadius * context.growth * (Clump.SmallestReach + (Clump.ReachGain * site.reach) / context.longestReach);
	const tint = context.tint();
	const outward = site.at.clone().sub(volume.centre).normalize();
	for (let card = 0; card < context.cards; card++) {
		const offset = randomUnit(random).multiplyScalar(Math.cbrt(random()) * radius * Clump.Scatter);
		const centre = site.at.clone().add(offset.setY(offset.y * style.flatten));
		const normal = outward.clone().multiplyScalar(Clump.Outward).addScaledVector(randomUnit(random), Clump.Randomness).addScaledVector(UpAxis, style.upward).normalize();
		const half = (radius * style.cardSize) / 2;
		const across = deviate(normal, Math.PI / 2, random() * Math.PI * 2).multiplyScalar(half);
		const down = new Vector3().crossVectors(normal, across).normalize().multiplyScalar(half);
		writeCard(writer, { centre, across, down, region: AtlasRegions[style.region], order: random(), spin: random() * Math.PI * 2 }, clumpShading(context, site.at, radius, normal, tint));
	}
}
