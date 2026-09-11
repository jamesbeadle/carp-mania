export type TubingColour = 'black' | 'yellow' | 'brown' | 'green';

export const TubingLabels: Record<TubingColour, string> = {
	black: 'Black (relies on not being seen)',
	yellow: 'Yellow (reads as sweetcorn)',
	brown: 'Brown (silt and clay camouflage)',
	green: 'Green (weed camouflage)'
};

export const TubingColours = Object.keys(TubingLabels) as TubingColour[];
