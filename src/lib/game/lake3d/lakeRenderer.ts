import type { HazeColours } from './aerialHaze';
import { environmentLightOf } from './environmentLight';
import { runFrameLoop, type FrameStep } from './frameLoop';
import { PostEffects } from './postEffects';
import { exposureAt, lookFor } from './rendererExposure';
import { rendererOn } from './rendererFit';
import type { PerspectiveCamera, Scene, Vector3 } from 'three';

export type { FrameStep } from './frameLoop';

export interface LakeRenderer {
	expose: (daylight: number, share?: number) => void;
	lightFrom: (skyScene: Scene) => void;
	readHorizon: (skyScene: Scene, sunDirection: Vector3) => HazeColours;
	readHorizonLater: (skyScene: Scene, sunDirection: Vector3) => Promise<HazeColours>;
	stop: () => void;
	whenFirstFrameDrawn: Promise<void>;
}

export function startLakeRenderer(canvas: HTMLCanvasElement, scene: Scene, camera: PerspectiveCamera, step: FrameStep, onResize: (width: number, height: number) => void, isSeeThrough = false): LakeRenderer {
	const renderer = rendererOn(canvas, isSeeThrough);
	const effects = isSeeThrough ? null : new PostEffects(renderer, scene, camera);
	const frames = runFrameLoop({ renderer, effects, canvas, scene, camera, step, onResize });
	const { exposureShare } = lookFor(isSeeThrough);
	const expose = (daylight: number, share = 1) => void (renderer.toneMappingExposure = exposureAt(daylight) * exposureShare * share);
	const environment = environmentLightOf(renderer, scene);
	const { lightFrom, readHorizon, readHorizonLater } = environment;
	const stop = () => (frames.stop(), effects?.dispose(), environment.dispose(), renderer.dispose());
	return { expose, lightFrom, readHorizon, readHorizonLater, stop, whenFirstFrameDrawn: frames.whenFirstFrameDrawn };
}
