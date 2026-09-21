import type { LakeSponsorship, SponsorshipOffer } from '$lib/domain/sponsorship/lakeSponsorship';

export interface LakeSponsorshipPanel {
	deal: LakeSponsorship | null;
	offers: SponsorshipOffer[];
	waterRating: number;
	loadedAt: string;
}
