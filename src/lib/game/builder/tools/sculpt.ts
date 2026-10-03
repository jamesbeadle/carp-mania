import { pushBank } from '$lib/domain/groundworks/shoreline/sculptBank';
import { sceneDistance } from '../sceneDistance';
import { bankBrushTool } from './bankBrush';

export const sculptTool = bankBrushTool((outline, brush, point) => {
	const movedBy = { x: point.x - brush.at.x, y: point.y - brush.at.y };
	return pushBank(outline, brush, movedBy, sceneDistance);
});
