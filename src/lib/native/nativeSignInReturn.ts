import { NativeApp } from './nativeApp';

type OpenedAddress = { url: string };
type ListenerHandle = { remove: () => Promise<void> };
type AppPlugin = { addListener: (event: 'appUrlOpen', listener: (opened: OpenedAddress) => void) => Promise<ListenerHandle> };
type CapacitorBridge = { Plugins?: { App?: AppPlugin } };

function nativeAppPlugin() {
	const bridge = (window as { Capacitor?: CapacitorBridge }).Capacitor;
	return bridge?.Plugins?.App ?? null;
}

function finishSignIn(opened: OpenedAddress) {
	const address = opened.url;
	if (!address.startsWith(NativeApp.signInReturnAddress)) return;
	const returned = new URL(address);
	window.location.assign(`/auth/callback${returned.search}`);
}

export function listenForAppSignIn() {
	const app = nativeAppPlugin();
	if (!app) return () => {};
	const listening = app.addListener('appUrlOpen', finishSignIn);
	return () => void listening.then((handle) => handle.remove());
}
