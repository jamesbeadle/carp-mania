import { sitesOf } from '$lib/domain/groundworks/sites/sitesOf';
import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import type { Lake, Swim } from '$lib/domain/types';
import type { SitesOnTheScene } from '../render/drawFacilities';
import { scenePixelsPerFootFor } from '../render/sites/siteFrame';

export function createSitesOnTheScene(layout: LakeLayout) {
	let swimsSeen: Swim[] | null = null;
	let scene: SitesOnTheScene | null = null;
	return function sitesOnTheScene(lake: Pick<Lake, 'plot_acres'>, swims: Swim[]): SitesOnTheScene {
		if (scene && swimsSeen === swims) return scene;
		const plotAcres = Number(lake.plot_acres);
		swimsSeen = swims;
		scene = { sites: sitesOf(layout, plotAcres, swims), pixelsPerFoot: scenePixelsPerFootFor(plotAcres) };
		return scene;
	};
}
