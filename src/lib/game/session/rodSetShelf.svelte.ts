import { lastUsedOf, type RodSet } from '$lib/domain/tackle/rodSets';
import type { RodSetup } from '$lib/domain/tackle/rodSetup';
import { dropRodSet, markRodSetUsed, saveRodSet } from './rodSetRequests';

export const LastTimeSetId = 'last-time';

export class RodSetShelf {
	sets = $state<RodSet[]>([]);
	chosenId = $state<string>(LastTimeSetId);
	notice = $state<string | null>(null);
	isSaving = $state(false);

	constructor(sets: RodSet[], hasLastTime: boolean) {
		this.sets = sets;
		const lastUsed = lastUsedOf(sets);
		this.chosenId = lastUsed && !hasLastTime ? lastUsed.id : LastTimeSetId;
	}

	get chosen(): RodSet | null {
		return this.sets.find((set) => set.id === this.chosenId) ?? null;
	}

	choose(setId: string) {
		this.chosenId = setId;
		this.notice = null;
	}

	async save(name: string, rods: RodSetup[]) {
		this.isSaving = true;
		const saved = await saveRodSet({ name, rods });
		this.isSaving = false;
		if (typeof saved === 'string') return void (this.notice = saved);
		const set: RodSet = { id: saved.id, name: saved.name, rods, lastUsedAt: saved.lastUsedAt };
		this.sets = [set, ...this.sets.filter((one) => one.id !== set.id)];
		this.chosenId = set.id;
		this.notice = `Saved as “${set.name}”`;
	}

	async drop(setId: string) {
		const isDropped = await dropRodSet(setId);
		if (!isDropped) return void (this.notice = 'That set would not go');
		this.sets = this.sets.filter((one) => one.id !== setId);
		if (this.chosenId === setId) this.chosenId = LastTimeSetId;
	}

	markChosenUsed() {
		if (this.chosenId !== LastTimeSetId) void markRodSetUsed(this.chosenId);
	}
}
