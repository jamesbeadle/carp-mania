import type { Viewport } from './projection';

const MaximumFrameSeconds = 0.1;
const MillisecondsPerSecond = 1000;

export type FrameDrawer = (context: CanvasRenderingContext2D, viewport: Viewport, secondsElapsed: number) => void;

export function startGlobeRenderLoop(canvas: HTMLCanvasElement, draw: FrameDrawer) {
	const context = canvas.getContext('2d');
	if (!context) return () => {};
	let frameHandle = 0;
	let lastTimestamp = performance.now();

	const frame = (timestamp: number) => {
		const secondsElapsed = Math.min(MaximumFrameSeconds, (timestamp - lastTimestamp) / MillisecondsPerSecond);
		lastTimestamp = timestamp;
		const viewport = fitToDisplay(canvas, context);
		if (viewport.width > 0 && viewport.height > 0) draw(context, viewport, secondsElapsed);
		frameHandle = requestAnimationFrame(frame);
	};
	frameHandle = requestAnimationFrame(frame);
	return () => cancelAnimationFrame(frameHandle);
}

function fitToDisplay(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): Viewport {
	const pixelRatio = window.devicePixelRatio || 1;
	const viewport = { width: canvas.clientWidth, height: canvas.clientHeight };
	const displayWidth = Math.round(viewport.width * pixelRatio);
	const displayHeight = Math.round(viewport.height * pixelRatio);
	const needsResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
	if (needsResize) {
		canvas.width = displayWidth;
		canvas.height = displayHeight;
	}
	context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	return viewport;
}
