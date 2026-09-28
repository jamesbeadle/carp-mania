import { seededRandom } from '$lib/domain/random';

export interface NoiseRecipe {
	pixels: number;
	cells: number;
	octaves: number;
	seed: number;
}

const Persistence = 0.5;

function lattice(cells: number, random: () => number) {
	return Float32Array.from({ length: cells * cells }, () => random());
}

function eased(share: number) {
	return share * share * (3 - 2 * share);
}

function sampleLattice(values: Float32Array, cells: number, x: number, y: number) {
	const left = Math.floor(x);
	const top = Math.floor(y);
	const across = eased(x - left);
	const down = eased(y - top);
	const at = (column: number, row: number) => values[(((row % cells) + cells) % cells) * cells + (((column % cells) + cells) % cells)];
	const upper = at(left, top) + (at(left + 1, top) - at(left, top)) * across;
	const lower = at(left, top + 1) + (at(left + 1, top + 1) - at(left, top + 1)) * across;
	return upper + (lower - upper) * down;
}

export function tileableNoise(recipe: NoiseRecipe) {
	const random = seededRandom(recipe.seed);
	const layers = Array.from({ length: recipe.octaves }, (_, octave) => ({ cells: recipe.cells * 2 ** octave, weight: Persistence ** octave }));
	const lattices = layers.map((layer) => lattice(layer.cells, random));
	const totalWeight = layers.reduce((sum, layer) => sum + layer.weight, 0);
	const values = new Float32Array(recipe.pixels * recipe.pixels);
	for (let pixel = 0; pixel < values.length; pixel++) {
		const u = (pixel % recipe.pixels) / recipe.pixels;
		const v = Math.floor(pixel / recipe.pixels) / recipe.pixels;
		const sum = layers.reduce((total, layer, index) => total + sampleLattice(lattices[index], layer.cells, u * layer.cells, v * layer.cells) * layer.weight, 0);
		values[pixel] = sum / totalWeight;
	}
	return values;
}
