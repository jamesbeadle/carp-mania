import type { WoodDetail } from './barkGeometry';
import type { FoliageDetail } from './crownFoliage';

export interface TreeDetail {
	foliage: FoliageDetail;
	wood: WoodDetail;
}

export const Details: TreeDetail[] = [
	{ foliage: { siteStride: 1, cardShare: 1, hasFineLeaves: false }, wood: { sides: [10, 6, 4, 3], deepestLevel: 3, pointStride: 1, thinnestShare: 0 } },
	{ foliage: { siteStride: 2, cardShare: 0.55, hasFineLeaves: true }, wood: { sides: [6, 4, 3, 3], deepestLevel: 2, pointStride: 2, thinnestShare: 0.2 } },
	{ foliage: { siteStride: 5, cardShare: 0.55, hasFineLeaves: true }, wood: { sides: [5, 3, 3, 3], deepestLevel: 1, pointStride: 2, thinnestShare: 0.5 } },
	{ foliage: { siteStride: 10, cardShare: 0.4, hasFineLeaves: true }, wood: { sides: [4, 3, 3, 3], deepestLevel: 0, pointStride: 4, thinnestShare: 1 } }
];

export const BareDetails: TreeDetail[] = [
	{ foliage: { siteStride: 1, cardShare: 1, hasFineLeaves: false }, wood: { sides: [10, 6, 4, 3, 3], deepestLevel: 4, pointStride: 1, thinnestShare: 0 } },
	{ foliage: { siteStride: 1, cardShare: 1, hasFineLeaves: false }, wood: { sides: [6, 4, 3, 3, 3], deepestLevel: 3, pointStride: 2, thinnestShare: 0.05 } },
	{ foliage: { siteStride: 6, cardShare: 1, hasFineLeaves: true }, wood: { sides: [5, 3, 3, 3, 3], deepestLevel: 3, pointStride: 2, thinnestShare: 0.1 } },
	{ foliage: { siteStride: 14, cardShare: 1, hasFineLeaves: true }, wood: { sides: [4, 3, 3, 3, 3], deepestLevel: 2, pointStride: 4, thinnestShare: 0.2 } }
];

export const FirstHazeDetail = 2;
export const DetailLevels = Details.length;
