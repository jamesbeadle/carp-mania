import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { basename, join } from 'node:path';

const TestDatabase = 'carp_mania_test';
const MaintenanceDatabase = 'postgres';
const MigrationsDirectory = 'supabase/migrations';
const ScenariosDirectory = 'supabase/tests';
const SupportDirectory = 'scripts/sqlTestSupport';
const MigrationNumberLength = 4;
const Connection = {
	PGHOST: process.env.PGHOST ?? '/tmp/pg',
	PGPORT: process.env.PGPORT ?? '5433',
	PGUSER: process.env.PGUSER ?? 'postgres'
};

function psql(database, argumentList) {
	execFileSync('psql', ['-X', '-q', '-o', '/dev/null', '-v', 'ON_ERROR_STOP=1', '-d', database, ...argumentList], {
		stdio: 'inherit',
		env: { ...process.env, ...Connection }
	});
}

function sqlFilesIn(directory) {
	return readdirSync(directory)
		.filter((name) => name.endsWith('.sql'))
		.sort()
		.map((name) => join(directory, name));
}

function runFile(path) {
	try {
		psql(TestDatabase, ['-f', path]);
	} catch {
		console.error(`\nfailed: ${path}`);
		process.exit(1);
	}
	console.log(`ok  ${path}`);
}

function recreateDatabase() {
	psql(MaintenanceDatabase, ['-c', `drop database if exists ${TestDatabase}`]);
	psql(MaintenanceDatabase, ['-c', `create database ${TestDatabase}`]);
}

function supportFilesNamed(prefix) {
	return sqlFilesIn(SupportDirectory).filter((path) => path.startsWith(join(SupportDirectory, prefix)));
}

function migrationNumberOf(path) {
	return basename(path).slice(0, MigrationNumberLength);
}

function runMigrationsWithSeeds() {
	const seededNumbers = new Set();
	for (const migration of sqlFilesIn(MigrationsDirectory)) {
		const number = migrationNumberOf(migration);
		if (!seededNumbers.has(number)) supportFilesNamed(`before_${number}_`).forEach(runFile);
		seededNumbers.add(number);
		runFile(migration);
	}
}

recreateDatabase();
supportFilesNamed('before_migrations_').forEach(runFile);
runMigrationsWithSeeds();
supportFilesNamed('after_migrations_').forEach(runFile);
sqlFilesIn(ScenariosDirectory).forEach(runFile);
console.log('\nAll SQL scenarios passed.');
