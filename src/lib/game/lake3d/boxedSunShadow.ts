import { DirectionalLight, Matrix4, Vector3 } from 'three';
import { renderQuality } from './renderQuality';
import { shadowBoxOf, type Sightline } from './shadowRange';
import { ShadowLook } from './shadowLook';

const Box = { SunDistanceMetres: 400, DepthMetres: 800 } as const;
const Upward = new Vector3(0, 1, 0);

export class BoxedSunShadow {
	readonly light = new DirectionalLight();
	private readonly direction = new Vector3(0, 1, 0);
	private readonly across = new Vector3();
	private readonly upAcross = new Vector3();
	private readonly pixels = renderQuality().shadowMapPixels;

	constructor(private readonly wholePlotReach: number) {
		const { light } = this;
		light.castShadow = true;
		light.add(light.target);
		const { shadow } = light;
		shadow.mapSize.set(this.pixels, this.pixels);
		Object.assign(shadow, { radius: ShadowLook.Softness, bias: ShadowLook.Bias, normalBias: ShadowLook.NormalBias });
		const { camera } = shadow;
		Object.assign(camera, { near: ShadowLook.Nearest, far: Box.DepthMetres });
	}

	shineFrom(direction: Vector3) {
		this.direction.copy(direction).normalize();
		new Matrix4().lookAt(this.direction, new Vector3(), Upward).extractBasis(this.across, this.upAcross, new Vector3());
	}

	follow(sightline: Sightline) {
		const { centre, halfWidth } = shadowBoxOf(sightline, this.wholePlotReach);
		const snapped = this.snappedToTexels(centre, halfWidth);
		const { camera } = this.light.shadow;
		Object.assign(camera, { left: -halfWidth, right: halfWidth, top: halfWidth, bottom: -halfWidth });
		camera.updateProjectionMatrix();
		this.light.position.copy(snapped).addScaledVector(this.direction, Box.SunDistanceMetres);
		const { target } = this.light;
		target.position.copy(this.direction).multiplyScalar(-Box.SunDistanceMetres);
	}

	private snappedToTexels(centre: Vector3, halfWidth: number) {
		const texel = (halfWidth * 2) / this.pixels;
		const snap = (metres: number) => Math.round(metres / texel) * texel;
		const along = centre.dot(this.direction);
		const acrossMetres = snap(centre.dot(this.across));
		const upMetres = snap(centre.dot(this.upAcross));
		return new Vector3().addScaledVector(this.across, acrossMetres).addScaledVector(this.upAcross, upMetres).addScaledVector(this.direction, along);
	}
}
