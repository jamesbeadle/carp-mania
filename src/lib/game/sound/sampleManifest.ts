import type { SoundName } from './soundLibrary';
import type { LoopName } from './synth/loops';

export const SampleFolder = '/sounds';

export const SampleFiles: Partial<Record<SoundName, string>> = {};

export const LoopSampleFiles: Partial<Record<LoopName, string>> = {};
