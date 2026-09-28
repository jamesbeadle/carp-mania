import { glslFloat as f } from './glslNumber';

export const CloudCover = { Clearest: 0.72, Spread: 0.5, OvercastClosing: 0.3, OvercastPower: 4 } as const;
export const CloudLayer = { HeightMetres: 1400, ShadowPatchMetres: 900, LowestSun: 0.2 } as const;

export const CoverThreshold = `
float coverThreshold(float cover) {
	return ${f(CloudCover.Clearest)} - ${f(CloudCover.Spread)} * cover - ${f(CloudCover.OvercastClosing)} * pow(cover, ${f(CloudCover.OvercastPower)});
}`;
