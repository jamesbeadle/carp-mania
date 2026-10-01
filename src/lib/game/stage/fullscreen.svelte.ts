import { isNativeAppUserAgent } from '$lib/native/nativeApp';

export class FullscreenState {
	isFullscreen = $state(false);
	isSupported = $state(false);

	watch() {
		if (typeof document === 'undefined') return () => {};
		const isInsideNativeApp = isNativeAppUserAgent(navigator.userAgent);
		this.isSupported = document.fullscreenEnabled === true && !isInsideNativeApp;
		const sync = () => (this.isFullscreen = document.fullscreenElement !== null);
		sync();
		document.addEventListener('fullscreenchange', sync);
		return () => document.removeEventListener('fullscreenchange', sync);
	}

	async toggle() {
		if (!this.isSupported) return;
		if (document.fullscreenElement) return document.exitFullscreen();
		await document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => undefined);
	}
}

export const fullscreen = new FullscreenState();
