import { bankStretchTool } from './bankStretchTool';

export const reedsTool = bankStretchTool((points) => ({ kind: 'reed_bed', points }));
