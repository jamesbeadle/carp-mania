import type { WeatherKind } from '$lib/domain/world/weather';
import type { StageConditions } from '../sky/stageConditions';

const TimeOfDayWords: [fromHour: number, word: string][] = [
	[0, 'the small hours'],
	[4.5, 'first light'],
	[6.5, 'morning'],
	[11.5, 'midday'],
	[14, 'afternoon'],
	[17.5, 'evening'],
	[19.5, 'dusk'],
	[21, 'night']
];

const WeatherWords: Record<WeatherKind, string> = {
	clear: 'clear skies',
	overcast: 'overcast',
	rain: 'light rain',
	mist: 'mist on the water',
	heat: 'a heatwave'
};

export function conditionsCaption(conditions: StageConditions) {
	return `${conditions.season} · ${timeOfDayWord(conditions.hour)} · ${WeatherWords[conditions.weather.kind]}`;
}

function timeOfDayWord(hour: number) {
	const band = [...TimeOfDayWords].reverse().find(([fromHour]) => hour >= fromHour);
	return band ? band[1] : TimeOfDayWords[0][1];
}
