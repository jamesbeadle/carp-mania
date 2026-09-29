import type { HazeColours } from './aerialHaze';
import { environmentLightOf } from './environmentLight';
import { FrameGovernor } from './frameGovernor';
import { PostEffects } from './postEffects';
import { exposureAt, lookFor } from './rendererExposure';
import { basePixelRatio, fitTo, rendererOn } from './rendererFit';
import type { PerspectiveCamera, Scene, Vector3 } from 'three';

const MostSecondsPerFrame = 0.1;
const MillisecondsPerSecond = 1000;

export type FrameStep = (secondsElapsed: number, timeSeconds: number) => void;

export interface LakeRenderer {
	expose: (daylight: number, share?: number) => void;
	lightFrom: (skyScene: Scene) => void;
	readHorizon: (skyScene: Scene, sunDirection: Vector3) => HazeColours;
	readHorizonLater: (skyScene: Scene, sunDirection: Vector3) => Promise<HazeColours>;
	stop: () => void;
}

export function isWebGlAvailable() {
	const canvas = document.createElement('canvas');
	return canvas.getContext('webgl2') !== null || canvas.getContext('webgl') !== null;
}

export function startLakeRenderer(canvas: HTMLCanvasElement, scene: Scene, camera: PerspectiveCamera, step: FrameStep, onResize: (width: number, height: number) => void, isSeeThrough = false): LakeRenderer {
	const renderer = rendererOn(canvas, isSeeThrough);
	const effects = isSeeThrough ? null : new PostEffects(renderer, scene, camera);
	const draw = effects ? () => effects.render() : () => renderer.render(scene, camera);
	const governor = new FrameGovernor();
	const fullPixelRatio = basePixelRatio();
	let frameHandle = 0;
	let last: number | null = null;
	let start = 0;
	const frame = (now: number) => {
		start = last === null ? now : start;
		const frameSeconds = last === null ? 0 : Math.max(0, (now - last) / MillisecondsPerSecond);
		governor.note(frameSeconds);
		fitTo(canvas, renderer, camera, fullPixelRatio * governor.scale, onResize, effects);
		step(Math.min(MostSecondsPerFrame, frameSeconds), (now - start) / MillisecondsPerSecond);
		last = now;
		draw();
		frameHandle = requestAnimationFrame(frame);
	};
	frameHandle = requestAnimationFrame(frame);
	const { exposureShare } = lookFor(isSeeThrough);
	const expose = (daylight: number, share = 1) => void (renderer.toneMappingExposure = exposureAt(daylight) * exposureShare * share);
	const environment = environmentLightOf(renderer, scene);
	const stop = () => (cancelAnimationFrame(frameHandle), environment.dispose(), renderer.dispose());
	const { lightFrom, readHorizon, readHorizonLater } = environment;
	return { expose, lightFrom, readHorizon, readHorizonLater, stop };
}
