import { Color, Mesh, SphereGeometry, Vector2, Vector3 } from 'three';
import type { Weather, WeatherKind } from '$lib/domain/world/weather';
import type { WindDirection } from '$lib/domain/world/weatherGlass';
import { shadeUnderClouds } from './aerialHaze';
import { cloudMaterial, fadeInReflections } from './cloudMaterial';
import { renderQuality } from './renderQuality';
import { brightnessOf } from './skyLook';

const Dome = { Radius: 7000, WidthSegments: 48, HeightSegments: 16, RenderOrder: 2 } as const;
const Drift = { LayerUnitsPerSecond: 0.004, CalmestShare: 0.15 } as const;
const Lighting = { SunlitShare: 0.22, ShadedBrightness: 0.62, SkyBlueInShade: 0.35, HeavyDarkening: 0.4 } as const;
const Moonlit = { DuskDaylight: 0.3, ShadeOverSky: 1.15, LitOverSky: 1.5 } as const;
const Shadows = { Strongest: 0.26 } as const;
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

function nightnessOf(daylight: number) {
	return 1 - Math.min(1, daylight / Moonlit.DuskDaylight);
}

export class Clouds {
	readonly dome: Mesh;
	private readonly material = cloudMaterial();
	private readonly wind = new Vector2();
	private shadowStrength = 0;

	constructor() {
		this.dome = new Mesh(new SphereGeometry(Dome.Radius, Dome.WidthSegments, Dome.HeightSegments, 0, Math.PI * 2, 0, Math.PI / 2), this.material);
		this.dome.renderOrder = Dome.RenderOrder;
		fadeInReflections(this.dome, this.material);
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
		const { litColour, shadeColour, hazeColour, veil, heaviness, sunDirection } = this.material.uniforms;
		const { horizon } = lighting;
		const nightness = nightnessOf(lighting.daylight);
		veil.value = lighting.veil;
		sunDirection.value.copy(lighting.direction);
		litColour.value.copy(lighting.colour).multiplyScalar(lighting.intensity * Lighting.SunlitShare);
		litColour.value.lerp(horizon.clone().multiplyScalar(Moonlit.LitOverSky), nightness);
		const shadeBrightness = Lighting.ShadedBrightness * (1 - heaviness.value * Lighting.HeavyDarkening);
		const skyBlue = ShadeBlue.clone().multiplyScalar(brightnessOf(horizon));
		shadeColour.value.copy(horizon).lerp(skyBlue, Lighting.SkyBlueInShade).multiplyScalar(shadeBrightness);
		shadeColour.value.lerp(horizon.clone().multiplyScalar(Moonlit.ShadeOverSky), nightness);
		hazeColour.value.copy(horizon);
		const { hasCloudShadows } = renderQuality();
		this.shadowStrength = hasCloudShadows ? Shadows.Strongest * lighting.daylight * (1 - heaviness.value) : 0;
	}

	advance(secondsElapsed: number) {
		const { drift, cover } = this.material.uniforms;
		drift.value.addScaledVector(this.wind, secondsElapsed);
		shadeUnderClouds(drift.value, cover.value, this.shadowStrength);
	}
}
