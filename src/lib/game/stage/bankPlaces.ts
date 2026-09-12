import type { LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { isPointInPolygon } from '$lib/domain/layout/pointInPolygon';
import { polygonCentroid } from '$lib/domain/layout/polygonArea';

export type PlaceId = 'lodge' | 'shop' | 'noticeboard' | 'jetty' | 'signpost';

export interface BankPlace {
	id: PlaceId;
	label: string;
	bearing: number;
	href: string;
}

const Compass = { East: 0, South: Math.PI / 2, West: Math.PI, NorthWest: -Math.PI * 0.75, NorthEast: -Math.PI * 0.25 } as const;

export const BankPlaces: BankPlace[] = [
	{ id: 'lodge', label: 'The lodge', bearing: Compass.NorthWest, href: '/lake' },
	{ id: 'shop', label: 'Tackle shop', bearing: Compass.NorthEast, href: '/market' },
	{ id: 'noticeboard', label: 'Noticeboard', bearing: Compass.West, href: '/inbox' },
	{ id: 'jetty', label: 'The jetty', bearing: Compass.South, href: '/lakes' },
	{ id: 'signpost', label: 'Signpost', bearing: Compass.East, href: '/world' }
];

const Bank = { StepFraction: 0.01, FurthestFraction: 0.75, BeyondTheShore: 0.1, EdgeMargin: 0.12 } as const;

export function placePointsFor(layout: LakeLayout): Record<PlaceId, LayoutPoint> {
	const centre = polygonCentroid(layout.outline);
	const entries = BankPlaces.map((place) => [place.id, onTheBankFrom(centre, place.bearing, layout.outline)] as const);
	return Object.fromEntries(entries) as Record<PlaceId, LayoutPoint>;
}

function onTheBankFrom(centre: LayoutPoint, bearing: number, outline: LayoutPoint[]): LayoutPoint {
	const direction = { x: Math.cos(bearing), y: Math.sin(bearing) };
	let distance = Bank.StepFraction;
	while (distance < Bank.FurthestFraction && isPointInPolygon(alongRay(centre, direction, distance), outline)) distance += Bank.StepFraction;
	return clampedToStage(alongRay(centre, direction, distance + Bank.BeyondTheShore));
}

function alongRay(from: LayoutPoint, direction: LayoutPoint, distance: number): LayoutPoint {
	return { x: from.x + direction.x * distance, y: from.y + direction.y * distance };
}

function clampedToStage(point: LayoutPoint): LayoutPoint {
	const clamp = (value: number) => Math.min(1 - Bank.EdgeMargin, Math.max(Bank.EdgeMargin, value));
	return { x: clamp(point.x), y: clamp(point.y) };
}
