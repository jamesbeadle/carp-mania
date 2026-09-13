import type { HonourKind } from '../fishing/honours';

export const RibbonWords: Record<HonourKind, string> = {
	world_record: 'World record',
	region_record: 'Region record',
	lake_record: 'Lake record',
	personal_best: 'Personal best'
};

export function bestRibbonOf(honours: HonourKind[]): HonourKind | null {
	return honours[0] ?? null;
}
