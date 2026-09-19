import { seededRandom } from '../random';
import type { Carp } from '../types';
import { SpeciesCatalogue, SpeciesNames, type LakeSpecies, type Species } from './species';

export const NuisanceFish = { IdPrefix: 'nuisance:', WeightSpread: 0.4, Condition: 70 } as const;
const NuisanceSalt = 613;

type Counted = Pick<LakeSpecies, 'species' | 'count'>;

export function isNuisanceFish(carp: Pick<Carp, 'id'>) {
	return carp.id.startsWith(NuisanceFish.IdPrefix);
}

export function nuisanceSpeciesFor(species: Counted[], roll: number): Species {
	const weighted = species.filter((line) => line.count > 0).map((line) => ({ species: line.species, weight: line.count * SpeciesCatalogue[line.species].nuisance }));
	const total = weighted.reduce((sum, line) => sum + line.weight, 0);
	if (total === 0) return SpeciesNames[0];
	let remaining = roll * total;
	for (const line of weighted) {
		remaining -= line.weight;
		if (remaining <= 0) return line.species;
	}
	return weighted[weighted.length - 1].species;
}

export function nuisanceFishFor(lakeId: string, species: Counted[], seed: number, rodIndex: number, hour: number): Carp {
	const random = seededRandom(seed * NuisanceSalt + rodIndex * 97 + hour);
	const kind = nuisanceSpeciesFor(species, random());
	const profile = SpeciesCatalogue[kind];
	const spread = 1 + (random() * 2 - 1) * NuisanceFish.WeightSpread;
	return {
		id: `${NuisanceFish.IdPrefix}${kind}:${rodIndex}:${hour}`,
		lake_id: lakeId,
		name: `A ${profile.label.toLowerCase()}`,
		strain: 'common',
		weight_lb: Math.round(profile.typicalLb * spread * 4) / 4,
		age_years: 3,
		condition: NuisanceFish.Condition,
		times_caught: 0,
		origin: 'wild',
		origin_lake_id: lakeId,
		fame: 0,
		is_catalogued: false,
		transit_until: null,
		quarantine_until: null
	};
}

export function nuisanceWords(fish: Pick<Carp, 'name' | 'weight_lb'>) {
	return `${fish.name} of ${fish.weight_lb} lb — it pulled like a wet sack. Back it goes; it does not count.`;
}
