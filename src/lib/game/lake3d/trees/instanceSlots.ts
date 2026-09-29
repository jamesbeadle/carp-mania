import { InstancedBufferAttribute, InstancedMesh, Matrix4, type BufferGeometry, type Material, type Vector4 } from 'three';

const NoFullness = 1;
const Channels = { Colour: 3 } as const;

export class InstanceSlots {
	readonly mesh: InstancedMesh;
	private readonly owners: number[] = [];
	private readonly fullness: InstancedBufferAttribute;
	private readonly matrix = new Matrix4();

	constructor(geometry: BufferGeometry, material: Material, capacity: number) {
		this.fullness = new InstancedBufferAttribute(new Float32Array(Math.max(1, capacity)).fill(NoFullness), 1);
		geometry.setAttribute('instanceFullness', this.fullness);
		this.mesh = new InstancedMesh(geometry, material, Math.max(1, capacity));
		this.mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(Math.max(1, capacity) * Channels.Colour).fill(1), Channels.Colour);
		this.settle();
	}

	add(owner: number, placement: Matrix4, colour: Vector4 | null) {
		const slot = this.owners.length;
		this.owners.push(owner);
		this.write(slot, placement, colour);
		this.settle();
		return slot;
	}

	remove(slot: number, onMoved: (owner: number, slot: number) => void) {
		const last = this.owners.length - 1;
		const moved = this.owners[last];
		this.owners[slot] = moved;
		this.owners.pop();
		if (slot !== last) this.copy(last, slot);
		if (slot !== last) onMoved(moved, slot);
		this.settle();
	}

	private write(slot: number, placement: Matrix4, colour: Vector4 | null) {
		this.mesh.setMatrixAt(slot, placement);
		if (!colour) return;
		this.mesh.instanceColor?.setXYZ(slot, colour.x, colour.y, colour.z);
		this.fullness.setX(slot, colour.w);
	}

	private copy(from: number, to: number) {
		const { instanceColor } = this.mesh;
		this.mesh.getMatrixAt(from, this.matrix);
		this.mesh.setMatrixAt(to, this.matrix);
		instanceColor?.setXYZ(to, instanceColor.getX(from), instanceColor.getY(from), instanceColor.getZ(from));
		this.fullness.setX(to, this.fullness.getX(from));
	}

	private settle() {
		const { mesh } = this;
		mesh.count = this.owners.length;
		mesh.visible = mesh.count > 0;
		mesh.boundingSphere = null;
		[mesh.instanceMatrix, mesh.instanceColor, this.fullness].forEach((attribute) => {
			if (attribute) attribute.needsUpdate = true;
		});
	}
}
