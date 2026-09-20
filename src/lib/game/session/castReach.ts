import { layoutScaleFor } from '$lib/domain/layout/layoutScale';
import { swimPoint } from '$lib/domain/layout/swimRules';
import { castDistanceFeet } from '$lib/domain/tackle/castDistance';
import { toScene, type Point } from '../scene/lakeShape';
import { SceneSize } from '../scene/palette';
import { nextRodToCast } from './sessionFlow';
import type { SessionState } from './sessionState.svelte';

export interface CastReach {
	centre: Point;
	radiusScenePixels: number;
	reachFeet: number;
}

export function castReachOf(session: SessionState): CastReach | null {
	const rod = nextRodToCast(session);
	if (session.phase !== 'fishing' || !session.swim || !rod || session.isPickingASwimToMoveTo) return null;
	const scale = layoutScaleFor(Number(session.lake.plot_acres));
	const reachFeet = castDistanceFeet(rod.kit);
	return { centre: toScene(swimPoint(session.swim)), radiusScenePixels: (reachFeet / scale.feetAcross) * SceneSize.Width, reachFeet };
}
