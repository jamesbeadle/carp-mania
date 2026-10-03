import assert from 'node:assert/strict';
import { isAnglerName } from '../src/lib/domain/anglerName';
import { rolledAnglerHandles } from '../src/lib/domain/naming/anglerHandles';
import { lookCode, lookFromCode, lookOfPortraitPath, portraitPathOf } from '../src/lib/domain/portrait/portraitLook';
import { Fisherman, Fisherwoman, rolledLook } from '../src/lib/domain/portrait/portraitPresets';
import { seededRandom } from '../src/lib/domain/random';
import { drawPortrait } from '../src/lib/game/portrait/drawPortrait';

const SqlPortraitPath = /^\/portrait\/[0-5]-[0-4]-[0-5]-[0-2]-[0-4]-[0-5]\.svg$/;

export function runPortraitScenarios() {
	const random = seededRandom(9);
	const looks = [Fisherman, Fisherwoman, ...Array.from({ length: 200 }, () => rolledLook(random))];
	assert.ok(looks.every((look) => SqlPortraitPath.test(portraitPathOf(look))), 'every look the creator makes is one the database accepts');
	assert.deepEqual(lookFromCode(lookCode(Fisherwoman)), Fisherwoman, 'a look survives its code');
	assert.deepEqual(lookOfPortraitPath(portraitPathOf(Fisherman)), Fisherman, 'and its address');
	assert.equal(lookFromCode('9-0-0-0-0-0'), null, 'a skin not on offer is refused');
	assert.equal(lookFromCode('1-0-0'), null, 'half a look is refused');
	assert.equal(lookOfPortraitPath('https://lh3.googleusercontent.com/a/me.png'), null, 'a Google picture is not a portrait');
	assert.ok(drawPortrait(Fisherman).startsWith('<svg'), 'a portrait is drawn');
	const handles = rolledAnglerHandles(random, 40);
	assert.ok(handles.every(isAnglerName), 'every rolled name is an angler name');
	console.log('portraits:', { sample: handles.slice(0, 4), fisherwoman: portraitPathOf(Fisherwoman) });
}
