import type { LakeSponsorship, SponsorshipOffer } from '$lib/domain/sponsorship/lakeSponsorship';
import type { WaterStanding } from '$lib/domain/sponsorship/waterStanding';

export interface LakeSponsorshipPanel {
	deal: LakeSponsorship | null;
	offers: SponsorshipOffer[];
	standing: WaterStanding;
	loadedAt: string;
}
