import type { Light, Vector3 } from 'three';
import { SunLight } from 'three/examples/jsm/lights/SunLight.js';
import { BoxedSunShadow } from './boxedSunShadow';
import { renderQuality } from './renderQuality';
import { shadowRangeOf, type Sightline } from './shadowRange';
import { ShadowLook } from './shadowLook';

export interface SunShadow {
	readonly light: Light;
	shineFrom: (direction: Vector3) => void;
	follow: (sightline: Sightline) => void;
}

class CascadedSunShadow implements SunShadow {
	readonly light = new SunLight();

	constructor(private readonly wholePlotReach: number) {
		const { light } = this;
		light.castShadow = true;
		const { shadow } = light;
		const { shadowMapPixels } = renderQuality();
		shadow.mapSize.set(shadowMapPixels, shadowMapPixels);
		Object.assign(shadow, { radius: ShadowLook.Softness, bias: ShadowLook.Bias, normalBias: ShadowLook.NormalBias });
		const { camera } = shadow;
		camera.near = ShadowLook.Nearest;
	}

	shineFrom(direction: Vector3) {
		this.light.position.copy(direction);
	}

	follow(sightline: Sightline) {
		const { camera } = this.light.shadow;
		camera.far = shadowRangeOf(sightline, this.wholePlotReach);
	}
}

export function createSunShadow(wholePlotReach: number): SunShadow {
	const { hasCascadedShadows } = renderQuality();
	return hasCascadedShadows ? new CascadedSunShadow(wholePlotReach) : new BoxedSunShadow(wholePlotReach);
}
