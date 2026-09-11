import type { LakeWork } from '$lib/domain/worldTypes';

export interface LabelledWork extends LakeWork {
	label: string;
	daysLeft: number;
	refund: number;
}

export interface MyGroundworks {
	inProgress: LabelledWork[];
	ledger: LabelledWork[];
}
