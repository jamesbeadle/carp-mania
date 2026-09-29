import { PMREMGenerator, type Scene, type Vector3, type WebGLRenderer } from 'three';
import type { HazeColours } from './aerialHaze';
import { HorizonProbe } from './horizonProbe';

const EnvironmentStrength = 0.55;
const EnvironmentCapture = { Blur: 0, Nearest: 0.1, Farthest: 20000 } as const;

export interface EnvironmentLight {
	lightFrom: (skyScene: Scene) => void;
	readHorizon: (skyScene: Scene, sunDirection: Vector3) => HazeColours;
	dispose: () => void;
}

export function environmentLightOf(renderer: WebGLRenderer, scene: Scene): EnvironmentLight {
	const environment = new PMREMGenerator(renderer);
	const probe = new HorizonProbe(renderer);
	const lightFrom = (skyScene: Scene) => {
		const previous = scene.environment;
		scene.environment = environment.fromScene(skyScene, EnvironmentCapture.Blur, EnvironmentCapture.Nearest, EnvironmentCapture.Farthest).texture;
		scene.environmentIntensity = EnvironmentStrength;
		previous?.dispose();
	};
	const readHorizon = (skyScene: Scene, sunDirection: Vector3) => probe.measure(skyScene, sunDirection);
	const dispose = () => (environment.dispose(), probe.dispose());
	return { lightFrom, readHorizon, dispose };
}
