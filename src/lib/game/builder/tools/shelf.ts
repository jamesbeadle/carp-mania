import { drawnShapeTool } from './drawnShapeTool';

export const shelfTool = drawnShapeTool((points) => ({ kind: 'margin_shelf', points, bed: 'gravel' }));
