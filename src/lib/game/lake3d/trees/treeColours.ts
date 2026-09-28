import { Color } from 'three';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { TreeKind } from './plantedTree';

const Foliage: Record<SeasonName, Record<TreeKind, string[]>> = {
	spring: { poplar: ['#4f7a2c', '#5e8a34'], broadleaf: ['#5b8a36', '#6f9a40', '#4a7a2e'], willow: ['#8aa84a', '#9ab85a'], bush: ['#557f30', '#4a7229', '#62883a'] },
	summer: { poplar: ['#2f4f1e', '#3a5a22'], broadleaf: ['#3d6326', '#476e2a', '#34561f'], willow: ['#6a8a3a', '#78964a'], bush: ['#3a5c24', '#446828', '#355420'] },
	autumn: { poplar: ['#b8902c', '#a07a24'], broadleaf: ['#a8582a', '#c07a30', '#7a6a2a'], willow: ['#a89a3a', '#b8a84a'], bush: ['#8a4a26', '#7a6a2c', '#94622a'] },
	winter: { poplar: ['#4a4a3a', '#55533f'], broadleaf: ['#5a5244', '#4e473a'], willow: ['#6a6a4a', '#5e5e44'], bush: ['#4e4636', '#58503e', '#4a4232'] }
};

export const BarkColour = '#3b2e22';

const Brighter = 0.04;

export function foliageFor(season: SeasonName, kind: TreeKind) {
	return Foliage[season][kind].map((hex) => new Color(hex).offsetHSL(0, 0, Brighter).getHexString()).map((hex) => `#${hex}`);
}
