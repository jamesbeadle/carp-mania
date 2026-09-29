import type { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { FrameGovernor } from './frameGovernor';
import type { PostEffects } from './postEffects';
import { basePixelRatio, fitTo } from './rendererFit';

const MostSecondsPerFrame = 0.1;
const MillisecondsPerSecond = 1000;
const ShadowRefreshEveryFrames = 2;

export type FrameStep = (secondsElapsed: number, timeSeconds: number) => void;

export interface FrameLoopPlan {
	renderer: WebGLRenderer;
	effects: PostEffects | null;
	canvas: HTMLCanvasElement;
	scene: Scene;
	camera: PerspectiveCamera;
	step: FrameStep;
	onResize: (width: number, height: number) => void;
}

export function runFrameLoop(plan: FrameLoopPlan) {
	const { renderer, effects, canvas, scene, camera, step, onResize } = plan;
	const draw = effects ? () => effects.render() : () => renderer.render(scene, camera);
	const governor = new FrameGovernor();
	const fullPixelRatio = basePixelRatio();
	const shadows = renderer.shadowMap;
	shadows.autoUpdate = false;
	let handle = 0;
	let last: number | null = null;
	let start = 0;
	let frames = 0;
	const frame = (now: number) => {
		start = last === null ? now : start;
		const frameSeconds = last === null ? 0 : Math.max(0, (now - last) / MillisecondsPerSecond);
		governor.note(frameSeconds);
		fitTo(canvas, renderer, camera, fullPixelRatio * governor.scale, onResize, effects);
		step(Math.min(MostSecondsPerFrame, frameSeconds), (now - start) / MillisecondsPerSecond);
		frames += 1;
		shadows.needsUpdate = frames % ShadowRefreshEveryFrames !== 0;
		last = now;
		draw();
		handle = requestAnimationFrame(frame);
	};
	handle = requestAnimationFrame(frame);
	return () => cancelAnimationFrame(handle);
}
