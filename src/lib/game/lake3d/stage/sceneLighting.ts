import type { StageConditions } from '../../sky/stageConditions';
import type { LakeRenderer } from '../lakeRenderer';
import type { LakeWorld } from '../lakeWorld';

const RelightsPerHour = 4;

function lightingKeyOf(conditions: StageConditions) {
	const { weather } = conditions;
	return `${Math.round(conditions.hour * RelightsPerHour)}:${conditions.season}:${weather.kind}`;
}

export class SceneLighting {
	private litFor = '';

	constructor(private readonly world: LakeWorld, private readonly renderer: LakeRenderer) {}

	light(conditions: StageConditions) {
		this.world.setConditions(conditions);
		this.renderer.expose(this.world.daylight);
		const lightingKey = lightingKeyOf(conditions);
		if (lightingKey === this.litFor) return;
		this.litFor = lightingKey;
		this.renderer.lightFrom(this.world.sky.environmentScene());
	}
}
