import { WorkPrices } from '$lib/domain/groundworks/catalogue';
import { drawnShapeTool } from './drawnShapeTool';

export const DefaultBarDepthFeet = WorkPrices.BarDepth.maximumFeet - 1;

export const barTool = drawnShapeTool((points) => ({ kind: 'gravel_bar', points, depthFeet: DefaultBarDepthFeet }));
