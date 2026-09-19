import { GroundworksCatalogue } from './catalogue';
import type { IslandSize, WorkDraft } from './workKinds';

export const IslandSizeLabels: Record<IslandSize, string> = { small: 'Small', medium: 'Medium', large: 'Large' };

export function workLabelFor(draft: WorkDraft): string {
	if (draft.kind === 'island') return `${IslandSizeLabels[draft.size]} island — ${draft.name}`;
	if (draft.kind === 'gravel_bar') return `Gravel bar at ${draft.depthFeet} ft`;
	if (draft.kind === 'deepen') return `Hole down to ${draft.depthFeet} ft`;
	if (draft.kind === 'dredge') return 'Dredging';
	if (draft.kind === 'margin_shelf') return `${draft.bed === 'gravel' ? 'Gravel' : 'Clay'} margin shelf`;
	if (draft.kind === 'reed_bed') return 'Reed bed';
	if (draft.kind === 'sanctuary') return 'Sanctuary';
	if (draft.kind === 'lily_pads') return 'Lily pads';
	if (draft.kind === 'snag') return `Snag — ${draft.name}`;
	if (draft.kind === 'reshape_shoreline') return 'Reshaped shoreline';
	return GroundworksCatalogue[draft.kind].label;
}
