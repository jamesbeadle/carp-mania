import { BackSide, Color, Mesh, ShaderMaterial, SphereGeometry, Vector2, Vector3 } from 'three';
import type { Weather, WeatherKind } from '$lib/domain/world/weather';
import type { WindDirection } from '$lib/domain/world/weatherGlass';
import { shadeUnderClouds } from './aerialHaze';
import { CloudFragment, CloudVertex } from './cloudShader';
import { renderQuality } from './renderQuality';
import { brightnessOf } from './skyLook';

const Dome = { Radius: 7000, WidthSegments: 48, HeightSegments: 16, RenderOrder: 2 } as const;
const Drift = { LayerUnitsPerSecond: 0.004, CalmestShare: 0.15 } as const;
const Lighting = { SunlitShare: 0.22, ShadedBrightness: 0.62, SkyBlueInShade: 0.35, HeavyDarkening: 0.4 } as const;
const Shadows = { Strongest: 0.32 } as const;
const ShadeBlue = new Color('#8fa3c4');
const Heaviness: Record<WeatherKind, number> = { clear: 0, heat: 0, mist: 0.25, overcast: 0.55, rain: 0.9 };
const DownwindOf: Record<WindDirection, [number, number]> = {
	north: [0, 1],
	east: [-1, 0],
	south: [0, -1],
	west: [1, 0],
	south_west: [Math.SQRT1_2, -Math.SQRT1_2]
};

export interface CloudLighting {
	direction: Vector3;
	colour: Color;
	intensity: number;
	horizon: Color;
	veil: number;
	daylight: number;
}

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
	const shaders = { vertexShader: CloudVertex, fragmentShader: CloudFragment };
	return new ShaderMaterial({ uniforms, defines, ...shaders, side: BackSide, transparent: true, depthWrite: false, fog: false });
}

export class Clouds {
	readonly dome: Mesh;
	private readonly material = cloudMaterial();
	private readonly wind = new Vector2();
	private shadowStrength = 0;

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

	light(lighting: CloudLighting) {
		const { uniforms } = this.material;
		const { litColour, shadeColour, hazeColour, veil, heaviness, sunDirection } = uniforms;
		const { horizon } = lighting;
		veil.value = lighting.veil;
		sunDirection.value.copy(lighting.direction);
		litColour.value.copy(lighting.colour).multiplyScalar(lighting.intensity * Lighting.SunlitShare);
		const shadeBrightness = Lighting.ShadedBrightness * (1 - heaviness.value * Lighting.HeavyDarkening);
		const skyBlue = ShadeBlue.clone().multiplyScalar(brightnessOf(horizon));
		shadeColour.value.copy(horizon).lerp(skyBlue, Lighting.SkyBlueInShade).multiplyScalar(shadeBrightness);
		hazeColour.value.copy(horizon);
		const isShading = renderQuality().hasCloudShadows;
		this.shadowStrength = isShading ? Shadows.Strongest * lighting.daylight * (1 - heaviness.value) : 0;
	}

	advance(secondsElapsed: number) {
		const { drift, cover } = this.material.uniforms;
		drift.value.addScaledVector(this.wind, secondsElapsed);
		shadeUnderClouds(drift.value, cover.value, this.shadowStrength);
	}
}
