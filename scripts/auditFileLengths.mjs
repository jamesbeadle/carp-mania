import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MaximumLinesPerFile = 100;
const SourceRoots = ['src', 'scripts', 'supabase'];
const SkippedDirectories = new Set(['node_modules', '.svelte-kit']);

function* walk(directory) {
	for (const entry of readdirSync(directory)) {
		if (SkippedDirectories.has(entry)) continue;
		const path = join(directory, entry);
		if (statSync(path).isDirectory()) yield* walk(path);
		else yield path;
	}
}

const overLength = [];
for (const root of SourceRoots) {
	for (const path of walk(root)) {
		const lineCount = readFileSync(path, 'utf8').trimEnd().split('\n').length;
		if (lineCount > MaximumLinesPerFile) overLength.push({ path, lineCount });
	}
}

if (overLength.length === 0) {
	console.log(`All source files are within ${MaximumLinesPerFile} lines.`);
	process.exit(0);
}
for (const { path, lineCount } of overLength) console.log(`${lineCount}\t${path}`);
process.exit(1);
