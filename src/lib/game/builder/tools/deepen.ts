import { WorkPrices } from '$lib/domain/groundworks/catalogue';
import { drawnShapeTool } from './drawnShapeTool';

export const DefaultHoleDepthFeet = (WorkPrices.Deepen.minimumDepthFeet + WorkPrices.Deepen.maximumDepthFeet) / 2;

export const deepenTool = drawnShapeTool((points) => ({ kind: 'deepen', points, depthFeet: DefaultHoleDepthFeet }));
