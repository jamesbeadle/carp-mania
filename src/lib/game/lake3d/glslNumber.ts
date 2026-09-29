export function glslFloat(value: number) {
	return Number.isInteger(value) ? value.toFixed(1) : String(value);
}
