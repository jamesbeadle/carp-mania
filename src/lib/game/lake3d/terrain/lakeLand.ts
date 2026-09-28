import { Group } from 'three';
import type { BedType } from '$lib/domain/types';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { WorldPoint } from '../lakeFrame';
import { slabSides } from '../lakeGround';
import { createCountryside } from './countryMesh';
import { CountryShape } from './countryShape';
import { FieldPattern } from './fieldPattern';
import { fieldTexture } from './fieldTexture';
import { meadowOf } from './terrainColours';
import { createTerrainMesh } from './terrainMesh';
import { TerrainShape } from './terrainShape';

export interface LandPlan {
	outline: WorldPoint[];
	islands: WorldPoint[][];
	plotReach: number;
	plotEdge: WorldPoint | null;
	season: SeasonName;
	bed: BedType;
	bedDepth: number;
	seed: number;
}

export interface Country {
	shape: CountryShape;
	fields: FieldPattern;
}

const Grid = { ReachShare: 1.6, MetresPerCell: 1.7, MostCells: 420, DioramaMetresPerCell: 1.2 } as const;

function countryAround(plan: LandPlan, edgeHalf: number): Country {
	return { shape: new CountryShape(edgeHalf), fields: new FieldPattern(plan.seed) };
}

function countrysideOf(country: Country, plan: LandPlan) {
	const fields = fieldTexture(country.fields, plan.season, plan.seed);
	return createCountryside(country.shape, fields, meadowOf(plan.season));
}

export function createLakeLand(plan: LandPlan) {
	const half = plan.plotEdge ?? { x: plan.plotReach * Grid.ReachShare, z: plan.plotReach * Grid.ReachShare };
	const shape = new TerrainShape({ outline: plan.outline, islands: plan.islands, bedDepth: plan.bedDepth, isFlatBeyond: plan.plotEdge !== null, edgeMetres: Math.max(half.x, half.z) });
	const metresPerCell = plan.plotEdge ? Grid.DioramaMetresPerCell : Grid.MetresPerCell;
	const terrain = createTerrainMesh(shape, { width: half.x * 2, depth: half.z * 2, metresPerCell, mostCells: Grid.MostCells }, plan);
	const group = new Group().add(terrain);
	const country = plan.plotEdge ? null : countryAround(plan, half.x);
	group.add(country ? countrysideOf(country, plan) : slabSides(half, plan.bedDepth));
	const groundAt = (point: WorldPoint) => (country?.shape.isBeyondThePlot(point) ? country.shape.heightAt(point) : shape.heightAt(point));
	return { group, groundAt, country };
}
