import { LineVisibility, type LineChoice } from '../tackle/lines';
import { WaterScale } from '../waterQuality';

const ColouredLineBlendsBelowTransparency = 55;

export function lineMatchScore(line: LineChoice, transparency: number, silt: number) {
	const waterHidesLine = 1 - transparency / WaterScale.Best;
	const colourBlend = colourBlendScore(line, transparency, silt);
	const thicknessPenalty = LineVisibility[line.thickness] * (1 - waterHidesLine);
	return clamp(colourBlend - thicknessPenalty * 0.6);
}

function colourBlendScore(line: LineChoice, transparency: number, silt: number) {
	if (line.colour === 'clear') return 0.9;
	const isWaterColoured = transparency < ColouredLineBlendsBelowTransparency;
	if (isWaterColoured) return line.colour === 'brown' && silt > 50 ? 1 : 0.85;
	return 0.45;
}

function clamp(value: number) {
	return Math.min(1, Math.max(0.05, value));
}
