import { Vector3 } from 'three';
import { UpAxis } from './limbPaths';
import type { LeafSite } from './treeSkeleton';

function mergedSite(members: LeafSite[]): LeafSite {
	const at = members.reduce((sum, site) => sum.add(site.at), new Vector3()).divideScalar(members.length);
	const heading = members.reduce((sum, site) => sum.add(site.heading), new Vector3());
	const isPointless = heading.lengthSq() === 0;
	const reach = Math.max(...members.map((site) => site.reach));
	return { at, heading: isPointless ? UpAxis.clone() : heading.normalize(), reach };
}

export function gatheredSites(sites: LeafSite[], groupSize: number) {
	if (groupSize <= 1) return sites;
	const groups = Math.ceil(sites.length / groupSize);
	return Array.from({ length: groups }, (_, group) => mergedSite(sites.slice(group * groupSize, (group + 1) * groupSize)));
}
