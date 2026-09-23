import assert from 'node:assert/strict';
import { AnglerName, anglerNameRuleWords, isAnglerName } from '../src/lib/domain/anglerName';

export function runAnglerNameScenarios() {
	assert.ok(isAnglerName('James'), 'a first name is an angler name');
	assert.ok(isAnglerName('CarpDad99'), 'letters and numbers are fine');
	assert.ok(!isAnglerName('Carp Dad'), 'no spaces');
	assert.ok(!isAnglerName('Jo'), `shorter than ${AnglerName.ShortestLength} is refused`);
	assert.ok(!isAnglerName('A'.repeat(AnglerName.LongestLength + 1)), `longer than ${AnglerName.LongestLength} is refused`);
	assert.ok(!isAnglerName('james@example.com'), 'no emails');
	assert.ok(anglerNameRuleWords().includes('no spaces'), 'the rule is said in words');
	console.log('angler name:', { rule: anglerNameRuleWords() });
}
