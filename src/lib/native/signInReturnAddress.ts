import { isNativeAppUserAgent, NativeApp } from './nativeApp';

export function signInReturnAddress(origin: string, userAgent: string | null) {
	if (isNativeAppUserAgent(userAgent)) return NativeApp.signInReturnAddress;
	return `${origin}/auth/callback`;
}
