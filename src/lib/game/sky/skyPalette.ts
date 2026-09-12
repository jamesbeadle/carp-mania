import type { SeasonName } from '$lib/domain/world/worldClock';
import { Daylight, daylightAt, HoursInADay } from '$lib/domain/world/hourOfDay';

type Hsl = [hue: number, saturation: number, lightness: number];

interface SkyKeyframe {
	hour: number;
	top: Hsl;
	horizon: Hsl;
}

export interface SkyLook {
	top: string;
	horizon: string;
	daylight: number;
	starAlpha: number;
	sunGlow: string;
}

const Keyframes: SkyKeyframe[] = [
	{ hour: 0, top: [228, 45, 8], horizon: [225, 35, 16] },
	{ hour: 4.5, top: [228, 45, 9], horizon: [230, 30, 18] },
	{ hour: 6, top: [220, 40, 30], horizon: [24, 80, 58] },
	{ hour: 7.5, top: [206, 60, 58], horizon: [36, 85, 78] },
	{ hour: 12, top: [206, 72, 52], horizon: [200, 60, 80] },
	{ hour: 17.5, top: [210, 58, 52], horizon: [32, 75, 72] },
	{ hour: 19.5, top: [232, 42, 28], horizon: [14, 82, 52] },
	{ hour: 21, top: [230, 45, 12], horizon: [250, 30, 20] },
	{ hour: 24, top: [228, 45, 8], horizon: [225, 35, 16] }
];

const SeasonSaturation: Record<SeasonName, number> = { winter: 0.7, spring: 1, summer: 1.1, autumn: 0.9 };
const SunGlow = { Hue: 36, Saturation: 90, Lightness: 70, PeakAlpha: 0.55 } as const;

export function skyLookFor(hour: number, season: SeasonName): SkyLook {
	const [before, after] = surroundingKeyframes(hour);
	const progress = (hour - before.hour) / (after.hour - before.hour);
	const daylight = daylightAt(hour);
	const saturation = SeasonSaturation[season];
	return {
		top: hsl(blend(before.top, after.top, progress), saturation),
		horizon: hsl(blend(before.horizon, after.horizon, progress), saturation),
		daylight,
		starAlpha: 1 - daylight,
		sunGlow: `hsla(${SunGlow.Hue} ${SunGlow.Saturation}% ${SunGlow.Lightness}% / ${(SunGlow.PeakAlpha * horizonGlowAt(hour)).toFixed(3)})`
	};
}

export function sunArcPosition(hour: number) {
	const through = (hour - Daylight.SunriseAt) / (Daylight.SunsetAt - Daylight.SunriseAt);
	return { across: through, altitude: Math.sin(Math.max(0, Math.min(1, through)) * Math.PI), isUp: through >= 0 && through <= 1 };
}

export function moonArcPosition(hour: number) {
	const nightHour = hour >= Daylight.SunsetAt ? hour - Daylight.SunsetAt : hour + (HoursInADay - Daylight.SunsetAt);
	const through = nightHour / (HoursInADay - Daylight.SunsetAt + Daylight.SunriseAt);
	return { across: through, altitude: Math.sin(Math.max(0, Math.min(1, through)) * Math.PI), isUp: through >= 0 && through <= 1 };
}

function horizonGlowAt(hour: number) {
	const fromSunrise = Math.abs(hour - Daylight.SunriseAt);
	const fromSunset = Math.abs(hour - Daylight.SunsetAt);
	return Math.max(0, 1 - Math.min(fromSunrise, fromSunset) / 1.5);
}

function surroundingKeyframes(hour: number): [SkyKeyframe, SkyKeyframe] {
	const afterIndex = Keyframes.findIndex((keyframe) => keyframe.hour > hour);
	const index = afterIndex === -1 ? Keyframes.length - 1 : afterIndex;
	return [Keyframes[index - 1], Keyframes[index]];
}

function blend(from: Hsl, to: Hsl, progress: number): Hsl {
	return [from[0] + (to[0] - from[0]) * progress, from[1] + (to[1] - from[1]) * progress, from[2] + (to[2] - from[2]) * progress];
}

function hsl([hue, saturation, lightness]: Hsl, saturationScale: number) {
	return `hsl(${hue.toFixed(1)} ${Math.min(100, saturation * saturationScale).toFixed(1)}% ${lightness.toFixed(1)}%)`;
}
