export type TransferKind = 'sale' | 'dealer_purchase' | 'farm_delivery' | 'dealer_sale' | 'estate_move';

export interface CarpTransfer {
	id: string;
	carp_id: string | null;
	carp_name: string;
	kind: TransferKind;
	listing_id: string | null;
	from_lake_id: string | null;
	to_lake_id: string | null;
	price: number;
	commission: number;
	transport_cost: number;
	distance_km: number;
	farm_pack_id: string | null;
	departed_at: string;
	arrives_at: string;
	quarantine_until: string | null;
}
