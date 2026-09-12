import { drawnShapeTool } from './drawnShapeTool';

export const dredgeTool = drawnShapeTool((points) => ({ kind: 'dredge', points }));
