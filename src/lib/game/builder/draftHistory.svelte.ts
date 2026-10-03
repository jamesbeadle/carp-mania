import type { WorkDraft } from '$lib/domain/groundworks/workKinds';

const MostStepsKept = 50;

export class DraftHistory {
	past = $state<(WorkDraft | null)[]>([]);
	future = $state<(WorkDraft | null)[]>([]);
	private present: WorkDraft | null = null;

	get canUndo() {
		return this.past.length > 0;
	}

	get canRedo() {
		return this.future.length > 0;
	}

	record(draft: WorkDraft | null) {
		if (draft === this.present) return;
		this.past = [...this.past, this.present].slice(-MostStepsKept);
		this.future = [];
		this.present = draft;
	}

	stepBack(): WorkDraft | null {
		if (!this.canUndo) return this.present;
		const previous = this.past[this.past.length - 1] ?? null;
		this.future = [this.present, ...this.future];
		this.past = this.past.slice(0, -1);
		return this.arrive(previous);
	}

	stepForward(): WorkDraft | null {
		if (!this.canRedo) return this.present;
		const next = this.future[0] ?? null;
		this.past = [...this.past, this.present];
		this.future = this.future.slice(1);
		return this.arrive(next);
	}

	forget() {
		this.past = [];
		this.future = [];
		this.present = null;
	}

	private arrive(draft: WorkDraft | null) {
		this.present = draft;
		return draft;
	}
}
