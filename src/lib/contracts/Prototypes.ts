export interface PrototypeOnTheBoard {
	itemId: string;
	label: string;
	brand: string;
	number: number;
	holderId: string | null;
	holderName: string;
	wonAt: string;
	isDestroyed: boolean;
	destroyedAt: string | null;
}
