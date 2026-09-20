import { clampFraction } from '../fraction';
import type { Weather } from '../world/weather';
import { GlassWords, isWarmWind, WindWords } from '../world/weatherGlass';
import { magicHourShare, magicWindowAt } from './magicHours';

export const WeatherShift = {
	OvercastFallingWarmWind: 0.15,
	Rain: 0.05,
	BrightFlatHigh: -0.15,
	HeatwaveOnTheBottom: -0.2,
	HeatwaveOnAZig: 0.2,
	CalmBelow: 0.3
} as const;

export function weatherSizeShift(weather: Weather, isFishingAZig = false) {
	if (weather.kind === 'heat') return isFishingAZig ? WeatherShift.HeatwaveOnAZig : WeatherShift.HeatwaveOnTheBottom;
	if (weather.kind === 'rain') return WeatherShift.Rain;
	const isWarmAndFalling = weather.glass === 'falling' && isWarmWind(weather.windDirection);
	if (weather.kind === 'overcast' && isWarmAndFalling) return WeatherShift.OvercastFallingWarmWind;
	const isBrightAndFlat = weather.kind === 'clear' && weather.glass === 'rising' && weather.windStrength < WeatherShift.CalmBelow;
	if (isBrightAndFlat) return WeatherShift.BrightFlatHigh;
	return 0;
}

export function conditionsShareFor(hour: number, weather: Weather, isFishingAZig = false) {
	return clampFraction(magicHourShare(hour) + weatherSizeShift(weather, isFishingAZig));
}

export function weatherWords(weather: Weather) {
	const sky = SkyWords[weather.kind];
	const shift = weatherSizeShift(weather);
	return `${sky}, ${WindWords[weather.windDirection]} and ${GlassWords[weather.glass]} — ${verdictFor(shift)}`;
}

export function hourWords(hour: number) {
	return magicWindowAt(hour).words;
}

const SkyWords = { clear: 'Clear', overcast: 'Overcast', rain: 'Rain', mist: 'Mist', heat: 'A heatwave' } as const;

function verdictFor(shift: number) {
	if (shift >= WeatherShift.OvercastFallingWarmWind) return 'the big fish will feed';
	if (shift > 0) return 'a fair day for a good fish';
	if (shift <= WeatherShift.HeatwaveOnTheBottom) return 'nothing big will feed on the bottom';
	if (shift < 0) return 'the big fish will sit tight';
	return 'an ordinary day';
}
