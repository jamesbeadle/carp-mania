import type { BuilderTool } from '../toolCatalogue';
import { barTool } from './bar';
import { deepenTool } from './deepen';
import { dredgeTool } from './dredge';
import { facilityTool } from './facility';
import { islandTool } from './island';
import { landTool } from './land';
import { liliesTool } from './lilies';
import { redrawTool } from './redraw';
import { reedsTool } from './reeds';
import { sanctuaryTool } from './sanctuary';
import { selectTool } from './select';
import { shelfTool } from './shelf';
import { sculptTool } from './sculpt';
import { smoothTool } from './smooth';
import { snagTool } from './snag';
import { swimTool } from './swim';
import type { ToolHandlers } from './toolHandlers';

const HandlersByTool: Record<BuilderTool, ToolHandlers> = {
	select: selectTool,
	island: islandTool,
	bar: barTool,
	deepen: deepenTool,
	dredge: dredgeTool,
	shelf: shelfTool,
	reeds: reedsTool,
	lilies: liliesTool,
	snag: snagTool,
	sanctuary: sanctuaryTool,
	swim: swimTool,
	redraw: redrawTool,
	sculpt: sculptTool,
	smooth: smoothTool,
	land: landTool,
	facility: facilityTool
};

export function toolHandlersFor(tool: BuilderTool): ToolHandlers {
	return HandlersByTool[tool];
}
