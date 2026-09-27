import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, RingGeometry, type Sprite, type Vector3 } from 'three';
import { swimPoint } from '$lib/domain/layout/swimRules';
import type { Swim } from '$lib/domain/types';
import { worldPointOf, type LakeFrame, type WorldPoint } from '../lakeFrame';
import { Heights } from '../lakeGround';
import { labelSprite } from './labelSprite';

const Peg = { Platform: 2.2, Thickness: 0.12, PostHeight: 1.1, PostRadius: 0.06, HitRadius: 5, LabelHeight: 3.4, RingInner: 2.4, RingOuter: 2.9, RingLift: 0.05, Sides: 40 } as const;
const PegLook = { Timber: '#6b4a2e', Chosen: '#3ee83a', Hovered: '#1fd3ff' } as const;
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

	constructor(readonly swimId: string, name: string, at: WorldPoint) {
		this.group.position.set(at.x, 0, at.z);
		const timber = new MeshStandardMaterial({ color: PegLook.Timber, roughness: 0.9 });
		const platform = new Mesh(new BoxGeometry(Peg.Platform, Peg.Thickness, Peg.Platform), timber);
		platform.position.setY(Heights.Bank + Peg.Thickness / 2);
		const post = new Mesh(new CylinderGeometry(Peg.PostRadius, Peg.PostRadius, Peg.PostHeight, 6), timber);
		post.position.set(-Peg.Platform / 2, Heights.Bank + Peg.PostHeight / 2, -Peg.Platform / 2);
		this.ring = new Mesh(new RingGeometry(Peg.RingInner, Peg.RingOuter, Peg.Sides).rotateX(-Math.PI / 2), this.ringMaterial);
		this.ring.position.setY(Heights.Bank + Peg.RingLift);
		this.hitTarget = new Mesh(new CylinderGeometry(Peg.HitRadius, Peg.HitRadius, Peg.LabelHeight * 2, 12), new MeshBasicMaterial({ visible: false }));
		this.hitTarget.userData = { swimId };
		this.label = labelSprite(name);
		this.label.position.setY(Heights.Bank + Peg.LabelHeight);
		this.baseLabelScale = this.label.scale.clone();
		this.group.add(platform, post, this.ring, this.hitTarget, this.label);
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

function pegFor(swim: Swim, frame: LakeFrame) {
	return new SwimPeg(swim.id, swim.name, worldPointOf(frame, swimPoint(swim)));
}

export function createSwimPegs(swims: Swim[], frame: LakeFrame) {
	const pegs = swims.map((swim) => pegFor(swim, frame));
	const group = new Group().add(...pegs.map((peg) => peg.group));
	return { group, pegs };
}

export function showPegs(pegs: SwimPeg[], showing: PegShowing) {
	pegs.forEach((peg) => peg.show(showing));
}
