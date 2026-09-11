import { layoutScaleFor } from '../layout/layoutScale';
import type { LayoutPoint } from '../layout/layoutTypes';
import { waterInFrontOfSwim } from '../layout/swimRules';
import { terrainAt, type Terrain } from '../layout/terrainAt';
import type { Lake, Swim } from '../types';

export function castTerrainFor(lake: Pick<Lake, 'layout' | 'plot_acres'>, castPoint: LayoutPoint): Terrain {
	return terrainAt(lake.layout, layoutScaleFor(Number(lake.plot_acres)), castPoint);
}

export function terrainInFrontOfSwim(lake: Pick<Lake, 'layout' | 'plot_acres'>, swim: Pick<Swim, 'position_x' | 'position_y'>): Terrain {
	const scale = layoutScaleFor(Number(lake.plot_acres));
	return terrainAt(lake.layout, scale, waterInFrontOfSwim(lake.layout, scale, swim));
}

export function describeTerrain(terrain: Terrain, bedLabels: Record<string, string>, featureLabels: Record<string, string>) {
	return `${featureLabels[terrain.feature]} · ${bedLabels[terrain.bed].toLowerCase()} · ${terrain.depthFeet} ft`;
}
