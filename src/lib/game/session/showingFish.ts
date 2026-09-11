import { favouriteSpotOf, type FavouriteSpot } from '$lib/domain/layout/favouriteFeature';
import { layoutScaleFor } from '$lib/domain/layout/layoutScale';
import { isAreaFeature, isReedLine, isSnag, type AreaFeatureKind, type LakeLayout, type LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { polygonCentroid } from '$lib/domain/layout/polygonArea';
import { lakeCentroid, pointFeetTowardsCentre } from '$lib/domain/layout/waterArea';
import { pickRandom, type RandomFraction } from '$lib/domain/random';
import type { Carp, Lake, SwimFeature } from '$lib/domain/types';
import type { Season } from '$lib/domain/world/seasons';
import { polylineMidpoint } from './polylineMidpoint';

export const WatercraftShowsFishFrom = 50;
export const ShowingFish = { MostAtOnce: 3, RefreshSeconds: 20, OffTheIslandFeet: 20 } as const;

type Water = Pick<Lake, 'layout' | 'plot_acres'>;
type SeasonOfYear = Pick<Season, 'isWinter'>;
type SpotFinder = (water: Water, random: RandomFraction) => LayoutPoint | null;

export function showingSpotsFor(water: Water, carp: Carp[], season: SeasonOfYear, random: RandomFraction = Math.random): LayoutPoint[] {
	const catalogued = carp.filter((fish) => fish.is_catalogued);
	const showing = pickSome(catalogued, ShowingFish.MostAtOnce, random);
	return showing.map((fish) => spotFor(water, favouriteSpotOf(fish, water.layout, season.isWinter), random));
}

export function watchFishShowing(water: Water, carp: Carp[], season: SeasonOfYear, onShowing: (spots: LayoutPoint[]) => void) {
	const refresh = () => onShowing(showingSpotsFor(water, carp, season));
	refresh();
	const interval = setInterval(refresh, ShowingFish.RefreshSeconds * 1000);
	return () => clearInterval(interval);
}

const SpotFinders: Record<SwimFeature, SpotFinder> = {
	open_water: (water) => lakeCentroid(water.layout),
	island_margin: offTheFirstIsland,
	snag: (water, random) => pickOne(water.layout.features.filter(isSnag), random)?.point ?? null,
	reed_line: (water, random) => midpointOfOne(water.layout.features.filter(isReedLine), random),
	gravel_bar: (water, random) => centreOfOneArea(water.layout, 'gravel_bar', random),
	weed_bed: (water, random) => centreOfOneArea(water.layout, 'weed_bed', random),
	lily_pads: (water, random) => centreOfOneArea(water.layout, 'lily_pads', random)
};

function spotFor(water: Water, favourite: FavouriteSpot, random: RandomFraction): LayoutPoint {
	if (favourite.kind === 'depth_zone') return depthZoneCentre(water.layout, favourite.zoneId);
	return SpotFinders[favourite.feature](water, random) ?? lakeCentroid(water.layout);
}

function depthZoneCentre(layout: LakeLayout, zoneId: string) {
	const zone = layout.depthZones.find((candidate) => candidate.id === zoneId);
	return zone ? polygonCentroid(zone.points) : lakeCentroid(layout);
}

function offTheFirstIsland(water: Water) {
	const island = water.layout.islands[0];
	if (!island) return null;
	return pointFeetTowardsCentre(water.layout, layoutScaleFor(Number(water.plot_acres)), island.points[0], ShowingFish.OffTheIslandFeet);
}

function centreOfOneArea(layout: LakeLayout, kind: AreaFeatureKind, random: RandomFraction) {
	const areas = layout.features.filter(isAreaFeature).filter((area) => area.kind === kind);
	const area = pickOne(areas, random);
	return area ? polygonCentroid(area.points) : null;
}

function midpointOfOne(shapes: { points: LayoutPoint[] }[], random: RandomFraction) {
	const shape = pickOne(shapes, random);
	return shape ? polylineMidpoint(shape.points) : null;
}

function pickOne<Item>(items: Item[], random: RandomFraction): Item | null {
	return items.length === 0 ? null : pickRandom(random, items);
}

function pickSome<Item>(items: Item[], count: number, random: RandomFraction): Item[] {
	const remaining = [...items];
	const picked: Item[] = [];
	while (picked.length < count && remaining.length > 0) picked.push(...remaining.splice(Math.floor(random() * remaining.length), 1));
	return picked;
}
