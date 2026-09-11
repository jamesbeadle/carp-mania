import { SceneSize } from './palette';

export function startRenderLoop(canvas: HTMLCanvasElement, draw: (context: CanvasRenderingContext2D, secondsElapsed: number, timeSeconds: number) => void) {
	const context = canvas.getContext('2d');
	if (!context) return () => {};
	let frameHandle = 0;
	let lastTimestamp = performance.now();
	const startTimestamp = lastTimestamp;

	const frame = (timestamp: number) => {
		const secondsElapsed = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
		lastTimestamp = timestamp;
		fitToDisplay(canvas, context);
		draw(context, secondsElapsed, (timestamp - startTimestamp) / 1000);
		frameHandle = requestAnimationFrame(frame);
	};
	frameHandle = requestAnimationFrame(frame);
	return () => cancelAnimationFrame(frameHandle);
}

function fitToDisplay(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
	const pixelRatio = window.devicePixelRatio || 1;
	const displayWidth = Math.round(canvas.clientWidth * pixelRatio);
	const displayHeight = Math.round(canvas.clientHeight * pixelRatio);
	const needsResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
	if (needsResize) {
		canvas.width = displayWidth;
		canvas.height = displayHeight;
	}
	context.setTransform(displayWidth / SceneSize.Width, 0, 0, displayHeight / SceneSize.Height, 0, 0);
}

export function toScenePoint(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
	const bounds = canvas.getBoundingClientRect();
	return {
		x: ((clientX - bounds.left) / bounds.width) * SceneSize.Width,
		y: ((clientY - bounds.top) / bounds.height) * SceneSize.Height
	};
}
