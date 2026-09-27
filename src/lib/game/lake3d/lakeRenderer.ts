import { ACESFilmicToneMapping, PCFShadowMap, PerspectiveCamera, SRGBColorSpace, Vector2, WebGLRenderer, type Scene } from 'three';

const MostPixelRatio = 2;
const MostSecondsPerFrame = 0.1;
const MillisecondsPerSecond = 1000;

export type FrameStep = (secondsElapsed: number, timeSeconds: number) => void;

export const Exposure = { Day: 0.55, Night: 1.3 } as const;
const FieldOfView = { Landscape: 50, Portrait: 72 } as const;

export interface LakeRenderer {
	expose: (daylight: number) => void;
	stop: () => void;
}

export function isWebGlAvailable() {
	const canvas = document.createElement('canvas');
	return canvas.getContext('webgl2') !== null || canvas.getContext('webgl') !== null;
}

function rendererOn(canvas: HTMLCanvasElement, isSeeThrough: boolean) {
	const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: isSeeThrough, powerPreference: 'high-performance' });
	renderer.setPixelRatio(Math.min(MostPixelRatio, window.devicePixelRatio || 1));
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = ACESFilmicToneMapping;
	renderer.toneMappingExposure = Exposure.Day;
	const shadows = renderer.shadowMap;
	shadows.enabled = true;
	shadows.type = PCFShadowMap;
	return renderer;
}

function fitTo(canvas: HTMLCanvasElement, renderer: WebGLRenderer, camera: PerspectiveCamera, onResize: (width: number, height: number) => void) {
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const size = renderer.getSize(new Vector2());
	if (size.x === width && size.y === height) return;
	renderer.setSize(width, height, false);
	camera.aspect = width / Math.max(1, height);
	camera.fov = camera.aspect < 1 ? FieldOfView.Portrait : FieldOfView.Landscape;
	camera.updateProjectionMatrix();
	onResize(width, height);
}

export function startLakeRenderer(canvas: HTMLCanvasElement, scene: Scene, camera: PerspectiveCamera, step: FrameStep, onResize: (width: number, height: number) => void, isSeeThrough = false): LakeRenderer {
	const renderer = rendererOn(canvas, isSeeThrough);
	let frameHandle = 0;
	let last: number | null = null;
	let start = 0;
	const frame = (now: number) => {
		start = last === null ? now : start;
		const secondsElapsed = last === null ? 0 : Math.min(MostSecondsPerFrame, Math.max(0, (now - last) / MillisecondsPerSecond));
		fitTo(canvas, renderer, camera, onResize);
		step(secondsElapsed, (now - start) / MillisecondsPerSecond);
		last = now;
		renderer.render(scene, camera);
		frameHandle = requestAnimationFrame(frame);
	};
	frameHandle = requestAnimationFrame(frame);
	const expose = (daylight: number) => void (renderer.toneMappingExposure = Exposure.Night + (Exposure.Day - Exposure.Night) * daylight);
	return { expose, stop: () => (cancelAnimationFrame(frameHandle), renderer.dispose()) };
}
