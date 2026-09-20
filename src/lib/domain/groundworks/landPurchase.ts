import type { Lake } from '../types';
import { landPriceFor } from '../world/regions';

export const LandPurchase = { AcresPerPurchase: 5, MaximumPlotAcres: 200 } as const;

export interface LandQuote {
	acres: number;
	cost: number;
	plotAfter: number;
	refusal: string | null;
}

export function landQuoteFor(lake: Pick<Lake, 'region' | 'plot_acres'>, hasEarthworksInProgress: boolean): LandQuote {
	const plotAfter = Number(lake.plot_acres) + LandPurchase.AcresPerPurchase;
	return {
		acres: LandPurchase.AcresPerPurchase,
		cost: landPriceFor(lake.region, LandPurchase.AcresPerPurchase),
		plotAfter,
		refusal: whyLandIsRefused(plotAfter, hasEarthworksInProgress)
	};
}

function whyLandIsRefused(plotAfter: number, hasEarthworksInProgress: boolean) {
	if (plotAfter > LandPurchase.MaximumPlotAcres) return `The plot can grow to ${LandPurchase.MaximumPlotAcres} acres at most`;
	if (hasEarthworksInProgress) return 'Let the works in progress finish before the plot changes shape';
	return null;
}
