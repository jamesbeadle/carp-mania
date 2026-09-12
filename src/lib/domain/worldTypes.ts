export type WorkStatus = 'in_progress' | 'complete' | 'cancelled';

export interface LakeWork {
	id: string;
	lake_id: string;
	kind: string;
	parameters: Record<string, unknown>;
	cost: number;
	ordered_at: string;
	starts_on: string;
	completes_on: string;
	status: WorkStatus;
}

export type NotificationKind =
	| 'outbid'
	| 'won'
	| 'sold'
	| 'unsold'
	| 'arrived'
	| 'quarantine_over'
	| 'works_complete'
	| 'record_set'
	| 'big_catch_on_your_water'
	| 'fish_died';

export interface Notification {
	id: string;
	profile_id: string;
	kind: NotificationKind;
	title: string;
	body: string;
	link: string;
	created_at: string;
	read_at: string | null;
}

export type WorldEventKind = 'big_catch' | 'sale' | 'record' | 'new_water' | 'island_built' | 'fish_died';

export interface WorldEvent {
	id: string;
	kind: WorldEventKind;
	lake_id: string;
	other_lake_id: string | null;
	payload: Record<string, unknown>;
	created_at: string;
}

export interface FavouriteLake {
	profile_id: string;
	lake_id: string;
	created_at: string;
}
