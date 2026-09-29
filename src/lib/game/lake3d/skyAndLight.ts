import { Color, FogExp2, Group, Scene, Vector3 } from 'three';
import type { StageConditions } from '../sky/stageConditions';
import { tintHaze, veiled, type HazeColours } from './aerialHaze';
import { Clouds } from './clouds';
import { LandLight, lightDirectionOf } from './landLight';
import { createNightSky } from './nightSky';
import type { Sightline } from './shadowRange';
import { createClearSky, paintSky } from './skyDome';
import { daylightOf, skyMoodFor, sunColourAt } from './skyLook';
import { sunPlacementAt } from './sunAndSky';

const OverviewMostHaze = 0.0011;

export interface Sunlight {
	direction: Vector3;
	colour: Color;
	windStrength: number;
	daylight: number;
}

export class SkyAndLight {
	readonly group = new Group();
	sunlight: Sunlight = { direction: new Vector3(0, 1, 0), colour: new Color(), windStrength: 0, daylight: 1 };
	private readonly sky = createClearSky(true);
	private readonly skyWithoutSun = createClearSky(false);
	private readonly land: LandLight;
	private readonly fog = new FogExp2(0xffffff);
	private readonly night = createNightSky();
	private readonly clouds = new Clouds();
	private mood = skyMoodFor('clear');

	constructor(scene: Scene, wholePlotReach: number, isOpenSky: boolean) {
		this.land = new LandLight(scene, wholePlotReach);
		const { objects } = this.land;
		this.group.add(...objects);
		this.land.follow({ eye: new Vector3(), focus: new Vector3(), isOverview: true });
		if (!isOpenSky) return;
		this.group.add(this.sky, this.night.dome, this.clouds.dome);
		scene.fog = this.fog;
	}

	get exposureShare() {
		const { mood } = this;
		return mood.exposureShare;
	}

	environmentScene() {
		return new Scene().add(this.skyWithoutSun, this.night.dome.clone());
	}

	setConditions(conditions: StageConditions) {
		const { weather } = conditions;
		const mood = skyMoodFor(weather.kind);
		this.mood = mood;
		const placement = sunPlacementAt(conditions.hour, conditions.season);
		const elevation = placement.elevationDegrees;
		this.sunlight = { direction: placement.direction, colour: sunColourAt(elevation), windStrength: weather.windStrength, daylight: daylightOf(elevation) };
		paintSky(this.sky, mood, placement);
		paintSky(this.skyWithoutSun, mood, placement);
		this.night.darken(this.sunlight.daylight, lightDirectionOf(placement), placement.direction);
		this.clouds.cover(weather);
		const { colour, daylight } = this.sunlight;
		this.land.light(mood, placement, colour, daylight);
		this.fog.density = mood.fogDensity;
	}

	tintHaze(measured: HazeColours) {
		const { direction, colour, daylight } = this.sunlight;
		const { mood } = this;
		const colours = veiled(measured, mood);
		tintHaze(this.fog, colours, direction);
		const intensity = this.land.sunIntensity;
		this.clouds.light({ direction: this.land.direction, colour, intensity, horizon: colours.away, veil: mood.veil, daylight });
	}

	followSight(sightline: Sightline) {
		this.land.follow(sightline);
		const { fogDensity } = this.mood;
		this.fog.density = sightline.isOverview ? Math.min(fogDensity, OverviewMostHaze) : fogDensity;
	}

	advance(secondsElapsed: number) {
		this.clouds.advance(secondsElapsed);
	}
}
