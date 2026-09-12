import { bankStretchTool } from './bankStretchTool';

export const shelfTool = bankStretchTool((points) => ({ kind: 'margin_shelf', points, bed: 'gravel' }));
