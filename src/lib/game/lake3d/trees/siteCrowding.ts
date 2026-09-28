import type { LeafSite } from './treeSkeleton';

const Neighbourhood = { Reach: 2.4, Loneliest: 0.5, PerNeighbour: 0.17 } as const;

export function siteCrowding(sites: LeafSite[], clumpRadius: number) {
	const reach = clumpRadius * Neighbourhood.Reach;
	const reachSquared = reach * reach;
	const shares = new Map<LeafSite, number>();
	sites.forEach((site) => {
		const neighbours = sites.filter((other) => other !== site && other.at.distanceToSquared(site.at) < reachSquared).length;
		shares.set(site, Math.min(1, Neighbourhood.Loneliest + neighbours * Neighbourhood.PerNeighbour));
	});
	return (site: LeafSite) => shares.get(site) ?? 1;
}
