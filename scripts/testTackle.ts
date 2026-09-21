import assert from 'node:assert/strict';
import { BrandCatalogue, isTierAtOrBelow, tierUnlockedBy } from '../src/lib/domain/tackle/brands';
import { differencesFrom, itemEffectsOf, itemWordsOf } from '../src/lib/domain/tackle/itemEffects';
import { kitInUseFrom } from '../src/lib/domain/tackle/kitInUse';
import { BaseCastFeet, castDistanceFeet, pointWithinCast } from '../src/lib/domain/tackle/castDistance';
import { isCatalogueId, TackleCatalogue, tackleItemOfKind } from '../src/lib/domain/tackle/catalogue';
import { doesHookOpen, HookOpening, hookHoldChance, hookOpeningChance } from '../src/lib/domain/tackle/hooks';
import { lineVisibility, metresLostOnSnap } from '../src/lib/domain/tackle/lines';
import { tackleLostBy } from '../src/lib/domain/tackle/losses';
import { rodSnapChancePerSecond } from '../src/lib/domain/tackle/rods';
import { defaultRodSetup, kitFor, kitOf } from '../src/lib/domain/tackle/rodSetup';
import { shopTierFor } from '../src/lib/domain/tackle/shopTier';
import { StarterKit } from '../src/lib/domain/tackle/starterKit';
import { layoutScaleFor } from '../src/lib/domain/layout/layoutScale';

const TenAcres = 10;
const AboutOneInThreeSeconds = 1 / 70;

export function runTackleScenarios() {
	const ids = new Set(TackleCatalogue.map((item) => item.id));
	assert.equal(ids.size, TackleCatalogue.length, 'every catalogue id is unique');
	for (const line of StarterKit) assert.ok(isCatalogueId(line.itemId), `the starter kit's ${line.itemId} is in the catalogue`);
	assert.ok(kitOf(defaultRodSetup()), 'the starter setup resolves to a kit');
	assert.equal(tierUnlockedBy(24), 'starter', 'a rating of 24 unlocks only the starter tier');
	assert.equal(tierUnlockedBy(50), 'specialist', 'a rating of 50 unlocks the specialist tier');
	assert.ok(!isTierAtOrBelow('custom', 'specialist'), 'custom kit is not on the world shelves');
	const vellum = tackleItemOfKind('vellum_and_steel-line-18-clear', 'line');
	const cheap = tackleItemOfKind('bankside_basics-line-12-clear', 'line');
	assert.ok(vellum && cheap && lineVisibility(vellum.line) < lineVisibility(cheap.line), 'a custom brand\'s 18 lb is less visible than a cheap 12 lb');
	assert.equal(metresLostOnSnap(40), 60, 'a snap costs the cast and twenty metres');
	assertTheHooks();
	assertTheRods();
	assertTheEffects();
	assert.equal(shopTierFor(90, 90), 'custom', 'a superb water stocks custom kit');
	assert.equal(shopTierFor(20, 40), 'starter', 'a poor water stocks starter kit');
	console.log('tackle:', { items: TackleCatalogue.length });
}

function assertTheHooks() {
	const cheap = tackleItemOfKind('bankside_basics-hook-4-micro-matt', 'hook');
	const vellum = tackleItemOfKind('vellum_and_steel-hook-4-barbless-matt', 'hook');
	assert.ok(cheap && vellum, 'the hooks are on sale');
	assert.equal(hookOpeningChance(cheap.hook, 28), 0, 'a cheap hook holds a fish at its limit');
	assert.ok(hookOpeningChance(cheap.hook, 30) > 0 && hookOpeningChance(cheap.hook, 30) < 0.25, 'a cheap hook rarely opens on a fish just over its limit');
	assert.equal(hookOpeningChance(cheap.hook, 45), HookOpening.MostChance, 'a cheap hook opens at most six times in ten, however big the fish');
	assert.ok(doesHookOpen(cheap.hook, 45, 0.5) && !doesHookOpen(cheap.hook, 45, 0.7), 'the roll decides whether the hook opens');
	assert.equal(hookOpeningChance(vellum.hook, 80), 0, 'a chemically sharpened hook never opens');
	assert.ok(hookHoldChance(vellum.hook, 50) < hookHoldChance(vellum.hook, 70), 'barbless is mastered at rating 70');
	const barbed = tackleItemOfKind('vellum_and_steel-hook-4-barbed-matt', 'hook');
	assert.ok(barbed && hookHoldChance(vellum.hook, 70) === hookHoldChance(barbed.hook, 70), 'a mastered barbless holds like a barbed hook');
}

function assertTheRods() {
	const kit = kitFor(defaultRodSetup());
	assert.equal(rodSnapChancePerSecond(30, kit.rod.rod), 0, 'a rod inside its test curve never snaps');
	assert.ok(Math.abs(rodSnapChancePerSecond(45, kit.rod.rod) - AboutOneInThreeSeconds) < 0.001, 'a forty-five on a 2.75 is a one-in-seventy-a-second risk');
	assert.equal(castDistanceFeet(kit), BaseCastFeet, 'the starter kit casts the base distance');
	const bigPit = kitFor({ ...defaultRodSetup(), rod: 'marlow-rod-3-13', reel: 'marlow-reel-big_pit_entry' });
	assert.ok(castDistanceFeet(bigPit) > castDistanceFeet(kit), 'a 13 ft rod and a big pit cast further');
	const scale = layoutScaleFor(TenAcres);
	const landed = pointWithinCast({ x: 0.1, y: 0.5 }, { x: 0.9, y: 0.5 }, scale, BaseCastFeet);
	assert.ok(landed.x < 0.9 && landed.x > 0.1, 'a cast past the reach lands short on the same line');
	const lost = tackleLostBy('line_snapped', kit, 40);
	assert.equal(lost.length, 4, 'a snap costs line, rig, lead and hook');
}

function assertTheEffects() {
	const rod = tackleItemOfKind('north_ridge-rod-3.5-13', 'rod');
	const starterRod = tackleItemOfKind('bankside_basics-rod-2.75-12', 'rod');
	assert.ok(rod && starterRod, 'North Ridge and the starter rod are on sale');
	assert.equal(BrandCatalogue.north_ridge.tier, 'specialist', 'North Ridge is a specialist brand');
	const effects = itemEffectsOf(rod);
	assert.deepEqual(effects.map((one) => one.key), ['reach', 'landing', 'forgiveness'], 'a rod reads as reach, landing power and forgiveness');
	assert.equal(effects[1].share, 1, 'a 3.5 lb rod lands the heaviest fish in the game');
	const [biggest] = differencesFrom(rod, starterRod);
	assert.equal(biggest.label, 'Landing power', 'the biggest difference from the starter rod is landing power');
	assert.ok(biggest.percent > 0, 'and it is a gain');
	assert.deepEqual(differencesFrom(rod, null), [], 'nothing to compare with, nothing said');
	const never = tackleItemOfKind('quarryman-hook-4-micro-matt', 'hook');
	assert.ok(never && itemEffectsOf(never)[1].share === 1, 'a hook that never straightens has full strength');
	assert.ok(itemWordsOf(starterRod).includes('lands up to 35 lb'), 'the words say what the rod lands');
	assert.equal(kitInUseFrom([]).rod?.id, starterRod.id, 'with no saved rods the starter kit is what is in use');
}
