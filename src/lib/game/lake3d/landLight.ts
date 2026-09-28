import { Color, HemisphereLight, Vector3, type Object3D } from 'three';
import type { Sightline } from './shadowRange';
import type { SkyMood } from './skyLook';
import { SmallShadowCasters } from './smallShadowCasters';
import type { SunPlacement } from './sunAndSky';
import { createSunShadow, type SunShadow } from './sunShadow';

const Light = { SunBrightest: 3.6, MoonBrightest: 0.45, SkyDimmest: 0.1, SkyBrightest: 0.3, TwilightLift: 0.35 } as const;
const SkyTint = new Color('#b4cdf5');
const GroundBounce = new Color('#46502e');
const MoonHeight = 0.6;

export function lightDirectionOf(sun: SunPlacement) {
	const { direction } = sun;
	if (sun.isUp) return direction;
	return new Vector3(-direction.x, MoonHeight, -direction.z).normalize();
}

export class LandLight {
	readonly objects: Object3D[];
	direction = new Vector3(0, 1, 0);
	private readonly sunShadow: SunShadow;
	private readonly skyLight = new HemisphereLight(SkyTint, GroundBounce);
	private readonly casters: SmallShadowCasters;

	constructor(root: Object3D, wholePlotReach: number) {
		this.sunShadow = createSunShadow(wholePlotReach);
		this.casters = new SmallShadowCasters(root);
		this.objects = [this.sunShadow.light, this.skyLight];
	}

	get sunIntensity() {
		const { light } = this.sunShadow;
		return light.intensity;
	}

	light(mood: SkyMood, placement: SunPlacement, colour: Color, daylight: number) {
		const { light } = this.sunShadow;
		this.direction = lightDirectionOf(placement);
		this.sunShadow.shineFrom(this.direction);
		light.color.copy(colour);
		light.intensity = placement.isUp ? Light.SunBrightest * mood.sunStrength * daylight : Light.MoonBrightest;
		const skyShare = Math.pow(daylight, Light.TwilightLift);
		this.skyLight.intensity = Light.SkyDimmest + (Light.SkyBrightest - Light.SkyDimmest) * skyShare;
	}

	follow(sightline: Sightline) {
		this.sunShadow.follow(sightline);
		this.casters.keepNear(sightline.eye);
	}
}
