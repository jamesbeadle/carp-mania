import { smoothBank } from '$lib/domain/groundworks/shoreline/sculptBank';
import { sceneDistance } from '../sceneDistance';
import { bankBrushTool } from './bankBrush';

export const smoothTool = bankBrushTool((outline, brush, point) => smoothBank(outline, { ...brush, at: point }, sceneDistance));
