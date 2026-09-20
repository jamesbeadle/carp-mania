import assert from 'node:assert/strict';
import { anglersOnTheBank, fishOutBetween, onTheBankSince, type VisitOnTheBank } from '../src/lib/domain/fishing/onTheBank';
import { timeSince } from '../src/lib/format/timeSince';

const Now = new Date('2026-09-20T10:18:00Z');

function visit(anglerId: string, arrivedAt: string, fishCaught: number): VisitOnTheBank {
	return { anglerId, anglerName: `Angler ${anglerId}`, arrivedAt, fishCaught };
}

export function runOnTheBankScenarios() {
	const visits = [
		visit('kye', '2026-09-20T09:50:00Z', 2),
		visit('nigel', '2026-09-20T08:30:00Z', 0),
		visit('kye', '2026-09-20T08:00:00Z', 1),
		visit('old', '2026-09-20T07:30:00Z', 4)
	];
	const onTheBank = anglersOnTheBank(visits, Now);
	assert.deepEqual(onTheBank.map((angler) => angler.anglerId), ['kye', 'nigel'], 'a live ticket puts an angler on the bank, latest arrival first, one row an angler; a ticket older than its life has gone home');
	assert.equal(fishOutBetween(onTheBank), 2, 'the fish out are counted from the visit each angler is on');
	assert.equal(onTheBankSince(Now).toISOString(), '2026-09-20T08:18:00.000Z', 'the bank is read back over the life of a ticket');
	assert.equal(timeSince('2026-09-20T10:17:40Z', Now), 'just now');
	assert.equal(timeSince('2026-09-20T09:50:00Z', Now), '28 min ago');
	assert.equal(timeSince('2026-09-20T08:30:00Z', Now), '1h 48m ago');
	console.log('on the bank:', onTheBank.map((angler) => `${angler.anglerName} ${timeSince(angler.arrivedAt, Now)}`));
}
