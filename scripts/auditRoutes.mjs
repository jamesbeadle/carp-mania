import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

const RoutesRoot = 'src/routes';
const SourceRoot = 'src';

function* walk(directory) {
	for (const entry of readdirSync(directory)) {
		const path = join(directory, entry);
		if (statSync(path).isDirectory()) yield* walk(path);
		else yield path;
	}
}

const routeDirectories = new Set([...walk(RoutesRoot)].filter((path) => /\+(page|server)\.(svelte|ts)$/.test(path)).map((path) => dirname(path)));
const routePatterns = [...routeDirectories].map((directory) => directory.slice(RoutesRoot.length) || '/').map((route) => new RegExp(`^${route.replace(/\[[^\]]+\]/g, '[^/]+')}$`));

function isKnownRoute(href) {
	const path = href.split(/[?#]/)[0];
	return routePatterns.some((pattern) => pattern.test(path));
}

function actionsDeclaredIn(directory) {
	const serverFile = join(directory, '+page.server.ts');
	try {
		const source = readFileSync(serverFile, 'utf8');
		const block = source.slice(source.indexOf('export const actions'));
		return new Set([...block.matchAll(/^\t(\w+):/gm)].map((match) => match[1]));
	} catch {
		return new Set();
	}
}

const problems = [];
for (const path of walk(SourceRoot)) {
	if (!path.endsWith('.svelte')) continue;
	const source = readFileSync(path, 'utf8');
	for (const match of source.matchAll(/href="(\/[^"{]*)"/g)) {
		if (!isKnownRoute(match[1])) problems.push(`${path}: link to unknown route ${match[1]}`);
	}
	for (const match of source.matchAll(/action="(\/[^"?]*)\?\/(\w+)"/g)) {
		const directory = join(RoutesRoot, match[1]);
		if (!actionsDeclaredIn(directory).has(match[2])) problems.push(`${path}: posts to ${match[1]}?/${match[2]} which is not declared`);
	}
	if (!path.startsWith(RoutesRoot)) continue;
	for (const match of source.matchAll(/action="\?\/(\w+)"/g)) {
		if (!actionsDeclaredIn(dirname(path)).has(match[1])) problems.push(`${path}: posts to ?/${match[1]} which is not declared`);
	}
}

if (problems.length === 0) {
	console.log(`All links and form actions resolve across ${routeDirectories.size} routes.`);
	process.exit(0);
}
for (const problem of problems) console.log(problem);
process.exit(1);
