import { Vector3 } from 'three';

export interface BushLobe {
	centre: Vector3;
	size: number;
}

const Spread = { Across: 0.55, Lowest: 0.05, Highest: 0.45, Smallest: 0.38, Largest: 0.72 } as const;
const Main = { centre: new Vector3(0, 0.25, 0), size: 0.75 } as const;

export function lobesOf(count: number, random: () => number): BushLobe[] {
	const extra = Array.from({ length: count - 1 }, () => {
		const turn = random() * Math.PI * 2;
		const reach = Spread.Across * (1 / 2 + random() / 2);
		const height = Spread.Lowest + random() * (Spread.Highest - Spread.Lowest);
		const size = Spread.Smallest + random() * (Spread.Largest - Spread.Smallest);
		return { centre: new Vector3(Math.cos(turn) * reach, height * (1 - reach), Math.sin(turn) * reach), size };
	});
	return [{ centre: Main.centre.clone(), size: Main.size }, ...extra];
}
