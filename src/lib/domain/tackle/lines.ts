export type LineColour = 'clear' | 'green' | 'brown';
export type LineThickness = 'thin' | 'medium' | 'thick';

export interface LineChoice {
	colour: LineColour;
	thickness: LineThickness;
}

export const LineColourLabels: Record<LineColour, string> = { clear: 'Clear', green: 'Green', brown: 'Brown' };
export const LineThicknessLabels: Record<LineThickness, string> = { thin: '10 lb', medium: '15 lb', thick: '20 lb' };

export const LineBreakingStrainLb: Record<LineThickness, number> = { thin: 10, medium: 15, thick: 20 };
export const LineVisibility: Record<LineThickness, number> = { thin: 0.2, medium: 0.45, thick: 0.8 };

export const LineColours = Object.keys(LineColourLabels) as LineColour[];
export const LineThicknesses = Object.keys(LineThicknessLabels) as LineThickness[];
