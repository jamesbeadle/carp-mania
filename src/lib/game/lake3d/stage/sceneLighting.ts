import type { StageConditions } from '../../sky/stageConditions';
import type { HazeColours } from '../aerialHaze';
import type { LakeRenderer } from '../lakeRenderer';
import type { LakeWorld } from '../lakeWorld';

const RelightsPerHour = 4;

function lightingKeyOf(conditions: StageConditions) {
	const { weather } = conditions;
	return `${Math.round(conditions.hour * RelightsPerHour)}:${conditions.season}:${weather.kind}`;
}

export class SceneLighting {
	private litFor = '';
	private relights = 0;

	constructor(private readonly world: LakeWorld, private readonly renderer: LakeRenderer) {}

	light(conditions: StageConditions) {
		this.world.setConditions(conditions);
		const { sky } = this.world;
		this.renderer.expose(this.world.daylight, sky.exposureShare);
		const lightingKey = lightingKeyOf(conditions);
		if (lightingKey === this.litFor) return;
		const isFirstLight = this.litFor === '';
		this.litFor = lightingKey;
		const { sunlight } = sky;
		const skyScene = sky.environmentScene();
		this.renderer.lightFrom(skyScene);
		if (isFirstLight) return sky.tintHaze(this.renderer.readHorizon(skyScene, sunlight.direction));
		this.relights += 1;
		const relight = this.relights;
		void this.renderer.readHorizonLater(skyScene, sunlight.direction).then((colours) => this.tintIfStillCurrent(relight, colours));
	}

	private tintIfStillCurrent(relight: number, colours: HazeColours) {
		if (relight !== this.relights) return;
		const { sky } = this.world;
		sky.tintHaze(colours);
	}
}
