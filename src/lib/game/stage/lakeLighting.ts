import { daylightAt } from '$lib/domain/world/hourOfDay';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { lightAt } from '../sky/lightPalette';
import type { StageConditions } from '../sky/stageConditions';

export interface LakeLighting {
	daylight: number;
	shadeColour: string;
	shadeOpacity: number;
	glowColour: string;
	glowOpacity: number;
	seasonTint: string;
	seasonFilter: string;
}

const SeasonTints: Record<SeasonName, { tint: string; filter: string }> = {
	winter: { tint: 'hsla(210 40% 82% / 0.28)', filter: 'saturate(0.62) brightness(1.04)' },
	spring: { tint: 'hsla(96 60% 70% / 0.08)', filter: 'saturate(1.05)' },
	summer: { tint: 'hsla(60 70% 70% / 0.08)', filter: 'saturate(1.12) contrast(1.02)' },
	autumn: { tint: 'hsla(28 70% 45% / 0.22)', filter: 'saturate(0.9) sepia(0.12)' }
};
const OvercastFilter = ' brightness(0.88)';
const DullWeather = { GlowLeft: 0.35 } as const;

export function lakeLightingFor(conditions: StageConditions): LakeLighting {
	const light = lightAt(conditions.hour);
	const season = SeasonTints[conditions.season];
	const isDull = conditions.weather.kind === 'rain' || conditions.weather.kind === 'overcast';
	return {
		daylight: daylightAt(conditions.hour),
		shadeColour: light.shadeColour,
		shadeOpacity: light.shadeOpacity,
		glowColour: light.glowColour,
		glowOpacity: isDull ? light.glowOpacity * DullWeather.GlowLeft : light.glowOpacity,
		seasonTint: season.tint,
		seasonFilter: isDull ? season.filter + OvercastFilter : season.filter
	};
}
