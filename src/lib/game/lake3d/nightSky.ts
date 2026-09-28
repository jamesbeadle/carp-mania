import { BackSide, MathUtils, Mesh, ShaderMaterial, SphereGeometry, Vector3 } from 'three';
import { NightFragment, NightVertex } from './nightSkyShader';

const Dome = { Radius: 8000, WidthSegments: 32, HeightSegments: 16, RenderOrder: 1 } as const;
const DuskDaylight = 0.3;
const AfterglowFades = { FromDaylight: 0, ToDaylight: 0.1 } as const;

export function createNightSky() {
	const uniforms = { darkness: { value: 0 }, afterglow: { value: 0 }, moonDirection: { value: new Vector3(0, 1, 0) }, sunDirection: { value: new Vector3(0, 1, 0) } };
	const shaders = { vertexShader: NightVertex, fragmentShader: NightFragment };
	const material = new ShaderMaterial({ uniforms, ...shaders, side: BackSide, transparent: true, depthWrite: false, fog: false });
	const dome = new Mesh(new SphereGeometry(Dome.Radius, Dome.WidthSegments, Dome.HeightSegments), material);
	dome.renderOrder = Dome.RenderOrder;
	const { darkness, afterglow, moonDirection, sunDirection } = uniforms;
	const darken = (daylight: number, moonlightFrom: Vector3, sunFrom: Vector3) => {
		darkness.value = 1 - MathUtils.smoothstep(daylight, 0, DuskDaylight);
		afterglow.value = MathUtils.smoothstep(daylight, AfterglowFades.FromDaylight, AfterglowFades.ToDaylight);
		moonDirection.value.copy(moonlightFrom);
		sunDirection.value.copy(sunFrom);
	};
	return { dome, darken };
}
