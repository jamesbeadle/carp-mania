import { Daylight, daylightAt } from '$lib/domain/world/hourOfDay';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { StageConditions } from '../sky/stageConditions';

export interface LakeLighting {
	nightOpacity: number;
	glowOpacity: number;
	glowColour: string;
	seasonTint: string;
	seasonFilter: string;
}

export const NightColour = 'hsl(228 45% 12%)';
const Night = { DeepestOpacity: 0.72 } as const;
const Glow = { PeakOpacity: 0.45, HoursEitherSide: 1.5, Colour: 'hsl(24 90% 55%)' } as const;
const SeasonTints: Record<SeasonName, { tint: string; filter: string }> = {
	winter: { tint: 'hsla(210 40% 82% / 0.28)', filter: 'saturate(0.62) brightness(1.04)' },
	spring: { tint: 'hsla(96 60% 70% / 0.08)', filter: 'saturate(1.05)' },
	summer: { tint: 'hsla(60 70% 70% / 0.08)', filter: 'saturate(1.12) contrast(1.02)' },
	autumn: { tint: 'hsla(28 70% 45% / 0.22)', filter: 'saturate(0.9) sepia(0.12)' }
};
const OvercastFilter = ' brightness(0.88)';

export function lakeLightingFor(conditions: StageConditions): LakeLighting {
	const daylight = daylightAt(conditions.hour);
	const season = SeasonTints[conditions.season];
	const isDull = conditions.weather.kind === 'rain' || conditions.weather.kind === 'overcast';
	return {
		nightOpacity: (1 - daylight) * Night.DeepestOpacity,
		glowOpacity: horizonGlowAt(conditions.hour) * Glow.PeakOpacity,
		glowColour: Glow.Colour,
		seasonTint: season.tint,
		seasonFilter: isDull ? season.filter + OvercastFilter : season.filter
	};
}

function horizonGlowAt(hour: number) {
	const nearest = Math.min(Math.abs(hour - Daylight.SunriseAt), Math.abs(hour - Daylight.SunsetAt));
	return Math.max(0, 1 - nearest / Glow.HoursEitherSide);
}
