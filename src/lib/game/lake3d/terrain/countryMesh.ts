import { Color, Float32BufferAttribute, MathUtils, Mesh, MeshStandardMaterial, type Texture } from 'three';
import type { CountryShape } from './countryShape';
import { FieldTile } from './fieldPattern';
import { squareRingGeometry } from './squareRing';

const Ring = { OuterMetres: 4200, StepsPerSide: 56, Rings: 46 } as const;
const FieldsFrom = { StartBeyond: 25, FullBeyond: 170 } as const;
const Haze = { Colour: new Color('#b7c6c2'), FullAt: 2200, Most: 0.55 } as const;
const White = new Color('#ffffff');

const BlendFields = `
#include <map_fragment>
diffuseColor.rgb = mix(meadowColour, diffuseColor.rgb, vFieldShare);
`;

function meadowBlend(material: MeshStandardMaterial, meadow: Color) {
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, { meadowColour: { value: meadow } });
		shader.vertexShader = 'attribute float fieldShare;\nvarying float vFieldShare;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvFieldShare = fieldShare;');
		shader.fragmentShader = 'uniform vec3 meadowColour;\nvarying float vFieldShare;\n' + shader.fragmentShader.replace('#include <map_fragment>', BlendFields);
	};
	return material;
}

export function createCountryside(shape: CountryShape, fields: Texture, meadow: Color) {
	const geometry = squareRingGeometry({ innerHalf: shape.edgeHalf, outerRadius: Ring.OuterMetres, stepsPerSide: Ring.StepsPerSide, rings: Ring.Rings });
	const positions = geometry.getAttribute('position');
	const uvs = new Float32Array(positions.count * 2);
	const colours = new Float32Array(positions.count * 3);
	const fieldShares = new Float32Array(positions.count);
	const colour = new Color();
	for (let index = 0; index < positions.count; index++) {
		const point = { x: positions.getX(index), z: positions.getZ(index) };
		positions.setY(index, shape.heightAt(point));
		uvs.set([(point.x + FieldTile.Offset) / FieldTile.Metres, (point.z + FieldTile.Offset) / FieldTile.Metres], index * 2);
		fieldShares[index] = MathUtils.smoothstep(shape.metresBeyond(point), FieldsFrom.StartBeyond, FieldsFrom.FullBeyond);
		const haze = Math.min(1, Math.hypot(point.x, point.z) / Haze.FullAt) * Haze.Most;
		colour.copy(White).lerp(Haze.Colour, haze).toArray(colours, index * 3);
	}
	geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
	geometry.setAttribute('color', new Float32BufferAttribute(colours, 3));
	geometry.setAttribute('fieldShare', new Float32BufferAttribute(fieldShares, 1));
	geometry.computeVertexNormals();
	const mesh = new Mesh(geometry, meadowBlend(new MeshStandardMaterial({ map: fields, vertexColors: true, roughness: 1 }), meadow));
	mesh.receiveShadow = true;
	return mesh;
}
