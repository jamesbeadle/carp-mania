import { SampleFiles, SampleFolder } from './sampleManifest';
import { playSample } from './samplePlayer';
import { FishingSoundNames, playFishingSound, type FishingSoundName } from './synth/fishingSounds';
import { playUiSound, type UiSoundName } from './synth/uiSounds';

export type SoundName = UiSoundName | FishingSoundName;

export function playSound(context: AudioContext, destination: AudioNode, name: SoundName) {
	const sampleFile = SampleFiles[name];
	if (sampleFile) return void playSample(context, destination, `${SampleFolder}/${sampleFile}`);
	if (isFishingSound(name)) return playFishingSound(context, destination, name);
	playUiSound(context, destination, name);
}

function isFishingSound(name: SoundName): name is FishingSoundName {
	return (FishingSoundNames as string[]).includes(name);
}
