import { DirectionalLight, Matrix4, Vector3 } from 'three';
import { renderQuality } from './renderQuality';

export const SunReach = { Distance: 400 } as const;
const Shadow = { DepthShare: 2.5, Nearest: 1, Softness: 3, Bias: -0.0003, NormalBias: 0.04, ReachStepMetres: 8 } as const;
const Origin = new Vector3();
const Up = new Vector3(0, 1, 0);

function snapped(value: number, step: number) {
	return Math.round(value / step) * step;
}

export class SunShadow {
	readonly light = new DirectionalLight();
	private readonly towardLight = new Vector3(0, 1, 0);
	private readonly across = new Vector3(1, 0, 0);
	private readonly upward = new Vector3(0, 0, -1);
	private readonly along = new Vector3(0, 1, 0);
	private readonly centre = new Vector3();
	private readonly pixels = renderQuality().shadowMapPixels;
	private readonly focus = new Vector3();
	private focusReach = 1;
	private reach = 0;

	constructor() {
		const { light } = this;
		light.castShadow = true;
		const { shadow } = light;
		shadow.mapSize.set(this.pixels, this.pixels);
		Object.assign(shadow, { radius: Shadow.Softness, bias: Shadow.Bias, normalBias: Shadow.NormalBias });
	}

	shineFrom(direction: Vector3) {
		this.towardLight.copy(direction);
		new Matrix4().lookAt(direction, Origin, Up).extractBasis(this.across, this.upward, this.along);
		this.follow(this.focus, this.focusReach);
	}

	follow(focus: Vector3, reach: number) {
		this.focus.copy(focus);
		this.focusReach = reach;
		this.fitReach(reach);
		const texel = (2 * this.reach) / this.pixels;
		const acrossShare = snapped(focus.dot(this.across), texel);
		const upwardShare = snapped(focus.dot(this.upward), texel);
		const alongShare = focus.dot(this.along);
		this.centre.copy(this.across).multiplyScalar(acrossShare).addScaledVector(this.upward, upwardShare).addScaledVector(this.along, alongShare);
		const { light } = this;
		const { target } = light;
		target.position.copy(this.centre);
		light.position.copy(this.centre).addScaledVector(this.towardLight, SunReach.Distance);
	}

	private fitReach(reach: number) {
		const steppedReach = Math.ceil(reach / Shadow.ReachStepMetres) * Shadow.ReachStepMetres;
		if (steppedReach === this.reach) return;
		this.reach = steppedReach;
		const { shadow } = this.light;
		const { camera } = shadow;
		Object.assign(camera, { left: -steppedReach, right: steppedReach, top: steppedReach, bottom: -steppedReach, near: Shadow.Nearest, far: SunReach.Distance * Shadow.DepthShare });
		camera.updateProjectionMatrix();
	}
}
