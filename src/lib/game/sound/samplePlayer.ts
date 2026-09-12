const decoded = new Map<string, Promise<AudioBuffer>>();

export async function playSample(context: AudioContext, destination: AudioNode, url: string) {
	const buffer = await decodedSample(context, url);
	const source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(destination);
	source.start();
}

export function decodedSample(context: AudioContext, url: string) {
	const cached = decoded.get(url);
	if (cached) return cached;
	const loading = fetch(url)
		.then((response) => response.arrayBuffer())
		.then((bytes) => context.decodeAudioData(bytes));
	decoded.set(url, loading);
	return loading;
}
