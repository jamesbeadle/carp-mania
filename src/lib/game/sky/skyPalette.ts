import type { SeasonName } from '$lib/domain/world/worldClock';
import { Daylight, daylightAt, HoursInADay } from '$lib/domain/world/hourOfDay';
import { blendHsl, hslWords, surroundingKeyframes, type Hsl, type HourKeyframe } from './keyframes';

interface SkyKeyframe extends HourKeyframe {
	moment: string;
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

const Night: Omit<SkyKeyframe, 'hour'> = { moment: 'night', top: [228, 46, 8], horizon: [226, 36, 16] };

const SkyKeyframes: SkyKeyframe[] = [
	{ hour: 0, ...Night },
	{ hour: 4.5, moment: 'before dawn', top: [226, 44, 12], horizon: [218, 34, 26] },
	{ hour: 6, moment: 'sunrise', top: [216, 42, 34], horizon: [22, 82, 62] },
	{ hour: 7.5, moment: 'morning', top: [208, 60, 58], horizon: [38, 80, 80] },
	{ hour: 12, moment: 'midday', top: [206, 70, 52], horizon: [202, 58, 80] },
	{ hour: 17.5, moment: 'golden hour', top: [210, 56, 54], horizon: [34, 78, 70] },
	{ hour: 19.5, moment: 'sunset', top: [246, 40, 30], horizon: [12, 84, 54] },
	{ hour: 21, moment: 'blue hour', top: [232, 46, 13], horizon: [258, 34, 22] },
	{ hour: 24, ...Night }
];

const SeasonSaturation: Record<SeasonName, number> = { winter: 0.7, spring: 1, summer: 1.1, autumn: 0.9 };
const SunGlow = { Hue: 36, Saturation: 90, Lightness: 70, PeakAlpha: 0.55, HoursEitherSide: 1.5 } as const;

export function skyLookFor(hour: number, season: SeasonName): SkyLook {
	const [before, after, progress] = surroundingKeyframes(SkyKeyframes, hour);
	const daylight = daylightAt(hour);
	const saturation = SeasonSaturation[season];
	return {
		top: hslWords(blendHsl(before.top, after.top, progress), saturation),
		horizon: hslWords(blendHsl(before.horizon, after.horizon, progress), saturation),
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
	return Math.max(0, 1 - Math.min(fromSunrise, fromSunset) / SunGlow.HoursEitherSide);
}
