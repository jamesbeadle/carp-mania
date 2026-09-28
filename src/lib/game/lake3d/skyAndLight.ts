import { Color, FogExp2, Group, HemisphereLight, Scene, Vector3 } from 'three';
import type { StageConditions } from '../sky/stageConditions';
import { tintHaze, veiled, type HazeColours } from './aerialHaze';
import { Clouds } from './clouds';
import { createNightSky } from './nightSky';
import { shadowFocusOf, type Sightline } from './shadowFocus';
import { createClearSky, paintSky } from './skyDome';
import { daylightOf, skyMoodFor, sunColourAt, type SkyMood } from './skyLook';
import { sunPlacementAt, type SunPlacement } from './sunAndSky';
import { SunShadow } from './sunShadow';

const Light = { SunBrightest: 3.6, MoonBrightest: 0.45, SkyDimmest: 0.1, SkyBrightest: 0.3 } as const;
const SkyTint = new Color('#b4cdf5');
const GroundBounce = new Color('#46502e');
const MoonHeight = 0.6;

export interface Sunlight {
	direction: Vector3;
	colour: Color;
	windStrength: number;
	daylight: number;
}

function lightDirectionOf(sun: SunPlacement) {
	const { direction } = sun;
	if (sun.isUp) return direction;
	return new Vector3(-direction.x, MoonHeight, -direction.z).normalize();
}

export class SkyAndLight {
	readonly group = new Group();
	sunlight: Sunlight = { direction: new Vector3(0, 1, 0), colour: new Color(), windStrength: 0, daylight: 1 };
	private readonly sky = createClearSky(true);
	private readonly skyWithoutSun = createClearSky(false);
	private readonly sunShadow = new SunShadow();
	private readonly skyLight = new HemisphereLight(SkyTint, GroundBounce);
	private readonly fog = new FogExp2(0xffffff);
	private readonly night = createNightSky();
	private readonly clouds = new Clouds();
	private lightDirection = new Vector3(0, 1, 0);
	private mood = skyMoodFor('clear');

	constructor(scene: Scene, private readonly wholePlotReach: number, isOpenSky: boolean) {
		const sun = this.sunShadow.light;
		this.group.add(sun, sun.target, this.skyLight);
		this.sunShadow.follow(new Vector3(), wholePlotReach);
		if (!isOpenSky) return;
		this.group.add(this.sky, this.night.dome, this.clouds.dome);
		scene.fog = this.fog;
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
		this.night.darken(this.sunlight.daylight, lightDirectionOf(placement));
		this.clouds.cover(weather);
		this.lightTheLand(mood, placement);
		this.fog.density = mood.fogDensity;
	}

	tintHaze(measured: HazeColours) {
		const { direction, colour } = this.sunlight;
		const sun = this.sunShadow.light;
		const colours = veiled(measured, this.mood.veil);
		tintHaze(this.fog, colours, direction);
		this.clouds.light(this.lightDirection, colour, sun.intensity, colours.away, this.mood.veil);
	}

	followSight(sightline: Sightline) {
		const { centre, reach } = shadowFocusOf(sightline, this.wholePlotReach);
		this.sunShadow.follow(centre, reach);
	}

	advance(secondsElapsed: number) {
		this.clouds.advance(secondsElapsed);
	}

	private lightTheLand(mood: SkyMood, placement: SunPlacement) {
		const { colour, daylight } = this.sunlight;
		const sun = this.sunShadow.light;
		this.lightDirection = lightDirectionOf(placement);
		this.sunShadow.shineFrom(this.lightDirection);
		sun.color.copy(colour);
		sun.intensity = placement.isUp ? Light.SunBrightest * mood.sunStrength * daylight : Light.MoonBrightest;
		this.skyLight.intensity = Light.SkyDimmest + (Light.SkyBrightest - Light.SkyDimmest) * daylight;
	}
}
