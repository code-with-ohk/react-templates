import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
);
const templatesDir = path.join(rootDir, "templates");
const shouldWrite = process.argv.includes("--write");

const dependencySections = [
	"dependencies",
	"devDependencies",
	"peerDependencies",
	"optionalDependencies",
	"overrides",
];

async function main() {
	const packageFiles = await collectPackageFiles(templatesDir);
	const cache = new Map();
	const changes = [];

	for (const packageFile of packageFiles) {
		const content = await fs.readFile(packageFile, "utf8");
		const json = JSON.parse(content);
		const nextJson = structuredClone(json);
		let fileChanged = false;

		for (const section of dependencySections) {
			const dependencies = json[section];
			if (!dependencies) continue;

			for (const [name, currentRange] of Object.entries(dependencies)) {
				if (typeof currentRange !== "string") continue;

				const latestVersion = await getLatestVersion(name, cache);
				if (!latestVersion) continue;

				if (normalizeRange(currentRange) === latestVersion) continue;

				changes.push({
					file: packageFile,
					section,
					name,
					currentRange,
					latestVersion,
				});
				if (shouldWrite) {
					nextJson[section][name] = preserveRangePrefix(
						currentRange,
						latestVersion,
					);
					fileChanged = true;
				}
			}
		}

		if (shouldWrite && fileChanged) {
			await fs.writeFile(
				packageFile,
				`${JSON.stringify(nextJson, null, 2)}\n`,
			);
		}
	}

	if (changes.length === 0) {
		console.log("All up to date.");
		return;
	}

	for (const change of changes) {
		console.log(
			`${change.name} ${change.currentRange} → ^${change.latestVersion}`,
		);
	}

	if (!shouldWrite) {
		console.log("\nRun `npm run deps:update` to write changes.");
	}
}

async function collectPackageFiles(dir) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const entryPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await collectPackageFiles(entryPath)));
			continue;
		}

		if (entry.name === "package.json") {
			files.push(entryPath);
		}
	}

	return files;
}

async function getLatestVersion(packageName, cache) {
	if (cache.has(packageName)) {
		return cache.get(packageName);
	}

	const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
	const response = await fetch(url, {
		headers: {
			accept: "application/vnd.npm.install-v1+json",
		},
	});

	if (!response.ok) {
		cache.set(packageName, null);
		return null;
	}

	const data = await response.json();
	const latest = data?.["dist-tags"]?.latest ?? null;
	cache.set(packageName, latest);
	return latest;
}

function normalizeRange(range) {
	return range.replace(/^[~^]/, "");
}

function preserveRangePrefix(currentRange, latestVersion) {
	if (currentRange.startsWith("^") || currentRange.startsWith("~")) {
		return `${currentRange[0]}${latestVersion}`;
	}

	return latestVersion;
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
