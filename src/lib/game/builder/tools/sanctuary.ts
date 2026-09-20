import { drawnShapeTool } from './drawnShapeTool';

export const sanctuaryTool = drawnShapeTool((points) => ({ kind: 'sanctuary', points }));
