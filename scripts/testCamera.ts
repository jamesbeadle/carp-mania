import assert from 'node:assert/strict';
import { CameraLimits, clampCamera, fittedCamera, isZoomable, pannedBy, sceneToView, viewToScene, zoomedAround } from '../src/lib/game/scene/camera';
import { clusterSwims, isClustered } from '../src/lib/game/scene/clusterSwims';
import { SceneSize } from '../src/lib/game/scene/palette';
import type { Swim } from '../src/lib/domain/types';

const PhonePixelsPerScenePixel = 390 / SceneSize.Width;
const Middle = 0.5;
const Nudge = 0.01;
const Corner = 0.9;

function swimAt(index: number, x: number, y: number): Swim {
	return { id: `swim-${index}`, lake_id: 'lake-1', name: `Peg ${index}`, position_x: x, position_y: y };
}

export function runCameraScenarios() {
	const fitted = fittedCamera();
	assert.equal(fitted.zoom, 1);
	const point = { x: 300, y: 200 };
	const zoomed = zoomedAround(fitted, 2, point);
	assert.equal(zoomed.zoom, 2);
	const stillThere = viewToScene(zoomed, sceneToView(fitted, point));
	const drift = Math.hypot(stillThere.x - point.x) + Math.abs(stillThere.y - point.y);
	assert.ok(drift < 0.001, 'the point under the cursor stays put when zooming');
	assert.equal(clampCamera({ zoom: 20, centre: { x: 0, y: 0 } }).zoom, CameraLimits.MostZoom, 'zoom is capped');
	const edge = clampCamera({ zoom: 2, centre: { x: 0, y: 0 } });
	const quarterAcross = SceneSize.Width / 4;
	assert.equal(edge.centre.x, quarterAcross, 'the view never leaves the scene');
	const panned = pannedBy(fitted, 100, 100);
	const fittedCentre = fitted.centre;
	assert.equal(panned.centre.x, fittedCentre.x, 'a fitted view cannot pan');
	assert.ok(isZoomable(200) && !isZoomable(10));
	const tight = [swimAt(1, Middle, Middle), swimAt(2, Middle + Nudge, Middle), swimAt(3, Corner, Corner)];
	const onAPhone = clusterSwims(tight, PhonePixelsPerScenePixel);
	assert.ok(onAPhone.some(isClustered), 'pegs 8 px apart on a phone cluster');
	const zoomedIn = clusterSwims(tight, PhonePixelsPerScenePixel * CameraLimits.MostZoom);
	assert.ok(!zoomedIn.some(isClustered), 'and come apart when zoomed');
}
