export interface SkyFrame {
	context: CanvasRenderingContext2D;
	width: number;
	height: number;
	secondsElapsed: number;
	timeSeconds: number;
}

const LongestFrameSeconds = 0.1;

export function startSkyLoop(canvas: HTMLCanvasElement, draw: (frame: SkyFrame) => void) {
	const context = canvas.getContext('2d');
	if (!context) return () => {};
	let frameHandle = 0;
	let lastTimestamp = performance.now();
	const startTimestamp = lastTimestamp;

	const frame = (timestamp: number) => {
		const secondsElapsed = Math.min(LongestFrameSeconds, (timestamp - lastTimestamp) / 1000);
		lastTimestamp = timestamp;
		const { width, height } = fitToDisplay(canvas, context);
		draw({ context, width, height, secondsElapsed, timeSeconds: (timestamp - startTimestamp) / 1000 });
		frameHandle = requestAnimationFrame(frame);
	};
	frameHandle = requestAnimationFrame(frame);
	return () => cancelAnimationFrame(frameHandle);
}

function fitToDisplay(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
	const pixelRatio = window.devicePixelRatio || 1;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const backingWidth = Math.round(width * pixelRatio);
	const backingHeight = Math.round(height * pixelRatio);
	if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
		canvas.width = backingWidth;
		canvas.height = backingHeight;
	}
	context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	return { width, height };
}
