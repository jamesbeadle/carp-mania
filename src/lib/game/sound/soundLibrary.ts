import { SampleFiles, SampleFolder } from './sampleManifest';
import { playSample } from './samplePlayer';
import { playUiSound, type UiSoundName } from './synth/uiSounds';

export type SoundName = UiSoundName;

export function playSound(context: AudioContext, destination: AudioNode, name: SoundName) {
	const sampleFile = SampleFiles[name];
	if (sampleFile) return void playSample(context, destination, `${SampleFolder}/${sampleFile}`);
	playUiSound(context, destination, name);
}
