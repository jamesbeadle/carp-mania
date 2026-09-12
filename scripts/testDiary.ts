import assert from 'node:assert/strict';
import { diaryAgeOf, DiaryClock, isRetirementDue, isSlowingDown, ordinalOf, placeInTheLine, yearsLeftFor } from '../src/lib/domain/legacy/diary';

const Day = 24 * 60 * 60 * 1000;

export function runDiaryScenarios() {
	const started = new Date('2026-01-01T00:00:00Z');
	const fisherman = { born_age: 25, retires_at_age: 85, started_at: started.toISOString(), retired_at: null };
	assert.equal(diaryAgeOf(fisherman, started), 25, 'a fisherman starts at the age he was born with');
	assert.equal(diaryAgeOf(fisherman, new Date(started.getTime() + DiaryClock.RealDaysPerYear * Day)), 26, 'four real days is a diary year');
	assert.equal(diaryAgeOf(fisherman, new Date(started.getTime() + 3 * Day)), 25, 'three days is not yet a year');
	const nearly = new Date(started.getTime() + 56 * DiaryClock.RealDaysPerYear * Day);
	assert.equal(yearsLeftFor(fisherman, nearly), 4, 'at 81 there are four years left');
	assert.ok(isSlowingDown(fisherman, nearly) && !isRetirementDue(fisherman, nearly), 'the last five years are the slowing down');
	const due = new Date(started.getTime() + 60 * DiaryClock.RealDaysPerYear * Day);
	assert.ok(isRetirementDue(fisherman, due) && !isSlowingDown(fisherman, due), 'at 85 the handover is due');
	const retired = { ...fisherman, retired_at: due.toISOString() };
	assert.equal(diaryAgeOf(retired, new Date(due.getTime() + 400 * Day)), 85, 'a retired fisherman stops ageing');
	assert.ok(!isRetirementDue(retired, new Date(due.getTime() + 400 * Day)), 'a retired fisherman is never due again');
	assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 101].map(ordinalOf), ['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '101st'], 'ordinals read as English');
	assert.equal(placeInTheLine(1), 'first of the line');
	assert.equal(placeInTheLine(3), '3rd of the line');
	console.log('diary:', { yearsPerRealDay: 1 / DiaryClock.RealDaysPerYear });
}
