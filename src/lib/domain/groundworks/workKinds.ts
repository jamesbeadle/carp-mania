import type { BedType } from '../types';
import type { LayoutPoint } from '../layout/layoutTypes';

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
	| { kind: 'reshape_shoreline'; outline: LayoutPoint[] }
	| { kind: 'car_park' }
	| { kind: 'lodge' }
	| { kind: 'aerator' };

export type WorkKind = WorkDraft['kind'];

export const WorkKinds: WorkKind[] = ['island', 'gravel_bar', 'deepen', 'dredge', 'margin_shelf', 'reed_bed', 'lily_pads', 'snag', 'reshape_shoreline', 'car_park', 'lodge', 'aerator'];

export const EarthworkKinds: WorkKind[] = ['island', 'gravel_bar', 'deepen', 'dredge', 'margin_shelf', 'reed_bed', 'lily_pads', 'snag', 'reshape_shoreline'];
export const FacilityKinds: WorkKind[] = ['car_park', 'lodge', 'aerator'];

export function isEarthwork(kind: WorkKind) {
	return EarthworkKinds.includes(kind);
}

export function isWorkKind(value: string): value is WorkKind {
	return (WorkKinds as string[]).includes(value);
}
