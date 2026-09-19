import { runFightScenarios } from './testFight';
import { runRatingScenarios } from './testRating';
import { runRigScenarios } from './testRigs';
import { runSizeReachScenarios } from './testSizeReach';
import { runTackleScenarios } from './testTackle';
import { runTicketScenarios } from './testTickets';

export function runDesignEightScenarios() {
	runRatingScenarios();
	runSizeReachScenarios();
	runFightScenarios();
	runTackleScenarios();
	runRigScenarios();
	runTicketScenarios();
}
