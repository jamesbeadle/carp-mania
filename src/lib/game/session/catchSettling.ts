const SwallowedKeys = new Set(['Space', 'Enter']);

export function swallowKeysWhileSettling(event: KeyboardEvent, isSettling: boolean) {
	if (!isSettling || !SwallowedKeys.has(event.code)) return;
	event.preventDefault();
	event.stopPropagation();
}

export function settleAfterTheCatch(isSettling: boolean) {
	if (!isSettling) return;
	const focused = document.activeElement as HTMLElement | null;
	focused?.blur();
}
