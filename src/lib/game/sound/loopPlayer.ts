import { LoopSampleFiles, SampleFolder } from './sampleManifest';
import { decodedSample } from './samplePlayer';
import { startLoop, type LoopName, type SoundLoop } from './synth/loops';

export function startSoundLoop(context: AudioContext, destination: AudioNode, name: LoopName): SoundLoop {
	const sampleFile = LoopSampleFiles[name];
	if (sampleFile) return loopSample(context, destination, `${SampleFolder}/${sampleFile}`);
	return startLoop(context, destination, name);
}

function loopSample(context: AudioContext, destination: AudioNode, url: string): SoundLoop {
	let source: AudioBufferSourceNode | null = null;
	let isStopped = false;
	decodedSample(context, url).then((buffer) => {
		if (isStopped) return;
		source = context.createBufferSource();
		source.buffer = buffer;
		source.loop = true;
		source.connect(destination);
		source.start();
	});
	return {
		stop: () => {
			isStopped = true;
			source?.stop();
		}
	};
}
