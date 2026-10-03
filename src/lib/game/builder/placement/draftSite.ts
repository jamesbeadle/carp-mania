import { siteCorners } from '$lib/domain/groundworks/sites/siteFootprint';
import { siteOfWork } from '$lib/domain/groundworks/sites/siteOfWork';
import { siteOf, sitesOf } from '$lib/domain/groundworks/sites/sitesOf';
import type { WorkDraft } from '$lib/domain/groundworks/workKinds';
import type { FacilitySite } from '$lib/domain/layout/facilitySite';
import { layoutScaleFor } from '$lib/domain/layout/layoutScale';
import type { Lake, Swim } from '$lib/domain/types';
import type { DraftShape } from '../../render/drawUnderConstruction';
import { scenePixelsPerFootFor } from '../../render/sites/siteFrame';

type Plot = Pick<Lake, 'layout' | 'plot_acres'>;

export function draftSiteOf(draft: WorkDraft, lake: Plot, swims: Swim[]): FacilitySite | null {
	if (draft.kind !== 'upgrade_car_park') return siteOfWork(draft, lake.layout);
	const site = siteOf(sitesOf(lake.layout, Number(lake.plot_acres), swims), 'car_park');
	return site ? { ...site, carPark: draft.carPark } : null;
}

export function siteDraftShape(site: FacilitySite, lake: Plot, label: string, isValid: boolean): DraftShape {
	const plotAcres = Number(lake.plot_acres);
	const points = siteCorners(site, layoutScaleFor(plotAcres));
	return { kind: 'polygon', points, label, isValid, preview: { site, pixelsPerFoot: scenePixelsPerFootFor(plotAcres) } };
}
