export type Hsl = [hue: number, saturation: number, lightness: number];

export interface HourKeyframe {
	hour: number;
}

export function surroundingKeyframes<Keyframe extends HourKeyframe>(keyframes: Keyframe[], hour: number): [before: Keyframe, after: Keyframe, progress: number] {
	const afterIndex = keyframes.findIndex((keyframe) => keyframe.hour > hour);
	const index = afterIndex === -1 ? keyframes.length - 1 : Math.max(1, afterIndex);
	const before = keyframes[index - 1];
	const after = keyframes[index];
	const span = after.hour - before.hour;
	const progress = span <= 0 ? 0 : Math.min(1, Math.max(0, (hour - before.hour) / span));
	return [before, after, progress];
}

export function blendHsl(from: Hsl, to: Hsl, progress: number): Hsl {
	return [blendHue(from[0], to[0], progress), blendNumber(from[1], to[1], progress), blendNumber(from[2], to[2], progress)];
}

export function blendNumber(from: number, to: number, progress: number) {
	return from + (to - from) * progress;
}

const DegreesInACircle = 360;

export function blendHue(from: number, to: number, progress: number) {
	const shortestTurn = ((((to - from) % DegreesInACircle) + DegreesInACircle * 1.5) % DegreesInACircle) - DegreesInACircle / 2;
	return (from + shortestTurn * progress + DegreesInACircle) % DegreesInACircle;
}

export function hslWords([hue, saturation, lightness]: Hsl, saturationScale = 1) {
	return `hsl(${hue.toFixed(1)} ${Math.min(100, saturation * saturationScale).toFixed(1)}% ${lightness.toFixed(1)}%)`;
}
