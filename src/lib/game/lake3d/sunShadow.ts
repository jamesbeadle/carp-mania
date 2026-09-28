import type { Vector3 } from 'three';
import { SunLight } from 'three/examples/jsm/lights/SunLight.js';
import { renderQuality } from './renderQuality';

const Shadow = { Nearest: 0.5, Softness: 2.5, Bias: -0.0004, NormalBias: 0.05 } as const;

export class SunShadow {
	readonly light = new SunLight();

	constructor() {
		const { light } = this;
		light.castShadow = true;
		const { shadow } = light;
		const pixels = renderQuality().shadowMapPixels;
		shadow.mapSize.set(pixels, pixels);
		Object.assign(shadow, { radius: Shadow.Softness, bias: Shadow.Bias, normalBias: Shadow.NormalBias });
		const { camera } = shadow;
		camera.near = Shadow.Nearest;
	}

	shineFrom(direction: Vector3) {
		this.light.position.copy(direction);
	}

	reachTo(metres: number) {
		const { camera } = this.light.shadow;
		camera.far = metres;
	}
}
