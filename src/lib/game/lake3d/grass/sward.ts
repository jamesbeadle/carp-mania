import { Color, InstancedBufferGeometry, Mesh, Vector4, type Camera, type Texture } from 'three';
import { coverQuality, NearDetailLayer } from '../renderQuality';
import type { AtlasGrid } from './coverMaterial';
import { crossedCards } from './coverCards';
import type { SurveyedBank } from './coverGround';
import { swardMaterial } from './swardMaterial';
import { bakeSwardField } from './swardField';
import { swardSpots } from './swardSpots';
import type { CoverWind } from './coverWind';

const SwardCards = { planes: 1, segments: 1, upwardNormals: 0.9, rootShade: 0.72, splay: 0 } as const;
const Reach = { FullShare: 0.28, GoneShare: 0.47, Fade: 0.06 } as const;
const Warmth = new Color('#f0dc9a');

function swardGeometry(count: number, attributes: ReturnType<typeof swardSpots>) {
	const card = crossedCards(SwardCards);
	const geometry = new InstancedBufferGeometry();
	['position', 'normal', 'uv', 'color'].forEach((name) => geometry.setAttribute(name, card.getAttribute(name)));
	geometry.setIndex(card.getIndex());
	geometry.setAttribute('swardSpot', attributes.spot);
	geometry.setAttribute('swardLook', attributes.look);
	geometry.instanceCount = count;
	return geometry;
}

function hiddenFromHighCameras(mesh: Mesh, geometry: InstancedBufferGeometry, bank: SurveyedBank, goneBeyond: number) {
	const count = geometry.instanceCount;
	mesh.onBeforeRender = (_renderer, _scene, camera: Camera) => {
		const { position } = camera;
		const height = position.y - bank.groundAt({ x: position.x, z: position.z });
		geometry.instanceCount = height > goneBeyond ? 0 : count;
	};
}

export function createSward(bank: SurveyedBank, atlas: Texture, grid: AtlasGrid, wind: CoverWind) {
	const cover = coverQuality();
	const span = cover.swardSpan;
	const field = bakeSwardField(bank, cover.swardTexelMetres);
	const spots = swardSpots(span, cover.swardPerSquareMetre);
	const reach = new Vector4(span, span * Reach.FullShare, span * Reach.GoneShare, Reach.Fade);
	const material = swardMaterial({ atlas, grid, wind, field, reach, warmth: Warmth });
	const geometry = swardGeometry(spots.count, spots);
	const mesh = new Mesh(geometry, material);
	Object.assign(mesh, { name: 'cover-sward', frustumCulled: false, receiveShadow: true });
	mesh.layers.set(NearDetailLayer);
	hiddenFromHighCameras(mesh, geometry, bank, reach.z);
	return mesh;
}
