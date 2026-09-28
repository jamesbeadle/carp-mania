import { BackSide, Color, Mesh, ShaderMaterial, SphereGeometry, Vector2, Vector3 } from 'three';
import type { Weather, WeatherKind } from '$lib/domain/world/weather';
import type { WindDirection } from '$lib/domain/world/weatherGlass';
import { CloudFragment, CloudVertex } from './cloudShader';
import { renderQuality } from './renderQuality';
import { brightnessOf } from './skyLook';

const Dome = { Radius: 7000, WidthSegments: 48, HeightSegments: 16, RenderOrder: 2 } as const;
const Drift = { LayerUnitsPerSecond: 0.004, CalmestShare: 0.15 } as const;
const Lighting = { SunlitShare: 0.22, ShadedBrightness: 0.62, SkyBlueInShade: 0.35, HeavyDarkening: 0.4 } as const;
const ShadeBlue = new Color('#8fa3c4');
const Heaviness: Record<WeatherKind, number> = { clear: 0, heat: 0, mist: 0.25, overcast: 0.55, rain: 0.9 };
const DownwindOf: Record<WindDirection, [number, number]> = { north: [0, 1], east: [-1, 0], south: [0, -1], west: [1, 0], south_west: [Math.SQRT1_2, -Math.SQRT1_2] };

function cloudMaterial() {
	const uniforms = {
		sunDirection: { value: new Vector3(0, 1, 0) },
		litColour: { value: new Color() },
		shadeColour: { value: new Color() },
		hazeColour: { value: new Color() },
		cover: { value: 0 },
		heaviness: { value: 0 },
		veil: { value: 0 },
		drift: { value: new Vector2() }
	};
	const defines = { OCTAVES: renderQuality().cloudOctaves };
	return new ShaderMaterial({ uniforms, defines, vertexShader: CloudVertex, fragmentShader: CloudFragment, side: BackSide, transparent: true, depthWrite: false, fog: false });
}

export class Clouds {
	readonly dome: Mesh;
	private readonly material = cloudMaterial();
	private readonly wind = new Vector2();

	constructor() {
		this.dome = new Mesh(new SphereGeometry(Dome.Radius, Dome.WidthSegments, Dome.HeightSegments, 0, Math.PI * 2, 0, Math.PI / 2), this.material);
		this.dome.renderOrder = Dome.RenderOrder;
	}

	cover(weather: Weather) {
		const { cover, heaviness } = this.material.uniforms;
		cover.value = weather.cloudCover;
		heaviness.value = Heaviness[weather.kind];
		const [east, south] = DownwindOf[weather.windDirection];
		const speed = Drift.LayerUnitsPerSecond * (Drift.CalmestShare + weather.windStrength);
		this.wind.set(east * speed, south * speed);
	}

	light(sunDirection: Vector3, sunColour: Color, sunIntensity: number, horizon: Color, veil: number) {
		const { litColour, shadeColour, hazeColour, veil: veiling } = this.material.uniforms;
		veiling.value = veil;
		const brightness = brightnessOf(horizon);
		const { uniforms } = this.material;
		const { sunDirection: towardSun } = uniforms;
		towardSun.value.copy(sunDirection);
		litColour.value.copy(sunColour).multiplyScalar(sunIntensity * Lighting.SunlitShare);
		const { heaviness } = uniforms;
		const shadeBrightness = Lighting.ShadedBrightness * (1 - heaviness.value * Lighting.HeavyDarkening);
		shadeColour.value.copy(horizon).lerp(ShadeBlue.clone().multiplyScalar(brightness), Lighting.SkyBlueInShade).multiplyScalar(shadeBrightness);
		hazeColour.value.copy(horizon);
	}

	advance(secondsElapsed: number) {
		const { drift } = this.material.uniforms;
		drift.value.addScaledVector(this.wind, secondsElapsed);
	}
}
