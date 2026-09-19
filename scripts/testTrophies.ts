import assert from 'node:assert/strict';
import type { Measures } from '../src/lib/contracts/TrophyRoom';
import { edgeOf, toBeatWords } from '../src/lib/domain/trophies/measureUp';
import { isMilestoneKind, MilestoneCatalogue, MilestoneKinds } from '../src/lib/domain/trophies/milestones';
import { isRecordScope, recordScopeNameFor } from '../src/lib/domain/trophies/recordScopes';
import { bestRibbonOf, RibbonWords } from '../src/lib/domain/trophies/ribbons';

export function runTrophyScenarios() {
	const measures = (personalBestLb: number): Measures => ({ personalBestLb, fishLanded: 10, rating: 40, recordsHeld: 0, trophies: 0 });
	assert.equal(edgeOf(30, 20), 'ahead');
	assert.equal(edgeOf(20, 20), 'level');
	assert.equal(edgeOf(10, 20), 'behind');
	assert.equal(toBeatWords('Sam', measures(24.5), measures(28)), "3 lb 8 oz to beat Sam's best.");
	assert.equal(toBeatWords('Sam', measures(30), measures(28)), "Your best beats Sam's by 2 lb. Keep it that way.");
	assert.equal(toBeatWords('Sam', measures(28), measures(28)), 'Level on personal bests. One ounce settles it.');
	assert.match(toBeatWords('Sam', measures(0), measures(0)), /nothing on the bank yet/, 'an empty rival is an open door');

	assert.equal(MilestoneKinds.length, Object.keys(MilestoneCatalogue).length, 'every milestone has its words');
	assert.ok(isMilestoneKind('forty') && !isMilestoneKind('sixty'));
	assert.equal(MilestoneCatalogue.first_record.label, 'First record');

	assert.equal(recordScopeNameFor('region', 'uk_ireland'), 'UK & Ireland', 'a region record names the region');
	assert.equal(recordScopeNameFor('lake', 'Willow Pool'), 'Willow Pool');
	assert.equal(recordScopeNameFor('world', 'the world'), 'the world');
	assert.ok(isRecordScope('lake') && !isRecordScope('pond'));
	assert.equal(bestRibbonOf(['region_record', 'lake_record', 'personal_best']), 'region_record', 'the widest honour leads');
	assert.equal(bestRibbonOf([]), null);
	assert.equal(RibbonWords.personal_best, 'Personal best');
	console.log('trophies:', { milestones: MilestoneKinds.length });
}
