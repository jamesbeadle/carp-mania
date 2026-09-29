const VisibleDocument = 'visible';
const VisibilityChange = 'visibilitychange';

function isTheTabVisible() {
	return document.visibilityState === VisibleDocument;
}

function onTheNextTurn(callback: () => void) {
	if (!isTheTabVisible()) return void setTimeout(callback);
	const whenHidden = () => (cancelAnimationFrame(handle), callback());
	const handle = requestAnimationFrame(() => (document.removeEventListener(VisibilityChange, whenHidden), callback()));
	document.addEventListener(VisibilityChange, whenHidden, { once: true });
}

export function untilTheNextFrame(signal?: AbortSignal) {
	return new Promise<void>((resolve, reject) => onTheNextTurn(() => (signal?.aborted ? reject(signal.reason) : resolve())));
}
