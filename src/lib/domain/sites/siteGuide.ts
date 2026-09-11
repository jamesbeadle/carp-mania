import type { SiteType } from '../types';
import { SiteCatalogue, type StartingStockRule } from './siteCatalogue';
import { SiteTemplates } from './siteTemplates';

export function siteStartsWith(site: SiteType): string[] {
	const profile = SiteCatalogue[site];
	const layout = SiteTemplates[site].layout();
	const barCount = layout.features.filter((feature) => feature.kind === 'gravel_bar').length;
	const shape = [countOf(layout.islands.length, 'island'), countOf(barCount, 'bar'), countOf(SiteTemplates[site].swims().length, 'swim')];
	const stock = profile.stock.map(describeStock);
	const thirties = countOf(profile.namedThirties.length, 'named thirty', 'named thirties');
	const history = profile.historyDays > 0 ? `${profile.historyDays} days of catch history` : '';
	const fish = [...stock, thirties, history].filter(isSaidAtAll);
	const whatLivesHere = fish.length > 0 ? fish : ['no fish at all'];
	return [...shape.filter(isSaidAtAll), `reputation ${profile.startingReputation}`, ...whatLivesHere];
}

function isSaidAtAll(line: string) {
	return line !== '';
}

function countOf(count: number, singular: string, plural = `${singular}s`) {
	if (count === 0) return '';
	return `${count} ${count === 1 ? singular : plural}`;
}

function describeStock(rule: StartingStockRule) {
	const count = rule.minimumCount === rule.maximumCount ? `${rule.minimumCount}` : `${rule.minimumCount}–${rule.maximumCount}`;
	return `${count} ${stockKindFor(rule)} ${rule.minimumLb}–${rule.maximumLb} lb`;
}

function stockKindFor(rule: StartingStockRule) {
	if (rule.origin === 'farm') return 'stockies';
	if (rule.isCatalogued) return 'catalogued fish';
	return 'unknown originals';
}

export const SuggestedFirstWorks: Record<SiteType, string[]> = {
	gravel_pit: ['Build swims on the bars — the fish are already there', 'Sink a snag off Long Island for the big originals'],
	quarry: ['Cut margin shelves — bare rock has nothing to eat', 'Raise gravel bars so there is somewhere to fish to', 'Then feed it hard'],
	clay_pit: ['Hire a bailiff — the colour never clears fully, but he keeps it in check', 'A gravel bar gives you something firm to fish over'],
	estate_lake: ['Dredge the silt before summer chokes it', 'Hire a bailiff from day one', 'An aerator: six feet of water and a heatwave is a bad mix'],
	farm_pond: ['Deepen a hole — four feet is thin cover in a heatwave', 'A reed bed along the far bank'],
	greenfield: ['Plant reeds so the fish have somewhere to hold', 'Sink a snag — a bare bowl is a hard place to be a carp'],
	classic: []
};
