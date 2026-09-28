import type { Bounds } from './landBounds';
import { shoreCharacterAt, type ShoreCharacter } from './shoreCharacter';

const Field = { SpacingMetres: 3, MarginMetres: 40, Values: 5, EdgeGuard: 1.001 } as const;
const Slot = { Steepness: 0, Rise: 1, Shelf: 2, Plateau: 3, DropOff: 4 } as const;

export class CharacterField {
	private readonly originX: number;
	private readonly originZ: number;
	private readonly across: number;
	private readonly down: number;
	private readonly values: Float32Array;

	constructor(bounds: Bounds) {
		const { least, most } = bounds;
		this.originX = least.x - Field.MarginMetres;
		this.originZ = least.z - Field.MarginMetres;
		this.across = Math.ceil((most.x - least.x + Field.MarginMetres * 2) / Field.SpacingMetres) + 1;
		this.down = Math.ceil((most.z - least.z + Field.MarginMetres * 2) / Field.SpacingMetres) + 1;
		this.values = new Float32Array(this.across * this.down * Field.Values);
		for (let node = 0; node < this.across * this.down; node++) {
			const x = this.originX + (node % this.across) * Field.SpacingMetres;
			const z = this.originZ + Math.floor(node / this.across) * Field.SpacingMetres;
			const character = shoreCharacterAt(x, z);
			this.values.set([character.steepness, character.riseMetres, character.shelfMetres, character.plateauMetres, character.dropOff], node * Field.Values);
		}
	}

	at(x: number, z: number): ShoreCharacter {
		const column = Math.min(this.across - Field.EdgeGuard, Math.max(0, (x - this.originX) / Field.SpacingMetres));
		const row = Math.min(this.down - Field.EdgeGuard, Math.max(0, (z - this.originZ) / Field.SpacingMetres));
		const left = Math.floor(column);
		const top = Math.floor(row);
		const across = column - left;
		const down = row - top;
		const first = (top * this.across + left) * Field.Values;
		const below = first + this.across * Field.Values;
		const blend = (value: number) => {
			const upper = this.values[first + value] + (this.values[first + Field.Values + value] - this.values[first + value]) * across;
			const lower = this.values[below + value] + (this.values[below + Field.Values + value] - this.values[below + value]) * across;
			return upper + (lower - upper) * down;
		};
		return { steepness: blend(Slot.Steepness), riseMetres: blend(Slot.Rise), shelfMetres: blend(Slot.Shelf), plateauMetres: blend(Slot.Plateau), dropOff: blend(Slot.DropOff) };
	}
}
