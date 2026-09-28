import type { Group, MeshStandardMaterial, Object3D } from 'three';
import type { AlarmParts } from './podParts';
import type { RodModel } from './rodModel';

export class PodRod {
	readonly restingPitch: number;
	readonly tip: Object3D;
	private readonly rod: Group;
	private readonly led: MeshStandardMaterial;
	private readonly hanger: Object3D;
	private readonly hangerRest: number;
	private readonly bendBy: (amount: number) => void;

	constructor(model: RodModel, alarm: AlarmParts, restingPitch: number) {
		this.rod = model.group;
		this.tip = model.tip;
		this.bendBy = model.bend;
		this.led = alarm.led;
		this.hanger = alarm.hanger;
		this.hangerRest = alarm.hangerRest;
		this.restingPitch = restingPitch;
	}

	pose(pitch: number, yaw = 0) {
		this.rod.rotation.set(pitch, yaw, 0, 'YXZ');
	}

	bend(amount: number) {
		this.bendBy(amount);
	}

	lightAlarm(intensity: number) {
		this.led.emissiveIntensity = intensity;
	}

	liftHanger(height: number) {
		this.hanger.position.setY(this.hangerRest + height);
	}
}
