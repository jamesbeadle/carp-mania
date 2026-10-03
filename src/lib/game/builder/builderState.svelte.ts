import type { BankAnchor } from '$lib/domain/groundworks/bankAnchor';
import type { WorkDraft } from '$lib/domain/groundworks/workKinds';
import type { Facility, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { BrushSizes } from './brushSizes';
import { DraftHistory } from './draftHistory.svelte';
import { ToolCatalogue, type BuilderTool } from './toolCatalogue';

export type DraftPhase = 'idle' | 'drawing' | 'placed';

export class BuilderState {
	tool = $state<BuilderTool>('select');
	draft = $state<WorkDraft | null>(null);
	phase = $state<DraftPhase>('idle');
	hover = $state<LayoutPoint | null>(null);
	selectedSwimId = $state<string | null>(null);
	swimPoint = $state<LayoutPoint | null>(null);
	brushScenePixels = $state(BrushSizes.medium);
	brushAt = $state<LayoutPoint | null>(null);
	bankStart = $state<BankAnchor | null>(null);
	bankPath = $state<LayoutPoint[]>([]);
	notice = $state<string | null>(null);
	selectedFacility = $state<Facility | null>(null);
	siteGrab = $state<LayoutPoint | null>(null);
	isTurningTheSite = $state(false);
	isPointerDown = $state(false);
	history = new DraftHistory();

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
		const isTheSameKindOfWork = this.draft !== null && ToolCatalogue[tool].kind === this.draft.kind;
		this.tool = tool;
		if (isTheSameKindOfWork) return;
		this.clear();
		this.history.forget();
	}

	undo() {
		this.travelTo(this.history.stepBack());
	}

	redo() {
		this.travelTo(this.history.stepForward());
	}

	private travelTo(draft: WorkDraft | null) {
		this.draft = draft;
		if (draft === null) this.phase = 'idle';
		if (draft !== null && this.phase === 'idle') this.phase = 'placed';
	}

	clear() {
		this.draft = null;
		this.phase = 'idle';
		this.swimPoint = null;
		this.selectedSwimId = null;
		this.brushAt = null;
		this.bankStart = null;
		this.bankPath = [];
		this.notice = null;
		this.selectedFacility = null;
		this.siteGrab = null;
		this.isTurningTheSite = false;
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
