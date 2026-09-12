export type MatchStatus = 'open' | 'settled' | 'cancelled';
export type MatchPhase = 'upcoming' | 'in_play' | 'ended' | 'settled' | 'cancelled';
export type TrophyKind = 'most_catches' | 'biggest_fish';

export interface Match {
	id: string;
	lake_id: string;
	host_id: string;
	title: string;
	starts_at: string;
	ends_at: string;
	entry_fee: number;
	host_stake: number;
	booking_fee: number;
	most_catches_share: number;
	pegs: number;
	status: MatchStatus;
	created_at: string;
	settled_at: string | null;
}

export interface MatchEntry {
	match_id: string;
	angler_id: string;
	angler_name: string;
	fisherman_id: string | null;
	entered_at: string;
}

export interface Trophy {
	id: string;
	match_id: string | null;
	profile_id: string;
	fisherman_id: string | null;
	angler_name: string;
	kind: TrophyKind;
	match_title: string;
	lake_id: string | null;
	lake_name: string;
	catches: number;
	heaviest_lb: number;
	prize: number;
	won_at: string;
}

export interface BoardPlacing {
	anglerId: string;
	anglerName: string;
	fishermanId: string | null;
	catches: number;
	heaviestLb: number;
	heaviestCarpId: string | null;
}
