import { ACESFilmicToneMapping, AgXToneMapping, MathUtils } from 'three';

export const Exposure = { Day: 1.6, Twilight: 1.85, Night: 1.6, TwilightDaylight: 0.35 } as const;
const Looks = { Graded: { toneMapping: AgXToneMapping, exposureShare: 1 }, SeeThrough: { toneMapping: ACESFilmicToneMapping, exposureShare: 0.8 } } as const;

export function exposureAt(daylight: number) {
	if (daylight < Exposure.TwilightDaylight) return MathUtils.lerp(Exposure.Night, Exposure.Twilight, daylight / Exposure.TwilightDaylight);
	return MathUtils.lerp(Exposure.Twilight, Exposure.Day, (daylight - Exposure.TwilightDaylight) / (1 - Exposure.TwilightDaylight));
}

export function lookFor(isSeeThrough: boolean) {
	return isSeeThrough ? Looks.SeeThrough : Looks.Graded;
}
