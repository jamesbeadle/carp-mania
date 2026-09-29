import { PCFShadowMap, SRGBColorSpace, Vector2, WebGLRenderer, type PerspectiveCamera } from 'three';
import type { PostEffects } from './postEffects';
import { Exposure, lookFor } from './rendererExposure';
import { renderQuality } from './renderQuality';

const FieldOfView = { Landscape: 50, Portrait: 72 } as const;

export function basePixelRatio() {
	const { mostPixelRatio } = renderQuality();
	return Math.min(mostPixelRatio, window.devicePixelRatio || 1);
}

export function rendererOn(canvas: HTMLCanvasElement, isSeeThrough: boolean) {
	const renderer = new WebGLRenderer({ canvas, antialias: isSeeThrough, alpha: isSeeThrough, powerPreference: 'high-performance' });
	renderer.setPixelRatio(basePixelRatio());
	renderer.outputColorSpace = SRGBColorSpace;
	const { toneMapping } = lookFor(isSeeThrough);
	renderer.toneMapping = toneMapping;
	renderer.toneMappingExposure = Exposure.Day;
	const shadows = renderer.shadowMap;
	shadows.enabled = true;
	shadows.type = PCFShadowMap;
	return renderer;
}

export function fitTo(canvas: HTMLCanvasElement, renderer: WebGLRenderer, camera: PerspectiveCamera, pixelRatio: number, onResize: (width: number, height: number) => void, effects: PostEffects | null) {
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const size = renderer.getSize(new Vector2());
	const isFitted = size.x === width && size.y === height && renderer.getPixelRatio() === pixelRatio;
	if (isFitted) return;
	renderer.setPixelRatio(pixelRatio);
	renderer.setSize(width, height, false);
	effects?.resize(width, height, pixelRatio);
	camera.aspect = width / Math.max(1, height);
	camera.fov = camera.aspect < 1 ? FieldOfView.Portrait : FieldOfView.Landscape;
	camera.updateProjectionMatrix();
	onResize(width, height);
}
