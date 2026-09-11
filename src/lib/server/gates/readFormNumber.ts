import { fail } from '@sveltejs/kit';

export function readFormNumber(formData: FormData, field: string, minimum: number, maximum: number) {
	const value = Number(formData.get(field));
	const isValid = Number.isFinite(value) && value >= minimum && value <= maximum;
	if (!isValid) return { value: null, failure: fail(400, { message: `${field} must be between ${minimum} and ${maximum}` }) };
	return { value, failure: null };
}

export function readFormChoice<Choice extends string>(formData: FormData, field: string, choices: readonly Choice[]) {
	const value = String(formData.get(field) ?? '');
	const isValid = (choices as readonly string[]).includes(value);
	if (!isValid) return { value: null, failure: fail(400, { message: `${field} is not a valid choice` }) };
	return { value: value as Choice, failure: null };
}
