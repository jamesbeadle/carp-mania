import { lineVisibility, type LineStats } from '../tackle/lines';
import type { BedType } from '../types';
import { WaterScale } from '../waterQuality';

const ColouredLineBlendsBelowTransparency = 55;
const ThicknessWeight = 0.6;
const Blend = {
	Clear: 0.9,
	Camo: 0.85,
	CamoOverGravelOrWeed: 1,
	ColouredInColouredWater: 0.85,
	BrownOverSilt: 1,
	WrongColour: 0.45
} as const;
const SiltyAbove = 50;

export function lineMatchScore(line: LineStats, transparency: number, silt: number, bed: BedType = 'clay', isWeedy = false) {
	const waterHidesLine = 1 - transparency / WaterScale.Best;
	const colourBlend = colourBlendScore(line, transparency, silt, bed, isWeedy);
	const thicknessPenalty = lineVisibility(line) * (1 - waterHidesLine);
	return clamp(colourBlend - thicknessPenalty * ThicknessWeight);
}

function colourBlendScore(line: LineStats, transparency: number, silt: number, bed: BedType, isWeedy: boolean) {
	if (line.colour === 'clear') return Blend.Clear;
	if (line.colour === 'camo') return bed === 'gravel' || isWeedy ? Blend.CamoOverGravelOrWeed : Blend.Camo;
	const isWaterColoured = transparency < ColouredLineBlendsBelowTransparency;
	if (isWaterColoured) return line.colour === 'brown' && silt > SiltyAbove ? Blend.BrownOverSilt : Blend.ColouredInColouredWater;
	return Blend.WrongColour;
}

function clamp(value: number) {
	return Math.min(1, Math.max(0.05, value));
}
