export function isWebGlAvailable() {
	const canvas = document.createElement('canvas');
	return canvas.getContext('webgl2') !== null || canvas.getContext('webgl') !== null;
}
