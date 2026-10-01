export const NativeApp = {
	userAgentMark: 'CarpManiaApp',
	signInReturnAddress: 'com.carpmania.app://auth/callback'
} as const;

export function isNativeAppUserAgent(userAgent: string | null) {
	return userAgent?.includes(NativeApp.userAgentMark) === true;
}
