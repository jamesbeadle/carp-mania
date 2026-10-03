import { feetToNearestEdge } from '../../layout/distanceToEdge';
import type { LayoutPoint } from '../../layout/layoutTypes';
import { doPolygonsOverlap } from '../../layout/pointInPolygon';
import { FacilityCatalogue } from '../facilities';
import type { Plan } from '../plan';
import { isPlacedInTheWater } from '../sites/buildingSizes';
import { SiteClearance } from '../sites/siteFit';
import { siteCorners } from '../sites/siteFootprint';
import { sitesOf } from '../sites/sitesOf';

const NeighbouringEdges = 1;

function orientation(first: LayoutPoint, second: LayoutPoint, third: LayoutPoint) {
	return Math.sign((second.x - first.x) * (third.y - first.y) - (second.y - first.y) * (third.x - first.x));
}

function doEdgesCross(start: LayoutPoint, end: LayoutPoint, otherStart: LayoutPoint, otherEnd: LayoutPoint) {
	const isSplitByOther = orientation(otherStart, otherEnd, start) !== orientation(otherStart, otherEnd, end);
	const isOtherSplit = orientation(start, end, otherStart) !== orientation(start, end, otherEnd);
	return isSplitByOther && isOtherSplit;
}

export function doesBankCrossItself(outline: LayoutPoint[]) {
	const count = outline.length;
	for (let first = 0; first < count; first++) {
		for (let second = first + NeighbouringEdges + 1; second < count; second++) {
			const isWrapNeighbour = first === 0 && second === count - 1;
			if (isWrapNeighbour) continue;
			const isCrossing = doEdgesCross(outline[first], outline[(first + 1) % count], outline[second], outline[(second + 1) % count]);
			if (isCrossing) return true;
		}
	}
	return false;
}

export function swallowedBuildingFailures(plan: Plan, outline: LayoutPoint[]): string[] {
	const onLand = sitesOf(plan.layout, plan.plotAcres, plan.swims).filter((site) => !isPlacedInTheWater(site.facility));
	return onLand.flatMap((site) => {
		const corners = siteCorners(site, plan.scale);
		const isNearTheWater = corners.some((corner) => feetToNearestEdge(plan.scale, corner, outline) < SiteClearance.FromTheWaterFeet);
		const isSwallowed = doPolygonsOverlap(corners, outline) || isNearTheWater;
		const label = FacilityCatalogue[site.facility].label;
		return isSwallowed ? [`The ${label.toLowerCase()} would be too close to the new bank — move it first`] : [];
	});
}
