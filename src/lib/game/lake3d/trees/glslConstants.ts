function glslNumber(value: number) {
	return Number.isInteger(value) ? value.toFixed(1) : String(value);
}

export function glslDefines(constants: Record<string, number>) {
	return Object.entries(constants)
		.map(([name, value]) => `#define ${name} ${glslNumber(value)}\n`)
		.join('');
}
