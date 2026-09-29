let isSupported: boolean | null = null;

function probe() {
	const context = document.createElement('canvas').getContext('webgl2');
	const isAvailable = Boolean(context?.getExtension('WEBGL_multi_draw'));
	context?.getExtension('WEBGL_lose_context')?.loseContext();
	return isAvailable;
}

export function hasMultiDraw() {
	isSupported ??= probe();
	return isSupported;
}
