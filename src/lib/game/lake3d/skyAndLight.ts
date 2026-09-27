import { Color, DirectionalLight, FogExp2, Group, HemisphereLight, Vector3, type Scene } from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import type { StageConditions } from '../sky/stageConditions';
import { daylightOf, horizonColourAt, skyMoodFor, sunColourAt, type SkyMood } from './skyLook';
import { sunPlacementAt, sunSkyPositionOf, type SunPlacement } from './sunAndSky';

const SkyScale = 9000;
const Light = { SunDistance: 400, SunBrightest: 3.2, MoonBrightest: 0.35, SkyDimmest: 0.35, SkyBrightest: 1.6, ShadowMapPixels: 2048, ShadowDepthShare: 3 } as const;
const SkyTint = new Color('#b9d4ff');
const GroundBounce = new Color('#3a4a24');
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

function shadowCastingSun(shadowReach: number) {
	const light = new DirectionalLight();
	light.castShadow = true;
	const shadow = light.shadow;
	shadow.mapSize.set(Light.ShadowMapPixels, Light.ShadowMapPixels);
	Object.assign(shadow.camera, { left: -shadowReach, right: shadowReach, top: shadowReach, bottom: -shadowReach, far: Light.SunDistance * Light.ShadowDepthShare });
	return light;
}

export class SkyAndLight {
	readonly group = new Group();
	sunlight: Sunlight = { direction: new Vector3(0, 1, 0), colour: new Color(), windStrength: 0, daylight: 1 };
	private readonly sky = new Sky();
	private readonly sun: DirectionalLight;
	private readonly skyLight = new HemisphereLight(SkyTint, GroundBounce);
	private readonly fog = new FogExp2(0xffffff);

	constructor(scene: Scene, shadowReach: number, isOpenSky: boolean) {
		this.sky.scale.setScalar(SkyScale);
		this.sun = shadowCastingSun(shadowReach);
		this.group.add(this.sun, this.sun.target, this.skyLight);
		if (!isOpenSky) return;
		this.group.add(this.sky);
		scene.fog = this.fog;
	}

	setConditions(conditions: StageConditions) {
		const { weather } = conditions;
		const mood = skyMoodFor(weather.kind);
		const placement = sunPlacementAt(conditions.hour, conditions.season);
		const elevation = placement.elevationDegrees;
		this.sunlight = { direction: placement.direction, colour: sunColourAt(elevation), windStrength: weather.windStrength, daylight: daylightOf(elevation) };
		this.paintTheSky(mood, placement);
		this.lightTheLand(mood, placement);
		this.fog.color.copy(horizonColourAt(elevation).multiply(mood.fogTint));
		this.fog.density = mood.fogDensity;
	}

	private paintTheSky(mood: SkyMood, placement: SunPlacement) {
		const skyMaterial = this.sky.material;
		const { turbidity, rayleigh, sunPosition } = skyMaterial.uniforms;
		turbidity.value = mood.turbidity;
		rayleigh.value = mood.rayleigh;
		sunPosition.value.copy(sunSkyPositionOf(placement));
	}

	private lightTheLand(mood: SkyMood, placement: SunPlacement) {
		const { colour, daylight } = this.sunlight;
		this.sun.position.copy(lightDirectionOf(placement)).multiplyScalar(Light.SunDistance);
		this.sun.color.copy(colour);
		this.sun.intensity = placement.isUp ? Light.SunBrightest * mood.sunStrength * daylight : Light.MoonBrightest;
		this.skyLight.intensity = Light.SkyDimmest + (Light.SkyBrightest - Light.SkyDimmest) * daylight * mood.sunStrength;
	}
}
