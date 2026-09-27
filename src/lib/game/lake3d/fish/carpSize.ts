const GramsPerPound = 453.6;
const GramsPerCubicCentimetreOfLength = 0.0165;
const CentimetresPerMetre = 100;

export function carpLengthMetres(weightLb: number) {
	return Math.cbrt((weightLb * GramsPerPound) / GramsPerCubicCentimetreOfLength) / CentimetresPerMetre;
}
