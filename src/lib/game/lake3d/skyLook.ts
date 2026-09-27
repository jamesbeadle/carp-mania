import { Color } from 'three';
import type { WeatherKind } from '$lib/domain/world/weather';

export interface SkyMood {
	turbidity: number;
	rayleigh: number;
	sunStrength: number;
	fogDensity: number;
	fogTint: Color;
}

const Moods: Record<WeatherKind, Omit<SkyMood, 'fogTint'> & { fogTint: string }> = {
	clear: { turbidity: 3, rayleigh: 1.2, sunStrength: 1, fogDensity: 0.0009, fogTint: '#ffffff' },
	heat: { turbidity: 6, rayleigh: 0.9, sunStrength: 1.15, fogDensity: 0.0012, fogTint: '#fff2dc' },
	overcast: { turbidity: 14, rayleigh: 3, sunStrength: 0.35, fogDensity: 0.0022, fogTint: '#c8ccd0' },
	rain: { turbidity: 18, rayleigh: 4, sunStrength: 0.22, fogDensity: 0.0035, fogTint: '#9aa3aa' },
	mist: { turbidity: 10, rayleigh: 2, sunStrength: 0.55, fogDensity: 0.0075, fogTint: '#e4e2dc' }
};

export function skyMoodFor(weather: WeatherKind): SkyMood {
	const mood = Moods[weather];
	return { ...mood, fogTint: new Color(mood.fogTint) };
}

const LowSun = new Color('#ffb46b');
const HighSun = new Color('#fff4e2');
const Moonlight = new Color('#7d95c8');
const DawnHorizon = new Color('#d7a57c');
const DayHorizon = new Color('#b9cad6');
const NightHorizon = new Color('#0c1422');
const FullDayElevation = 25;
const TwilightElevation = -6;

export function daylightOf(elevationDegrees: number) {
	return Math.min(1, Math.max(0, (elevationDegrees - TwilightElevation) / (FullDayElevation - TwilightElevation)));
}

export function sunColourAt(elevationDegrees: number) {
	const isNight = elevationDegrees <= 0;
	if (isNight) return Moonlight.clone();
	return LowSun.clone().lerp(HighSun, Math.min(1, elevationDegrees / FullDayElevation));
}

export function horizonColourAt(elevationDegrees: number) {
	const daylight = daylightOf(elevationDegrees);
	const warmth = 1 - Math.min(1, Math.abs(elevationDegrees) / FullDayElevation);
	return NightHorizon.clone().lerp(DayHorizon, daylight).lerp(DawnHorizon, warmth * daylight * 0.7);
}
