import { pickRandom, randomBetween, seededRandom, type RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { mostPlantsPerSquareMetre, SwimsReachMetres } from './coverDensity';
import { Plantings, type Planting } from './coverPlantings';
import { CoverPalettes } from './coverPalette';
import { CoverSites, type CoverGround, type CoverSite } from './coverSite';
import type { FieldArea } from './shoreField';
import type { PlantTint } from './plantTint';

export interface CoverPlant {
	point: WorldPoint;
	cell: number;
	height: number;
	width: number;
	lean: number;
	turn: number;
	tint: PlantTint;
	reach: number;
	isMarginal: boolean;
}

const Tile = { Metres: 8, NearestShore: -6, FarthestShore: 90 } as const;
const Tint = { Darkest: 0.72, Range: 0.34, DryHue: 0.035, DryLift: 0.1 } as const;
const TileDiagonal = Tile.Metres * Math.SQRT2;

interface Scattering {
	sites: CoverSites;
	flowerShare: number;
	density: number;
	mostDensity: number;
	random: RandomFraction;
}

function chosenPlanting(site: CoverSite, scattering: Scattering): Planting | null {
	const { flowerShare, random } = scattering;
	const densities = Plantings.map((planting) => planting.densityAt(site, flowerShare));
	const total = densities.reduce((sum, density) => sum + density, 0);
	if (random() * scattering.mostDensity > total) return null;
	let pick = random() * total;
	return Plantings.find((_, index) => (pick -= densities[index]) <= 0) ?? null;
}

function plantOf(planting: Planting, site: CoverSite, random: RandomFraction): CoverPlant {
	const height = randomBetween(random, ...planting.heights) * (0.75 + site.patch * 0.5);
	const dryness = Math.max(0, site.meadow - site.patch * 0.5);
	const tint = { shade: Tint.Darkest + random() * Tint.Range, warmth: dryness * Tint.DryLift };
	const width = height * randomBetween(random, ...planting.widthPerHeight);
	const lean = (random() - 1 / 2) * planting.lean * 2;
	const { reach, isMarginal } = planting;
	return { point: site.point, cell: pickRandom(random, planting.cells), height, width, lean, turn: random() * Math.PI, tint, reach, isMarginal };
}


function scatterTile(corner: WorldPoint, scattering: Scattering, into: CoverPlant[]) {
	const { sites, random } = scattering;
	const centre = { x: corner.x + Tile.Metres / 2, z: corner.z + Tile.Metres / 2 };
	const tile = sites.siteAt(centre);
	const isFarFromSwims = tile.fromPod - TileDiagonal > SwimsReachMetres;
	const facilities = sites.facilitiesNear(centre, TileDiagonal);
	scattering.mostDensity = mostPlantsPerSquareMetre(tile.fromPod - TileDiagonal, tile.shore, TileDiagonal);
	const candidates = Math.round(Tile.Metres * Tile.Metres * scattering.mostDensity * scattering.density);
	for (let index = 0; index < candidates; index++) {
		const point = { x: corner.x + random() * Tile.Metres, z: corner.z + random() * Tile.Metres };
		if (!sites.isBuildable(point, facilities)) continue;
		const site = sites.siteAt(point, isFarFromSwims);
		const planting = chosenPlanting(site, scattering);
		if (!planting) continue;
		into.push(plantOf(planting, site, random));
	}
}

export function scatterCover(ground: CoverGround, area: FieldArea, density: number) {
	const { least, most } = area;
	const { flowerShare } = CoverPalettes[ground.season];
	const scattering = { sites: new CoverSites(ground), flowerShare, density, mostDensity: 0, random: seededRandom(ground.seed) };
	const plants: CoverPlant[] = [];
	for (let x = least.x; x < most.x; x += Tile.Metres) {
		for (let z = least.z; z < most.z; z += Tile.Metres) {
			const shore = ground.shore.distanceAt({ x: x + Tile.Metres / 2, z: z + Tile.Metres / 2 });
			if (shore > Tile.NearestShore && shore < Tile.FarthestShore) scatterTile({ x, z }, scattering, plants);
		}
	}
	return plants;
}
