import { createBirdlife, drawBirds, moveBirds, type Birdlife } from './birds';
import { createClouds, drawClouds, driftClouds } from './clouds';
import { drawStars, drawSunAndMoon } from './skyBodies';
import type { SkyFrame } from './skyLoop';
import { skyLookFor } from './skyPalette';
import type { StageConditions } from './stageConditions';
import { createRain, drawRainfall, drawSkyWeather } from './weatherEffects';

export interface SkyScene {
	clouds: ReturnType<typeof createClouds>;
	birdlife: Birdlife;
	rain: ReturnType<typeof createRain>;
}

export function createSkyScene(): SkyScene {
	return { clouds: createClouds(), birdlife: createBirdlife(), rain: createRain() };
}

export function drawSkyBackdrop(frame: SkyFrame, conditions: StageConditions, scene: SkyScene) {
	const { context, width, height } = frame;
	const look = skyLookFor(conditions.hour, conditions.season);
	const sky = context.createLinearGradient(0, 0, 0, height);
	sky.addColorStop(0, look.top);
	sky.addColorStop(1, look.horizon);
	context.fillStyle = sky;
	context.fillRect(0, 0, width, height);
	drawStars(context, width, height, look.starAlpha, frame.timeSeconds);
	drawSunAndMoon(context, width, height, conditions.hour, look);
	driftClouds(scene.clouds, conditions.weather.windStrength, frame.secondsElapsed);
	drawClouds(context, width, height, scene.clouds, conditions.weather.cloudCover, look.daylight, conditions.weather.kind === 'rain');
	drawSkyWeather(context, width, height, conditions);
}

export function drawOverhead(frame: SkyFrame, conditions: StageConditions, scene: SkyScene) {
	const { context, width, height } = frame;
	context.clearRect(0, 0, width, height);
	const look = skyLookFor(conditions.hour, conditions.season);
	drawRainfall(context, width, height, conditions, scene.rain, frame.secondsElapsed);
	moveBirds(scene.birdlife, width, height, look.daylight, frame.secondsElapsed);
	drawBirds(context, scene.birdlife, frame.timeSeconds);
}
