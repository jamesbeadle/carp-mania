import { Vector3, type BufferGeometry, type Color } from 'three';
import { seededRandom, type RandomFraction } from '$lib/domain/random';
import { writeClump, type FoliageContext } from './clumpFoliage';
import { crownVolumeOf, type CrownVolume } from './crownShading';
import type { FoliageStyle } from './foliageStyles';
import { writeCurtain } from './hangingFoliage';
import { leafWriter, markBounds } from './leafCards';
import { siteCrowding } from './siteCrowding';
import type { LeafSite, Skeleton } from './treeSkeleton';

export interface FoliageDetail {
	siteStride: number;
	cardShare: number;
	hasFineLeaves: boolean;
}

const WidestMargin = 0.08;
const GrowthPower = 0.4;
const Bounds = { CardReach: 1.5, Sway: 0.12 } as const;
const Forms = { clump: writeClump, curtain: writeCurtain } as const;

function strided(sites: LeafSite[], stride: number) {
	return sites.filter((_, index) => index % stride === 0);
}

function boundsOf(volume: CrownVolume, style: FoliageStyle, growth: number) {
	const reach = style.clumpRadius * growth * style.cardSize * style.aspect * Bounds.CardReach + Bounds.Sway;
	const margin = volume.radii.clone().addScalar(reach);
	return { least: volume.centre.clone().sub(margin).setY(0), most: volume.centre.clone().add(margin) };
}

export function foliageGeometry(skeleton: Skeleton, style: FoliageStyle, detail: FoliageDetail, tint: (random: RandomFraction) => Color, seed: number): BufferGeometry {
	const random = seededRandom(seed);
	const writer = leafWriter();
	const volume = crownVolumeOf(skeleton.sites, Math.min(style.clumpRadius, WidestMargin));
	const longestReach = Math.max(...skeleton.sites.map((site) => site.reach));
	const cards = Math.max(1, Math.round(style.cards * detail.cardShare));
	const siteStride = Math.min(detail.siteStride, style.mostStride);
	const occlusion = 1 / Math.cbrt(siteStride);
	const growth = Math.pow(siteStride / detail.cardShare, GrowthPower);
	const sites = strided(skeleton.sites, siteStride);
	const crowding = siteCrowding(skeleton.sites, style.clumpRadius);
	const region = detail.hasFineLeaves ? style.fineRegion : style.region;
	const context: FoliageContext = { style: { ...style, region }, volume, random, cards, growth, longestReach, occlusion, crowding, tint: () => tint(random) };
	sites.forEach((site) => Forms[style.form](writer, site, context));
	const bounds = boundsOf(volume, style, growth);
	markBounds(writer, bounds.least, bounds.most);
	return writer.build();
}


export function emptyFoliage(): BufferGeometry {
	const writer = leafWriter();
	const origin = new Vector3();
	markBounds(writer, origin, origin);
	return writer.build();
}
