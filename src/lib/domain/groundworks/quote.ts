import type { Lake, Swim } from '../types';
import type { LakeWork } from '../worldTypes';
import { priceDraft, type WorkPrice } from './priceDraft';
import { validateDraft } from './validateDraft';
import type { WorkDraft } from './workKinds';
import { draftOf, isInProgress } from './worksLedger';

export interface WorkQuote extends WorkPrice {
	failures: string[];
}

export function GetGroundworksQuote(draft: WorkDraft, lake: Pick<Lake, 'layout' | 'plot_acres'>, swims: Swim[], works: LakeWork[]): WorkQuote {
	const plotAcres = Number(lake.plot_acres);
	const worksInProgress = works.filter(isInProgress).map(draftOf);
	const failures = validateDraft(lake.layout, plotAcres, swims, worksInProgress, draft);
	return { ...priceDraft(draft, lake.layout, plotAcres), failures };
}
