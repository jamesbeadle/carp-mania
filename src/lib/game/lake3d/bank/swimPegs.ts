import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, RingGeometry, type Sprite, type Vector3 } from 'three';
import { swimPoint } from '$lib/domain/layout/swimRules';
import type { Swim } from '$lib/domain/types';
import { worldPointOf, type LakeFrame, type WorldPoint } from '../lakeFrame';
import { Heights } from '../lakeGround';
import { headingOverTheWater, type WaterShape } from '../swimFacing';
import { labelSprite } from './labelSprite';
import { swimPlatform } from './swimPlatform';

const Peg = { HitRadius: 5, LabelHeight: 3.4, RingInner: 2.4, RingOuter: 2.9, RingLift: 0.05, Sides: 40 } as const;
const PegLook = { Chosen: '#3ee83a', Hovered: '#1fd3ff' } as const;
const LabelMetresPerOverviewMetre = 0.012;

export interface PegShowing {
	chosenId: string | null;
	hoveredId: string | null;
	areLabelsShown: boolean;
	viewReach: number;
}

export class SwimPeg {
	readonly group = new Group();
	readonly hitTarget: Mesh;
	private readonly label: Sprite;
	private readonly baseLabelScale: Vector3;
	private readonly ring: Mesh;
	private readonly ringMaterial = new MeshBasicMaterial({ color: PegLook.Chosen, transparent: true, opacity: 0.85 });

	constructor(readonly swimId: string, name: string, at: WorldPoint, facing: number) {
		this.group.position.set(at.x, 0, at.z);
		this.ring = new Mesh(new RingGeometry(Peg.RingInner, Peg.RingOuter, Peg.Sides).rotateX(-Math.PI / 2), this.ringMaterial);
		this.ring.position.setY(Heights.Bank + Peg.RingLift);
		this.hitTarget = new Mesh(new CylinderGeometry(Peg.HitRadius, Peg.HitRadius, Peg.LabelHeight * 2, 12), new MeshBasicMaterial({ visible: false }));
		this.hitTarget.userData = { swimId };
		this.label = labelSprite(name);
		this.label.position.setY(Heights.Bank + Peg.LabelHeight);
		this.baseLabelScale = this.label.scale.clone();
		this.group.add(swimPlatform(facing), this.ring, this.hitTarget, this.label);
	}

	show(showing: PegShowing) {
		const isChosen = this.swimId === showing.chosenId;
		const isHovered = this.swimId === showing.hoveredId;
		const labelScale = Math.max(1, showing.viewReach * LabelMetresPerOverviewMetre);
		this.label.visible = showing.areLabelsShown;
		this.label.scale.copy(this.baseLabelScale).multiplyScalar(labelScale);
		this.ring.visible = (isChosen || isHovered) && showing.areLabelsShown;
		this.ringMaterial.color.set(isHovered ? PegLook.Hovered : PegLook.Chosen);
	}
}

function pegFor(swim: Swim, frame: LakeFrame, water: WaterShape) {
	const at = worldPointOf(frame, swimPoint(swim));
	return new SwimPeg(swim.id, swim.name, at, headingOverTheWater(at, water));
}

export function createSwimPegs(swims: Swim[], frame: LakeFrame, water: WaterShape) {
	const pegs = swims.map((swim) => pegFor(swim, frame, water));
	const group = new Group().add(...pegs.map((peg) => peg.group));
	return { group, pegs };
}

export function showPegs(pegs: SwimPeg[], showing: PegShowing) {
	pegs.forEach((peg) => peg.show(showing));
}
