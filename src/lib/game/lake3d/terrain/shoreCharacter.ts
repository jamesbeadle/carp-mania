import { MathUtils } from 'three';
import { broadNoise } from './landNoise';

export interface ShoreCharacter {
	steepness: number;
	riseMetres: number;
	shelfMetres: number;
	plateauMetres: number;
	dropOff: number;
}

const Stretches = { SteepMetres: 64, ShelfMetres: 85, DropOffMetres: 57, PlateauMetres: 41 } as const;
const Seeds = { Steep: 11, Shelf: 23, DropOff: 37, Plateau: 51 } as const;
const Rise = { Gentlest: 3.2, Steepest: 0.55 } as const;
const Shelf = { Shortest: 2.4, Longest: 13 } as const;
const Plateau = { Shortest: 1.2, Longest: 4 } as const;
const Thresholds = { SteepFrom: 0.36, SteepTo: 0.62, DropOffFrom: 0.52, DropOffTo: 0.78 } as const;

export const MostRiseMetres = Rise.Gentlest;
export const LongestShelfMetres = Shelf.Longest;

export function shoreCharacterAt(x: number, z: number): ShoreCharacter {
	const steepness = MathUtils.smoothstep(broadNoise(x, z, Stretches.SteepMetres, Seeds.Steep), Thresholds.SteepFrom, Thresholds.SteepTo);
	const shelfShare = broadNoise(x, z, Stretches.ShelfMetres, Seeds.Shelf);
	const dropOff = MathUtils.smoothstep(broadNoise(x, z, Stretches.DropOffMetres, Seeds.DropOff), Thresholds.DropOffFrom, Thresholds.DropOffTo);
	const plateauShare = broadNoise(x, z, Stretches.PlateauMetres, Seeds.Plateau);
	return {
		steepness,
		riseMetres: MathUtils.lerp(Rise.Gentlest, Rise.Steepest, steepness),
		shelfMetres: MathUtils.lerp(Shelf.Shortest, Shelf.Longest, shelfShare),
		plateauMetres: MathUtils.lerp(Plateau.Shortest, Plateau.Longest, plateauShare),
		dropOff
	};
}
