import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const isRelative = (specifier) => specifier.startsWith('./') || specifier.startsWith('../');
const hasExtension = (specifier) => /\.[a-z]+$/.test(specifier);

export async function resolve(specifier, context, nextResolve) {
	if (!isRelative(specifier) || hasExtension(specifier)) return nextResolve(specifier, context);
	const candidate = new URL(`${specifier}.ts`, context.parentURL);
	try {
		await access(fileURLToPath(candidate));
		return nextResolve(candidate.href, context);
	} catch {
		return nextResolve(specifier, context);
	}
}
