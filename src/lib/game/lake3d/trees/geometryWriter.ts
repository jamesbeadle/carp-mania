import { BufferGeometry, Float32BufferAttribute, type Color, type Vector3 } from 'three';

export interface ExtraAttribute {
	name: string;
	size: number;
}

export class GeometryWriter {
	private readonly positions: number[] = [];
	private readonly normals: number[] = [];
	private readonly uvs: number[] = [];
	private readonly colours: number[] = [];
	private readonly extraValues: number[][];
	private readonly indices: number[] = [];

	constructor(private readonly extras: ExtraAttribute[]) {
		this.extraValues = extras.map(() => []);
	}

	get vertexCount() {
		return this.positions.length / 3;
	}

	vertex(position: Vector3, normal: Vector3, u: number, v: number, colour: Color, extra: number[]) {
		this.positions.push(position.x, position.y, position.z);
		this.normals.push(normal.x, normal.y, normal.z);
		this.uvs.push(u, v);
		this.colours.push(colour.r, colour.g, colour.b);
		let offset = 0;
		this.extras.forEach((attribute, index) => {
			this.extraValues[index].push(...extra.slice(offset, offset + attribute.size));
			offset += attribute.size;
		});
		return this.vertexCount - 1;
	}

	triangle(first: number, second: number, third: number) {
		this.indices.push(first, second, third);
	}

	quad(first: number, second: number, third: number, fourth: number) {
		this.indices.push(first, second, third, first, third, fourth);
	}

	build() {
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(this.positions, 3));
		geometry.setAttribute('normal', new Float32BufferAttribute(this.normals, 3));
		geometry.setAttribute('uv', new Float32BufferAttribute(this.uvs, 2));
		geometry.setAttribute('color', new Float32BufferAttribute(this.colours, 3));
		this.extras.forEach((attribute, index) => geometry.setAttribute(attribute.name, new Float32BufferAttribute(this.extraValues[index], attribute.size)));
		geometry.setIndex(this.indices);
		geometry.computeBoundingSphere();
		geometry.computeBoundingBox();
		return geometry;
	}
}
