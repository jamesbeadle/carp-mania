import assert from 'node:assert/strict';
import { baitTrustScore } from '../src/lib/domain/fishing/baitTrust';
import { brightBaitFactor } from '../src/lib/domain/fishing/kitAgeFactor';
import { rigMatchScore } from '../src/lib/domain/fishing/rigMatch';
import type { Terrain } from '../src/lib/domain/layout/terrainAt';
import { emptyFeedStock } from '../src/lib/domain/feed';
import { pairingScore, PairingScore } from '../src/lib/domain/tackle/presentations';
import { RigCatalogue } from '../src/lib/domain/tackle/rigs';
import { isSetupOwned } from '../src/lib/domain/tackle/tackleBox';
import { defaultRodSetup } from '../src/lib/domain/tackle/rodSetup';

const GravelBar: Terrain = { bed: 'gravel', depthFeet: 4, feature: 'gravel_bar' };
const OpenSilt: Terrain = { bed: 'silt', depthFeet: 9, feature: 'open_water' };
const AnHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const NextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

export function runRigScenarios() {
	assert.ok(rigMatchScore('ronnie', GravelBar, 'pop_up') > rigMatchScore('helicopter', GravelBar, 'pop_up'), 'the Ronnie outscores the helicopter over a gravel bar');
	assert.ok(rigMatchScore('helicopter', OpenSilt, 'pop_up') > rigMatchScore('ronnie', OpenSilt, 'pop_up'), 'the helicopter outscores the Ronnie on open silt');
	assert.equal(pairingScore(RigCatalogue.hair_lead_clip, 'pop_up'), PairingScore.Wrong, 'a pop-up on a lead clip is the wrong pairing');
	assert.equal(pairingScore(RigCatalogue.chod, 'bottom'), PairingScore.Wrong, 'a bottom bait on a chod is the wrong pairing');
	assert.equal(pairingScore(RigCatalogue.ronnie, 'wafter'), PairingScore.Matched, 'a wafter on a Ronnie is the right pairing');
	const frozen = { kind: 'frozen_boilie' as const, appealFactor: 1.12, keepsDays: 6 };
	const shelf = { kind: 'shelf_life_boilie' as const, appealFactor: 0.9, keepsDays: null };
	assert.ok(baitTrustScore(frozen, emptyFeedStock()) > baitTrustScore(shelf, emptyFeedStock()), 'a good frozen bait beats a cheap shelf-life one');
	assert.ok(brightBaitFactor(4, 1) > 1 && brightBaitFactor(20, 1) < 1, 'a bright bait draws a young fish and spooks an old one');
	assert.equal(brightBaitFactor(20, 0), 1, 'in coloured water the brightness barely matters');
	assertSpoiledBaitIsNotUsable();
	console.log('rigs:', { ronnieOnTheBar: rigMatchScore('ronnie', GravelBar, 'pop_up').toFixed(2), helicopterOnTheBar: rigMatchScore('helicopter', GravelBar, 'pop_up').toFixed(2) });
}

function assertSpoiledBaitIsNotUsable() {
	const setup = defaultRodSetup();
	const freshBox = Object.values(setup).map((itemId) => ({ itemId, quantity: 1, spoilsAt: itemId === setup.bait ? NextWeek : null }));
	const spoiledBox = freshBox.map((line) => (line.itemId === setup.bait ? { ...line, spoilsAt: AnHourAgo } : line));
	assert.ok(isSetupOwned(freshBox, setup), 'fresh bait fishes');
	assert.ok(!isSetupOwned(spoiledBox, setup), 'bait that has gone off cannot be fished');
}
