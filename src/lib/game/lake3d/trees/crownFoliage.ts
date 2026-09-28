import type { BufferGeometry, Color } from 'three';
import { seededRandom, type RandomFraction } from '$lib/domain/random';
import { writeClump, type FoliageContext } from './clumpFoliage';
import { crownVolumeOf } from './crownShading';
import type { FoliageStyle } from './foliageStyles';
import { writeCurtain, writeSpray } from './hangingFoliage';
import { leafWriter } from './leafCards';
import type { LeafSite, Skeleton } from './treeSkeleton';

export interface FoliageDetail {
	siteStride: number;
	cardShare: number;
}

const WidestMargin = 0.08;
const Forms = { clump: writeClump, curtain: writeCurtain, spray: writeSpray } as const;

function strided(sites: LeafSite[], stride: number) {
	return sites.filter((_, index) => index % stride === 0);
}

export function foliageGeometry(skeleton: Skeleton, style: FoliageStyle, detail: FoliageDetail, tint: (random: RandomFraction) => Color, seed: number): BufferGeometry {
	const random = seededRandom(seed);
	const writer = leafWriter();
	const volume = crownVolumeOf(skeleton.sites, Math.min(style.clumpRadius, WidestMargin));
	const longestReach = Math.max(...skeleton.sites.map((site) => site.reach));
	const cards = Math.max(1, Math.round(style.cards * detail.cardShare));
	const occlusion = 1 / Math.cbrt(detail.siteStride);
	const context: FoliageContext = { style, volume, random, cards, growth: Math.cbrt(detail.siteStride / detail.cardShare), longestReach, occlusion, tint: () => tint(random) };
	strided(skeleton.sites, detail.siteStride).forEach((site) => Forms[style.form](writer, site, context));
	return writer.build();
}
