import { blendHsl, blendNumber, hslWords, surroundingKeyframes, type Hsl, type HourKeyframe } from './keyframes';

interface LightKeyframe extends HourKeyframe {
	moment: string;
	shade: Hsl;
	shadeOpacity: number;
	glow: Hsl;
	glowOpacity: number;
}

export interface DayLight {
	shadeColour: string;
	shadeOpacity: number;
	glowColour: string;
	glowOpacity: number;
}

const Night: Omit<LightKeyframe, 'hour'> = { moment: 'night', shade: [228, 46, 14], shadeOpacity: 0.72, glow: [232, 40, 30], glowOpacity: 0 };

export const LightKeyframes: LightKeyframe[] = [
	{ hour: 0, ...Night },
	{ hour: 4.5, moment: 'before dawn', shade: [222, 42, 22], shadeOpacity: 0.64, glow: [345, 55, 62], glowOpacity: 0.08 },
	{ hour: 6, moment: 'sunrise', shade: [18, 48, 42], shadeOpacity: 0.26, glow: [24, 90, 62], glowOpacity: 0.42 },
	{ hour: 7.5, moment: 'morning', shade: [40, 40, 60], shadeOpacity: 0.06, glow: [46, 85, 72], glowOpacity: 0.16 },
	{ hour: 12, moment: 'midday', shade: [40, 40, 60], shadeOpacity: 0, glow: [46, 85, 72], glowOpacity: 0 },
	{ hour: 17.5, moment: 'golden hour', shade: [30, 45, 45], shadeOpacity: 0.1, glow: [36, 92, 58], glowOpacity: 0.28 },
	{ hour: 19.5, moment: 'sunset', shade: [262, 35, 30], shadeOpacity: 0.32, glow: [14, 88, 56], glowOpacity: 0.44 },
	{ hour: 21, moment: 'blue hour', shade: [232, 46, 20], shadeOpacity: 0.62, glow: [278, 42, 46], glowOpacity: 0.12 },
	{ hour: 24, ...Night }
];

export function lightAt(hour: number): DayLight {
	const [before, after, progress] = surroundingKeyframes(LightKeyframes, hour);
	return {
		shadeColour: hslWords(blendHsl(before.shade, after.shade, progress)),
		shadeOpacity: blendNumber(before.shadeOpacity, after.shadeOpacity, progress),
		glowColour: hslWords(blendHsl(before.glow, after.glow, progress)),
		glowOpacity: blendNumber(before.glowOpacity, after.glowOpacity, progress)
	};
}
