import assert from 'node:assert/strict';
import { roomForMorePike, sensiblePikeMaximumFor, whyNoRoomForPike } from '../src/lib/domain/pikeStocking';

export function runPikeScenarios() {
	assert.equal(sensiblePikeMaximumFor(10), 6, 'ten acres sensibly hold six pike');
	assert.equal(sensiblePikeMaximumFor(5), 3, 'five acres sensibly hold three');
	assert.equal(roomForMorePike({ acres: 5, pike_count: 1 }), 2, 'the room left is the maximum less the pike already there');
	assert.equal(roomForMorePike({ acres: 5, pike_count: 3 }), 0, 'a full water has no room');
	assert.equal(roomForMorePike({ acres: 5, pike_count: 4 }), 0, 'an overstocked water has no room, never a negative one');
	assert.equal(whyNoRoomForPike({ acres: 5, pike_count: 2 }), null, 'room left means no refusal');
	assert.match(whyNoRoomForPike({ acres: 5, pike_count: 3 }) ?? '', /holds 3 pike and has them all/);
	assert.match(whyNoRoomForPike({ acres: 5, pike_count: 4 }) ?? '', /4 pike is more than the 3/);
	console.log('pike:', { fiveAcres: sensiblePikeMaximumFor(5), overstocked: whyNoRoomForPike({ acres: 5, pike_count: 4 }) });
}
