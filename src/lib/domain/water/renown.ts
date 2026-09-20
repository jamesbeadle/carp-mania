import { clampReputation, driftReputationForOneDay } from '../reputation';
import { DemandTerms } from './demand';
import { speciesReputationBonus, type LakeSpecies } from './species';
import { Draw, stockRenownOf } from './stockDraw';

export interface RenownToday {
	stockDraw: number;
	turnedAway: number;
	species: Pick<LakeSpecies, 'species' | 'count'>[];
}

export function driftReputationTowardsRenown(reputation: number, waterQuality: number, today: RenownToday) {
	const drifted = driftReputationForOneDay(reputation, waterQuality);
	const renown = stockRenownOf(today.stockDraw) + speciesReputationBonus(today.species);
	const pull = Math.sign(renown - drifted) * Math.min(Draw.RenownDriftPerDay, Math.abs(renown - drifted));
	const turnedAwayLoss = today.turnedAway > 0 ? DemandTerms.TurnedAwayReputationPerDay : 0;
	return clampReputation(drifted + pull - turnedAwayLoss);
}
