import type { BedType } from '../types';
import type { CarParkSpec, SitePlacement } from '../layout/facilitySite';
import { Facilities, type Facility, type LayoutPoint } from '../layout/layoutTypes';

export type IslandSize = 'small' | 'medium' | 'large';
export type ShelfBed = Extract<BedType, 'gravel' | 'clay'>;

export type WorkDraft =
	| { kind: 'island'; size: IslandSize; centre: LayoutPoint; rotation: number; name: string }
	| { kind: 'gravel_bar'; points: LayoutPoint[]; depthFeet: number }
	| { kind: 'deepen'; points: LayoutPoint[]; depthFeet: number }
	| { kind: 'dredge'; points: LayoutPoint[] }
	| { kind: 'margin_shelf'; points: LayoutPoint[]; bed: ShelfBed }
	| { kind: 'reed_bed'; points: LayoutPoint[] }
	| { kind: 'lily_pads'; points: LayoutPoint[] }
	| { kind: 'snag'; point: LayoutPoint; name: string }
	| { kind: 'sanctuary'; points: LayoutPoint[] }
	| { kind: 'reshape_shoreline'; outline: LayoutPoint[] }
	| ({ kind: Facility; carPark?: CarParkSpec } & SitePlacement)
	| { kind: 'upgrade_car_park'; carPark: CarParkSpec }
	| ({ kind: 'move_facility'; facility: Facility } & SitePlacement);

export type FacilityDraft = Extract<WorkDraft, { kind: Facility }>;

export type WorkKind = WorkDraft['kind'];

export const EarthworkKinds: WorkKind[] = ['island', 'gravel_bar', 'deepen', 'dredge', 'margin_shelf', 'reed_bed', 'lily_pads', 'snag', 'sanctuary', 'reshape_shoreline'];
export const FacilityKinds: WorkKind[] = [...Facilities];
export const SiteWorkKinds: WorkKind[] = ['upgrade_car_park', 'move_facility'];
export const WorkKinds: WorkKind[] = [...EarthworkKinds, ...FacilityKinds, ...SiteWorkKinds];

export function isEarthwork(kind: WorkKind) {
	return EarthworkKinds.includes(kind);
}

export function isWorkKind(value: string): value is WorkKind {
	return (WorkKinds as string[]).includes(value);
}

export function isFacilityDraft(draft: WorkDraft): draft is FacilityDraft {
	return FacilityKinds.includes(draft.kind);
}

export function isSiteWork(draft: WorkDraft) {
	return isFacilityDraft(draft) || SiteWorkKinds.includes(draft.kind);
}
