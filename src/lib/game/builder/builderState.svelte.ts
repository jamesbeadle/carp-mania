import type { BankAnchor } from '$lib/domain/groundworks/bankAnchor';
import type { WorkDraft } from '$lib/domain/groundworks/workKinds';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { BuilderTool } from './toolCatalogue';

export type DraftPhase = 'idle' | 'drawing' | 'placed';

export class BuilderState {
	tool = $state<BuilderTool>('select');
	draft = $state<WorkDraft | null>(null);
	phase = $state<DraftPhase>('idle');
	hover = $state<LayoutPoint | null>(null);
	selectedSwimId = $state<string | null>(null);
	swimPoint = $state<LayoutPoint | null>(null);
	draggedVertex = $state<number | null>(null);
	bankStart = $state<BankAnchor | null>(null);
	bankPath = $state<LayoutPoint[]>([]);
	notice = $state<string | null>(null);

	get isReadyToOrder() {
		return this.draft !== null && this.phase === 'placed';
	}

	get isDrawing() {
		return this.phase === 'drawing';
	}

	get isRedrawingTheBank() {
		return this.bankStart !== null;
	}

	choose(tool: BuilderTool) {
		this.tool = tool;
		this.clear();
	}

	clear() {
		this.draft = null;
		this.phase = 'idle';
		this.swimPoint = null;
		this.selectedSwimId = null;
		this.draggedVertex = null;
		this.bankStart = null;
		this.bankPath = [];
		this.notice = null;
	}

	startDrawing(draft: WorkDraft) {
		this.draft = draft;
		this.phase = 'drawing';
	}

	place(draft: WorkDraft) {
		this.draft = draft;
		this.phase = 'placed';
	}

	undoLastPoint() {
		if (this.isRedrawingTheBank) return this.undoBankPoint();
		const draft = this.draft;
		if (!this.isDrawing || !draft || !('points' in draft)) return;
		const points = draft.points.slice(0, -1);
		if (points.length === 0) return this.clear();
		this.draft = { ...draft, points };
	}

	private undoBankPoint() {
		if (this.bankPath.length === 0) return this.clear();
		this.bankPath = this.bankPath.slice(0, -1);
	}
}
