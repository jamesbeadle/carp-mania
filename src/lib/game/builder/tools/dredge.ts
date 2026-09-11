import { areaTool } from './areaTool';

export const dredgeTool = areaTool((points) => ({ kind: 'dredge', points }));
