import assert from 'node:assert/strict';
import { blendHsl, blendHue, hslWords, surroundingKeyframes } from '../src/lib/game/sky/keyframes';
import { lightAt, LightKeyframes, NightShade } from '../src/lib/game/sky/lightPalette';
import { mistStrengthAt } from '../src/lib/game/sky/weatherEffects';

export function runLightScenarios() {
	assert.equal(blendHue(30, 262, 0.5), 326, 'a blend from amber to violet goes the short way round, through red, never through green');
	assert.equal(blendHue(350, 10, 0.5), 0, 'a blend across the top of the wheel meets at red');
	assert.equal(blendHue(200, 220, 0.25), 205);
	assert.deepEqual(blendHsl([0, 50, 50], [0, 100, 100], 0.5), [0, 75, 75]);
	assert.equal(hslWords([206.25, 72, 52.5]), 'hsl(206.3 72.0% 52.5%)');
	assert.equal(hslWords([206, 72, 52], 1.5), 'hsl(206.0 100.0% 52.0%)', 'season saturation is capped');

	const [before, after, progress] = surroundingKeyframes(LightKeyframes, 5.25);
	assert.equal(before.moment, 'before dawn');
	assert.equal(after.moment, 'sunrise');
	assert.equal(progress, 0.5);
	assert.equal(surroundingKeyframes(LightKeyframes, 24)[2], 1, 'midnight is the end of the last keyframe');
	assert.equal(surroundingKeyframes(LightKeyframes, 0)[0].moment, 'night');

	assert.equal(lightAt(12).shadeOpacity, 0, 'midday casts no shade');
	assert.equal(lightAt(12).glowOpacity, 0);
	assert.deepEqual(lightAt(0), lightAt(24), 'midnight is the same light from either side');
	assert.ok(lightAt(0).shadeOpacity > lightAt(21).shadeOpacity && lightAt(21).shadeOpacity > lightAt(19.5).shadeOpacity, 'the shade deepens from sunset through the blue hour to night');
	assert.match(lightAt(6).glowColour, /^hsl\(24\.0 /, 'sunrise glows apricot');
	assert.match(lightAt(19.5).glowColour, /^hsl\(14\.0 /, 'sunset glows coral');
	const duskHue = Number(lightAt(18.5).shadeColour.match(/hsl\(([\d.]+)/)?.[1]);
	assert.ok(duskHue < 30 || duskHue > 262, `the shade between golden hour and sunset passes through red, not green (${duskHue})`);
	assert.equal(mistStrengthAt(5), 1, 'mist lies thick at dawn');
	assert.equal(mistStrengthAt(8.5), 0.5, 'mist is half lifted by half past eight');
	assert.equal(mistStrengthAt(13), 0, 'mist is gone by midday');
	assert.equal(mistStrengthAt(23), 1, 'mist gathers again after dark');
	assert.ok(lightAt(6).glowOpacity < 0.3, 'the sunrise glow no longer washes the water out');
	const smallHours = [0, 1, 2, 3, 3.9, 4.5, 22, 23];
	assert.ok(smallHours.every((hour) => lightAt(hour).shadeOpacity <= NightShade.MostOpacity), 'the small hours never shade past half — the water and the fish still read at 3am');
	assert.ok(lightAt(3).glowOpacity > 0, 'a cool moonlight glow lifts the water at night');
	console.log('light:', { sunrise: lightAt(6).glowColour, dusk: lightAt(18.5).shadeColour, mistAtNine: mistStrengthAt(9).toFixed(2) });
}
