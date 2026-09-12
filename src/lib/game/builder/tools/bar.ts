import { WorkPrices } from '$lib/domain/groundworks/catalogue';
import { areaTool } from './areaTool';

export const DefaultBarDepthFeet = WorkPrices.BarDepth.maximumFeet - 1;

export const barTool = areaTool((points) => ({ kind: 'gravel_bar', points, depthFeet: DefaultBarDepthFeet }));
