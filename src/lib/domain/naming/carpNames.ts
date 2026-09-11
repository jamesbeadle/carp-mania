const CarpNamePool = [
	'Scar', 'Cluster', 'Half Moon', 'The Pig', 'Two Tone', 'Big Lin', 'Old Warrior', 'Pearly', 'Split Tail',
	'Heart Tail', 'Nemo', 'Bazil', 'Chunky', 'The Ghost', 'Dinks', 'Long Tom', 'Orange Belly', 'The Sub',
	'Moonscale', 'Peach', 'Fatty', 'Cut Tail', 'Popeye', 'The Bream', 'Goldie', 'Barbell', 'Charlie', 'Freckles',
	'Ironside', 'Jelly', 'Mango', 'Noodle', 'Pluto', 'Ripple', 'Shadow', 'Tank', 'Velvet', 'Wobbler', 'Zebedee', 'Big Ears'
];

export function carpNameForIndex(index: number) {
	const base = CarpNamePool[index % CarpNamePool.length];
	const generation = Math.floor(index / CarpNamePool.length);
	return generation === 0 ? base : `${base} ${romanNumeral(generation + 1)}`;
}

function romanNumeral(value: number) {
	const numerals: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
	let remaining = value;
	let result = '';
	for (const [amount, symbol] of numerals) {
		while (remaining >= amount) {
			result += symbol;
			remaining -= amount;
		}
	}
	return result;
}
