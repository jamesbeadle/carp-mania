export function untilTheNextFrame() {
	return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}
