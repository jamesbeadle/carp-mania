import { LongestShelfMetres, MostRiseMetres } from './shoreCharacter';
import { Shore } from './shoreProfile';

export interface ShoreBand {
	landCore: number;
	waterCore: number;
	fade: number;
	landReach: number;
	waterReach: number;
	sinkMetres: number;
}

const Margin = { Metres: 1, Sink: 1.2, SunkShelfShare: 0.5 } as const;

export function shoreBandFor(gridCellMetres: number): ShoreBand {
	const diagonal = gridCellMetres * Math.SQRT2;
	const landCore = Math.max(MostRiseMetres, Shore.IslandRiseMetres) + diagonal;
	const waterCore = LongestShelfMetres * Margin.SunkShelfShare + diagonal;
	const beyondTheCore = gridCellMetres + diagonal + Margin.Metres;
	return { landCore, waterCore, fade: gridCellMetres, landReach: landCore + beyondTheCore, waterReach: waterCore + beyondTheCore, sinkMetres: Margin.Sink };
}
