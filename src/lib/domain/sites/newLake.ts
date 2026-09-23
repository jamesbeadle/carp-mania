import { waterAcres } from '../layout/waterArea';
import { untendedWater } from './untendedWater';
import type { Lake, SiteType } from '../types';
import { colourFromSilt, transparencyFromSiltAndWeed } from '../waterQuality';
import { chosenPlotOf, type ProfileWithPlot } from './chosenPlot';
import { plotAcresFor, SiteCatalogue } from './siteCatalogue';
import { SiteTemplates } from './siteTemplates';

export const NewWater = { DayTicketFee: 20, Disturbance: 0 } as const;
export const WaterName = { MinimumLength: 2, MaximumLength: 40 } as const;

export function newLakeFor(profile: ProfileWithPlot, site: SiteType, chosenAcres: number, name: string, now: Date): Omit<Lake, 'id'> {
	const siteProfile = SiteCatalogue[site];
	const plot = chosenPlotOf(profile);
	const plotAcres = plotAcresFor(site, chosenAcres);
	const layout = SiteTemplates[site].layout();
	return {
		owner_id: profile.id,
		name,
		acres: waterAcres(layout, plotAcres),
		silt: siteProfile.water.silt,
		weed: siteProfile.water.weed,
		transparency: transparencyFromSiltAndWeed(siteProfile.water.silt, siteProfile.water.weed),
		water_colour: colourFromSilt(siteProfile.water.silt),
		bank_tidiness: siteProfile.water.bankTidiness,
		day_ticket_fee: NewWater.DayTicketFee,
		reputation: siteProfile.startingReputation,
		...untendedWater(),
		...gatesNotYetOpen(now),
		region: plot.region,
		latitude: plot.latitude,
		longitude: plot.longitude,
		site_type: site,
		plot_acres: plotAcres,
		layout,
		fertility: siteProfile.startingFertility,
		disturbance: NewWater.Disturbance
	};
}

function gatesNotYetOpen(now: Date) {
	return { is_public: false, is_setup_complete: false, simulated_until: now.toISOString(), opened_at: null };
}

export function defaultWaterNameFor(displayName: string) {
	return `${displayName}'s Water`;
}
