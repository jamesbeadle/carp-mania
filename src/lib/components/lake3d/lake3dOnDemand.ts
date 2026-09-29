import type LakeFlyover3D from './LakeFlyover3D.svelte';
import type LakeView3D from './LakeView3D.svelte';

export type LakeFlyover3DComponent = typeof LakeFlyover3D;
export type LakeView3DComponent = typeof LakeView3D;

export async function lakeFlyover3dOnDemand(): Promise<LakeFlyover3DComponent> {
	const { default: loaded } = await import('./LakeFlyover3D.svelte');
	return loaded;
}

export async function lakeView3dOnDemand(): Promise<LakeView3DComponent> {
	const { default: loaded } = await import('./LakeView3D.svelte');
	return loaded;
}
