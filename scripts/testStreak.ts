import assert from 'node:assert/strict';
import { Streak, streakBiteFactor, streakDaysOf, streakWords } from '../src/lib/domain/fishing/streak';

const Today = '2026-09-20T10:18:00Z';

export function runStreakScenarios() {
	assert.equal(streakDaysOf([], Today), 1, 'a first visit is day one');
	assert.equal(streakDaysOf([Today], Today), 1, "today's own ticket is day one");
	assert.equal(streakDaysOf(['2026-09-19T20:00:00Z', Today], Today), 2, 'yesterday and today make two');
	assert.equal(streakDaysOf(['2026-09-17T08:00:00Z', '2026-09-18T23:59:00Z', '2026-09-19T06:00:00Z', Today], Today), 4, 'four days in a row');
	assert.equal(streakDaysOf(['2026-09-17T08:00:00Z', '2026-09-19T06:00:00Z', Today], Today), 2, 'a missed day resets the streak');
	assert.equal(streakDaysOf(['2026-09-19T06:00:00Z', '2026-09-19T18:00:00Z', Today], Today), 2, 'two tickets in a day count once');
	assert.equal(streakBiteFactor(1), 1, 'day one is normal');
	assert.equal(streakBiteFactor(2), 1 + Streak.BitesPerDay, 'day two earns the first step');
	assert.equal(streakBiteFactor(Streak.MostDays), streakBiteFactor(Streak.MostDays + 3), 'the streak tops out');
	assert.ok(streakWords(3).includes('Day 3'), 'the words name the day');
	console.log('streak:', { dayOne: streakBiteFactor(1), dayFive: streakBiteFactor(5), words: streakWords(3) });
}
