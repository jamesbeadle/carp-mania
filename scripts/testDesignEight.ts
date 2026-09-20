import { runFightScenarios } from './testFight';
import { runRatingScenarios } from './testRating';
import { runRigScenarios } from './testRigs';
import { runSizeReachScenarios } from './testSizeReach';
import { runTackleScenarios } from './testTackle';
import { runBigWaterScenarios } from './testBigWater';
import { runCameraScenarios } from './testCamera';
import { runMakeUpScenarios } from './testMakeUp';
import { runAwardScenarios } from './testAwards';
import { runBountyScenarios } from './testBounties';
import { runShoalScenarios } from './testShoals';
import { runTicketScenarios } from './testTickets';

export function runDesignEightScenarios() {
	runRatingScenarios();
	runSizeReachScenarios();
	runFightScenarios();
	runTackleScenarios();
	runRigScenarios();
	runTicketScenarios();
	runShoalScenarios();
	runBigWaterScenarios();
	runCameraScenarios();
	runMakeUpScenarios();
	runAwardScenarios();
	runBountyScenarios();
}
