import { isSiteWork } from '$lib/domain/groundworks/workKinds';
import type { Lake, Swim } from '$lib/domain/types';
import { clampCamera } from '../../scene/camera';
import type { CameraState } from '../../scene/cameraState.svelte';
import { toScene } from '../../scene/lakeShape';
import type { BuilderState } from '../builderState.svelte';
import { draftSiteOf } from './draftSite';

const FocusZoom = 3;

export function createSiteFocus(camera: CameraState) {
	let focusedKind: string | null = null;
	return function focusOnANewSite(builder: BuilderState, lake: Pick<Lake, 'layout' | 'plot_acres'>, swims: Swim[]) {
		const draft = builder.draft;
		const kind = draft && isSiteWork(draft) ? draft.kind : null;
		const isNew = kind !== null && kind !== focusedKind;
		focusedKind = kind;
		const site = isNew && draft ? draftSiteOf(draft, lake, swims) : null;
		if (!site) return;
		const zoom = Math.max(FocusZoom, camera.zoom);
		camera.camera = clampCamera({ zoom, centre: toScene(site.centre) });
	};
}
