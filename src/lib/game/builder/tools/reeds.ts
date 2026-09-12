import { drawnShapeTool } from './drawnShapeTool';

export const reedsTool = drawnShapeTool((points) => ({ kind: 'reed_bed', points }));
