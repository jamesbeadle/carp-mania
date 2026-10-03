import { layoutScaleFor } from '../../layout/layoutScale';
import type { FacilitySite } from '../../layout/facilitySite';
import { Facilities, type LakeLayout, type LayoutPoint } from '../../layout/layoutTypes';
import { swimPoint } from '../../layout/swimRules';
import type { Swim } from '../../types';
import { defaultSiteFor } from './defaultSite';

export function sitesOf(layout: LakeLayout, plotAcres: number, swims: Pick<Swim, 'position_x' | 'position_y'>[]): FacilitySite[] {
	return sitesAmongPegs(layout, plotAcres, pegPointsOf(swims));
}

export function sitesAmongPegs(layout: LakeLayout, plotAcres: number, pegs: LayoutPoint[]): FacilitySite[] {
	const built = Facilities.filter((facility) => layout.facilities.includes(facility));
	const stored = (layout.sites ?? []).filter((site) => built.includes(site.facility));
	const surroundings = { layout, scale: layoutScaleFor(plotAcres), pegs, neighbours: [...stored] };
	const unsited = built.filter((facility) => !stored.some((site) => site.facility === facility));
	for (const [index, facility] of unsited.entries()) surroundings.neighbours.push(defaultSiteFor(facility, index, surroundings));
	return surroundings.neighbours;
}

export function siteOf(sites: FacilitySite[], facility: FacilitySite['facility']) {
	return sites.find((site) => site.facility === facility) ?? null;
}

export function pegPointsOf(swims: Pick<Swim, 'position_x' | 'position_y'>[]): LayoutPoint[] {
	return swims.map(swimPoint);
}
