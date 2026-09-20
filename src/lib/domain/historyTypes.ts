export interface Catch {
	id: string;
	lake_id: string;
	carp_id: string | null;
	angler_id: string | null;
	angler_name: string;
	owner_name: string | null;
	weight_lb: number;
	swim_name: string;
	rig: string;
	bait: string;
	hook_size: number;
	rod_item_id?: string | null;
	reel_item_id?: string | null;
	caught_at: string;
}

export interface LakeVisit {
	id: string;
	lake_id: string;
	angler_id: string | null;
	angler_name: string;
	fee_paid: number;
	fish_caught: number;
	visited_at: string;
}
