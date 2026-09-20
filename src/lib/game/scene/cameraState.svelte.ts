import { centredOn, fittedCamera, pannedBy, viewToScene, zoomedAround, type Camera } from './camera';
import type { Point } from './lakeShape';
import { SceneSize } from './palette';
import { toScenePoint } from './renderLoop';

export class CameraState {
	camera = $state<Camera>(fittedCamera());

	get zoom() {
		return this.camera.zoom;
	}

	zoomAround(factor: number, around: Point) {
		this.camera = zoomedAround(this.camera, factor, around);
	}

	panBy(sceneDeltaX: number, sceneDeltaY: number) {
		this.camera = pannedBy(this.camera, sceneDeltaX, sceneDeltaY);
	}

	centreOn(point: Point) {
		this.camera = centredOn(this.camera, point);
	}

	reset() {
		this.camera = fittedCamera();
	}

	scenePointOf(canvas: HTMLCanvasElement, clientX: number, clientY: number): Point {
		return viewToScene(this.camera, toScenePoint(canvas, clientX, clientY));
	}

	pixelsPerScenePixel(canvas: HTMLCanvasElement) {
		const fit = canvas.clientWidth / SceneSize.Width;
		return fit * this.zoom;
	}
}
