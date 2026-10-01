import type { CapacitorConfig } from '@capacitor/cli';
import { readFileSync } from 'node:fs';

const liveGame = JSON.parse(readFileSync('www/live-game.json', 'utf8'));
const carbon = '#060806';

const config: CapacitorConfig = {
	appId: 'com.carpmania.app',
	appName: 'Carp Mania',
	webDir: 'www',
	backgroundColor: carbon,
	appendUserAgent: 'CarpManiaApp',
	server: {
		url: liveGame.address,
		errorPath: 'offline.html'
	},
	ios: {
		contentInset: 'never',
		backgroundColor: carbon
	},
	android: {
		backgroundColor: carbon
	},
	plugins: {
		StatusBar: { overlaysWebView: true, style: 'DARK', backgroundColor: carbon }
	}
};

export default config;
