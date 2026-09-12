import type { Fisherman } from '$lib/domain/legacy/fishermanTypes';

export interface FishermanDiary {
	current: Fisherman;
	line: Fisherman[];
	age: number;
	isRetirementDue: boolean;
	isSlowingDown: boolean;
}
