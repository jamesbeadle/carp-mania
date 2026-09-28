import { Vector3, type Color } from 'three';
import type { RandomFraction } from '$lib/domain/random';
import { crownDepth, crownNormal, crownShade, shadedColour, type CrownVolume } from './crownShading';
import { AtlasRegions } from './atlasRegions';
import type { FoliageStyle } from './foliageStyles';
import type { GeometryWriter } from './geometryWriter';
import { writeCard, type ShadeLeaf } from './leafCards';
import { centredRandom } from './centredRandom';
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
	crowding: (site: LeafSite) => number;
	tint: () => Color;
}

const Clump = { Scatter: 0.7, Outward: 0.9, Randomness: 0.75, SmallestReach: 0.75, ReachGain: 0.5, SizeJitter: 0.5, AspectJitter: 0.35 } as const;
const Silhouette = { From: 0.35, To: 0.9, InnerCards: 0.6, OuterCards: 1.3, InnerSize: 1.15, OuterSize: 0.85 } as const;
const NoAxis = new Vector3();

export function clumpShading(context: FoliageContext, centre: Vector3, radius: number, cardNormal: Vector3, tint: Color): ShadeLeaf {
	const { volume, occlusion } = context;
	return (position) => ({ normal: crownNormal(volume, position, centre, cardNormal), colour: shadedColour(tint, Math.pow(crownShade(volume, position, centre, radius), occlusion)) });
}

function outerShareOf(context: FoliageContext, site: LeafSite) {
	const depth = crownDepth(context.volume, site.at);
	return Math.min(1, Math.max(0, (depth - Silhouette.From) / (Silhouette.To - Silhouette.From)));
}

function pickOf<Item>(items: Item[], random: RandomFraction) {
	return items[Math.floor(random() * items.length) % items.length];
}

function writeOneCard(writer: GeometryWriter, site: LeafSite, context: FoliageContext, radius: number, tint: Color) {
	const { style, random, volume } = context;
	const offset = randomUnit(random).multiplyScalar(Math.cbrt(random()) * radius * Clump.Scatter);
	const centre = site.at.clone().add(offset.setY(offset.y * style.flatten));
	const outward = site.at.clone().sub(volume.centre).normalize();
	const normal = outward.multiplyScalar(Clump.Outward).addScaledVector(randomUnit(random), Clump.Randomness).addScaledVector(UpAxis, style.upward).normalize();
	const half = (radius * style.cardSize) / 2;
	const across = deviate(normal, Math.PI / 2, random() * Math.PI * 2).multiplyScalar(half);
	const aspect = style.aspect * (1 + centredRandom(random) * Clump.AspectJitter);
	const down = new Vector3().crossVectors(normal, across).normalize().multiplyScalar(half * aspect);
	const axis = style.isAlongBranch ? site.heading : NoAxis;
	centre.addScaledVector(axis, -half * aspect * style.tipInset);
	const card = { centre, across, down, region: pickOf(AtlasRegions[style.region], random), order: random(), spin: centredRandom(random) * style.spin * 2, axis };
	writeCard(writer, card, clumpShading(context, site.at, radius, normal, tint));
}

export function writeClump(writer: GeometryWriter, site: LeafSite, context: FoliageContext) {
	const { style, random } = context;
	const outerShare = outerShareOf(context, site);
	const crowding = context.crowding(site);
	const jitter = 1 + centredRandom(random) * Clump.SizeJitter;
	const sizeShare = Silhouette.InnerSize + (Silhouette.OuterSize - Silhouette.InnerSize) * outerShare;
	const radius = style.clumpRadius * context.growth * jitter * sizeShare * crowding * (Clump.SmallestReach + (Clump.ReachGain * site.reach) / context.longestReach);
	const cardShare = Silhouette.InnerCards + (Silhouette.OuterCards - Silhouette.InnerCards) * outerShare;
	const cards = Math.max(1, Math.round(context.cards * cardShare * crowding));
	const tint = context.tint();
	for (let card = 0; card < cards; card++) writeOneCard(writer, site, context, radius, tint);
}
