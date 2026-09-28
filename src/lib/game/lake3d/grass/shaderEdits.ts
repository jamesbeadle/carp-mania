export type ShaderEdit = [string, string];

export function including(chunk: string, extra: string): ShaderEdit {
	const include = `#include <${chunk}>`;
	return [include, `${include}\n${extra}`];
}

export function replacing(chunk: string, code: string): ShaderEdit {
	return [`#include <${chunk}>`, code];
}

export function edited(source: string, edits: ShaderEdit[]) {
	return edits.reduce((text, [from, to]) => text.replace(from, to), source);
}
