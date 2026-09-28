import { Group } from 'three';
import { FacilityCatalogue } from '$lib/domain/groundworks/facilities';
import type { WorldPoint } from '../lakeFrame';
import { labelSprite } from './labelSprite';
import type { FacilityPlot } from './facilityGrounds';
import { FacilityModels } from './facilityModels';

const LabelLift = 9;

export function createFacilities(plots: FacilityPlot[], groundAt: (point: WorldPoint) => number) {
	const group = new Group();
	const labels = plots.map((plot) => {
		const model = FacilityModels[plot.facility];
		const building = model.build();
		const { point } = plot;
		building.position.set(point.x, model.isInTheWater ? 0 : groundAt(point), point.z);
		building.rotateY(plot.facing);
		const profile = FacilityCatalogue[plot.facility];
		const label = labelSprite(profile.label);
		label.position.set(point.x, groundAt(point) + LabelLift, point.z);
		group.add(building, label);
		return label;
	});
	return { group, labels };
}
