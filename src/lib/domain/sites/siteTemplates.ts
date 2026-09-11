import { classicLayoutWithSwimTerrain } from '../layout/classicLayout';
import type { LakeLayout } from '../layout/layoutTypes';
import { waterAcres } from '../layout/waterArea';
import type { SiteType, Swim } from '../types';
import type { RegionCode } from '../world/regionCodes';
import { ClassicSwims } from './classicSite';
import { clayPitLayout, clayPitSwims } from './clayPitSite';
import { estateLakeLayout, estateLakeSwims } from './estateLakeSite';
import { farmPondLayout, farmPondSwims } from './farmPondSite';
import { gravelPitLayout, gravelPitSwims } from './gravelPitSite';
import { greenfieldLayout, greenfieldSwims } from './greenfieldSite';
import { quarryLayout, quarrySwims } from './quarrySite';
import { plotAcresFor, sitePriceFor } from './siteCatalogue';
import type { SiteSwim } from './siteShapes';

export interface SiteTemplate {
	layout: () => LakeLayout;
	swims: () => SiteSwim[];
}

export const SiteTemplates: Record<SiteType, SiteTemplate> = {
	gravel_pit: { layout: gravelPitLayout, swims: gravelPitSwims },
	quarry: { layout: quarryLayout, swims: quarrySwims },
	clay_pit: { layout: clayPitLayout, swims: clayPitSwims },
	estate_lake: { layout: estateLakeLayout, swims: estateLakeSwims },
	farm_pond: { layout: farmPondLayout, swims: farmPondSwims },
	greenfield: { layout: greenfieldLayout, swims: greenfieldSwims },
	classic: { layout: () => classicLayoutWithSwimTerrain(ClassicSwims), swims: () => ClassicSwims.map(({ name, position }) => ({ name, position })) }
};

const DugSites: SiteType[] = ['greenfield'];

export function templateWaterAcresFor(site: SiteType, chosenAcres: number) {
	return waterAcres(SiteTemplates[site].layout(), plotAcresFor(site, chosenAcres));
}

export function dugWaterAcresFor(site: SiteType, chosenAcres: number) {
	return DugSites.includes(site) ? templateWaterAcresFor(site, chosenAcres) : 0;
}

export function priceOfSite(site: SiteType, region: RegionCode, chosenAcres: number) {
	return sitePriceFor(site, region, chosenAcres, dugWaterAcresFor(site, chosenAcres));
}

export function templateSwimRowsFor(site: SiteType, lakeId: string): Omit<Swim, 'id'>[] {
	return SiteTemplates[site].swims().map((peg) => ({ lake_id: lakeId, name: peg.name, position_x: peg.position.x, position_y: peg.position.y }));
}
