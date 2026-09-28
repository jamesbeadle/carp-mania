import type { HazeColours } from './aerialHaze';
import { HorizonProbe } from './horizonProbe';
import { PostEffects } from './postEffects';
import { renderQuality } from './renderQuality';
import { ACESFilmicToneMapping, AgXToneMapping, MathUtils, PCFShadowMap, PerspectiveCamera, PMREMGenerator, SRGBColorSpace } from 'three';
import { Vector2, WebGLRenderer, type Scene, type Vector3 } from 'three';

const MostSecondsPerFrame = 0.1;
const MillisecondsPerSecond = 1000;

export type FrameStep = (secondsElapsed: number, timeSeconds: number) => void;

export const Exposure = { Day: 1.6, Twilight: 1.85, Night: 1.5, TwilightDaylight: 0.35 } as const;
const Looks = { Graded: { toneMapping: AgXToneMapping, exposureShare: 1 }, SeeThrough: { toneMapping: ACESFilmicToneMapping, exposureShare: 0.8 } } as const;

function exposureAt(daylight: number) {
	if (daylight < Exposure.TwilightDaylight) return MathUtils.lerp(Exposure.Night, Exposure.Twilight, daylight / Exposure.TwilightDaylight);
	return MathUtils.lerp(Exposure.Twilight, Exposure.Day, (daylight - Exposure.TwilightDaylight) / (1 - Exposure.TwilightDaylight));
}
const FieldOfView = { Landscape: 50, Portrait: 72 } as const;
const EnvironmentStrength = 0.55;
const EnvironmentCapture = { Blur: 0, Nearest: 0.1, Farthest: 20000 } as const;

export interface LakeRenderer {
	expose: (daylight: number) => void;
	lightFrom: (skyScene: Scene) => void;
	readHorizon: (skyScene: Scene, sunDirection: Vector3) => HazeColours;
	stop: () => void;
}

export function isWebGlAvailable() {
	const canvas = document.createElement('canvas');
	return canvas.getContext('webgl2') !== null || canvas.getContext('webgl') !== null;
}

function lookFor(isSeeThrough: boolean) {
	return isSeeThrough ? Looks.SeeThrough : Looks.Graded;
}

function rendererOn(canvas: HTMLCanvasElement, isSeeThrough: boolean) {
	const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: isSeeThrough, powerPreference: 'high-performance' });
	renderer.setPixelRatio(Math.min(renderQuality().mostPixelRatio, window.devicePixelRatio || 1));
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = lookFor(isSeeThrough).toneMapping;
	renderer.toneMappingExposure = Exposure.Day;
	const shadows = renderer.shadowMap;
	shadows.enabled = true;
	shadows.type = PCFShadowMap;
	return renderer;
}

function fitTo(canvas: HTMLCanvasElement, renderer: WebGLRenderer, camera: PerspectiveCamera, onResize: (width: number, height: number) => void, effects: PostEffects | null) {
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const size = renderer.getSize(new Vector2());
	if (size.x === width && size.y === height) return;
	renderer.setSize(width, height, false);
	effects?.resize(width, height, renderer.getPixelRatio());
	camera.aspect = width / Math.max(1, height);
	camera.fov = camera.aspect < 1 ? FieldOfView.Portrait : FieldOfView.Landscape;
	camera.updateProjectionMatrix();
	onResize(width, height);
}

export function startLakeRenderer(canvas: HTMLCanvasElement, scene: Scene, camera: PerspectiveCamera, step: FrameStep, onResize: (width: number, height: number) => void, isSeeThrough = false): LakeRenderer {
	const renderer = rendererOn(canvas, isSeeThrough);
	const effects = isSeeThrough ? null : new PostEffects(renderer, scene, camera);
	const draw = effects ? () => effects.render() : () => renderer.render(scene, camera);
	let frameHandle = 0;
	let last: number | null = null;
	let start = 0;
	const frame = (now: number) => {
		start = last === null ? now : start;
		const secondsElapsed = last === null ? 0 : Math.min(MostSecondsPerFrame, Math.max(0, (now - last) / MillisecondsPerSecond));
		fitTo(canvas, renderer, camera, onResize, effects);
		step(secondsElapsed, (now - start) / MillisecondsPerSecond);
		last = now;
		draw();
		frameHandle = requestAnimationFrame(frame);
	};
	frameHandle = requestAnimationFrame(frame);
	const expose = (daylight: number) => void (renderer.toneMappingExposure = exposureAt(daylight) * lookFor(isSeeThrough).exposureShare);
	const environment = new PMREMGenerator(renderer);
	const lightFrom = (skyScene: Scene) => {
		const previous = scene.environment;
		scene.environment = environment.fromScene(skyScene, EnvironmentCapture.Blur, EnvironmentCapture.Nearest, EnvironmentCapture.Farthest).texture;
		scene.environmentIntensity = EnvironmentStrength;
		previous?.dispose();
	};
	const probe = new HorizonProbe(renderer);
	const readHorizon = (skyScene: Scene, sunDirection: Vector3) => probe.measure(skyScene, sunDirection);
	return { expose, lightFrom, readHorizon, stop: () => (cancelAnimationFrame(frameHandle), environment.dispose(), probe.dispose(), renderer.dispose()) };
}
