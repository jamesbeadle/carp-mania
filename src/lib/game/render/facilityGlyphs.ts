import type { Facility } from '$lib/domain/layout/layoutTypes';

export const FacilityGlyphBox = 16;
export const FacilityGlyphFillRule: CanvasFillRule = 'evenodd';

export const FacilityGlyphPaths: Record<Facility, string> = {
	car_park: "M2 9 L4 4 H12 L14 9 H15 V13 H13 V12 H3 V13 H1 V9 Z M4.5 9 H11.5 L10.5 6 H5.5 Z M3 14.5 a1.5 1.5 0 1 0 0.01 0 Z M13 14.5 a1.5 1.5 0 1 0 0.01 0 Z",
	lodge: "M8 1.5 L15 8 H13 V14.5 H3 V8 H1 Z M6.5 9 H9.5 V14.5 H6.5 Z",
	aerator: "M7 15 V9 H9 V15 Z M2.5 8.5 Q8 1 13.5 8.5 L11.5 8.5 Q8 4 4.5 8.5 Z M8 2 a1.2 1.2 0 1 0 0.01 0 Z",
	toilets: "M4.5 1.5 a1.6 1.6 0 1 0 0.01 0 Z M3 5 H6 V10 H5.3 V14.5 H3.7 V10 H3 Z M11.5 1.5 a1.6 1.6 0 1 0 0.01 0 Z M9.5 10 L11 5 H12 L13.5 10 H12.6 V14.5 H10.4 V10 Z",
	tackle_shop: "M9.5 1 V9.5 a3 3 0 0 1 -6 0 V8 H5.5 V9.5 a1.5 1.5 0 0 0 3 0 V1 Z M7 1 H12 V3 H7 Z",
	bar: "M3 2 H11.5 V4 H3 Z M4 4 H10.5 V14.5 H4 Z M10.5 6 H13.5 V11.5 H10.5 Z M11.5 7 H12.5 V10.5 H11.5 Z",
	restaurant: "M3.5 1 V6 a2 2 0 0 0 1.25 1.85 V15 H6.25 V7.85 A2 2 0 0 0 7.5 6 V1 H6.5 V5 H6 V1 H5 V5 H4.5 V1 Z M10 1 Q13.5 4.5 12.5 8.5 V15 H10.8 V9.5 H10 Z",
	hotel: "M3 15 V2 H13 V15 Z M5 4.5 H7 V6.5 H5 Z M9 4.5 H11 V6.5 H9 Z M5 8.5 H7 V10.5 H5 Z M9 8.5 H11 V10.5 H9 Z M7 12 H9 V15 H7 Z"
};
