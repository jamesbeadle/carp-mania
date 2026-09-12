import { fail } from '@sveltejs/kit';
import { defaultWaterNameFor, WaterName } from '$lib/domain/sites/newLake';
import { OfferedSites, PlotSizes, SiteCatalogue } from '$lib/domain/sites/siteCatalogue';
import type { SiteType } from '$lib/domain/types';
import { readFormChoice } from './readFormNumber';

export interface SiteOrder {
	site: SiteType;
	plotAcres: number;
	name: string;
}

export function readSiteOrder(formData: FormData, displayName: string) {
	const site = readFormChoice(formData, 'site', OfferedSites);
	if (site.failure) return { value: null, failure: site.failure };
	const plotAcres = readPlotAcres(formData, site.value);
	if (plotAcres.failure) return { value: null, failure: plotAcres.failure };
	const name = readWaterName(formData, displayName);
	if (name.failure) return { value: null, failure: name.failure };
	return { value: { site: site.value, plotAcres: plotAcres.value, name: name.value }, failure: null };
}

function readPlotAcres(formData: FormData, site: SiteType) {
	const fixedAcres = SiteCatalogue[site].fixedPlotAcres;
	if (fixedAcres !== null) return { value: fixedAcres, failure: null };
	const chosen = Number(formData.get('plotAcres'));
	const isOffered = (PlotSizes as readonly number[]).includes(chosen);
	if (!isOffered) return { value: null, failure: fail(400, { message: `Plots come in ${PlotSizes.join(', ')} acres` }) };
	return { value: chosen, failure: null };
}

function readWaterName(formData: FormData, displayName: string) {
	const typed = String(formData.get('name') ?? '').trim();
	const name = typed === '' ? defaultWaterNameFor(displayName) : typed;
	const isValid = name.length >= WaterName.MinimumLength && name.length <= WaterName.MaximumLength;
	if (!isValid) return { value: null, failure: fail(400, { message: `Name must be ${WaterName.MinimumLength}–${WaterName.MaximumLength} characters` }) };
	return { value: name, failure: null };
}
