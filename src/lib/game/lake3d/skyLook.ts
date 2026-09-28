import { Color } from 'three';
import type { WeatherKind } from '$lib/domain/world/weather';

export interface SkyMood {
	turbidity: number;
	rayleigh: number;
	mieCoefficient: number;
	mieDirectionalG: number;
	sunStrength: number;
	fogDensity: number;
	veil: number;
	skyShade: number;
}

const Moods: Record<WeatherKind, SkyMood> = {
	clear: { turbidity: 2.4, rayleigh: 1.1, mieCoefficient: 0.0025, mieDirectionalG: 0.84, sunStrength: 1, fogDensity: 0.0009, veil: 0, skyShade: 1 },
	heat: { turbidity: 5.5, rayleigh: 0.9, mieCoefficient: 0.006, mieDirectionalG: 0.86, sunStrength: 1.1, fogDensity: 0.0014, veil: 0.1, skyShade: 1 },
	overcast: { turbidity: 12, rayleigh: 2.2, mieCoefficient: 0.012, mieDirectionalG: 0.7, sunStrength: 0.3, fogDensity: 0.0016, veil: 0.08, skyShade: 0.65 },
	rain: { turbidity: 16, rayleigh: 3, mieCoefficient: 0.016, mieDirectionalG: 0.65, sunStrength: 0.2, fogDensity: 0.0026, veil: 0.22, skyShade: 0.38 },
	mist: { turbidity: 20, rayleigh: 3, mieCoefficient: 0.01, mieDirectionalG: 0.8, sunStrength: 0.5, fogDensity: 0.005, veil: 0.75, skyShade: 0.95 }
};

export function skyMoodFor(weather: WeatherKind): SkyMood {
	return Moods[weather];
}

const LowSun = new Color('#ff9f58');
const HighSun = new Color('#fff1dc');
const Moonlight = new Color('#8aa2d6');
const FullDayElevation = 25;
const TwilightElevation = -6;
const Luminance = { Red: 0.2126, Green: 0.7152, Blue: 0.0722 } as const;

export function daylightOf(elevationDegrees: number) {
	return Math.min(1, Math.max(0, (elevationDegrees - TwilightElevation) / (FullDayElevation - TwilightElevation)));
}

export function sunColourAt(elevationDegrees: number) {
	const isNight = elevationDegrees <= 0;
	if (isNight) return Moonlight.clone();
	return LowSun.clone().lerp(HighSun, Math.min(1, elevationDegrees / FullDayElevation));
}

export function brightnessOf(colour: Color) {
	return colour.r * Luminance.Red + colour.g * Luminance.Green + colour.b * Luminance.Blue;
}
