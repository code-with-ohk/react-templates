import fs from "fs-extra";
import path from "path";
import lodashMerge from "lodash.merge";
import { spawn } from "child_process";
import chalk from "chalk";
import { TEMPLATES_DIR } from "./constants.js";

/**
 * Copies the base template to the target directory.
 */
export async function copyBaseTemplate(targetDir, language) {
	const baseTemplatePath = path.join(TEMPLATES_DIR, language);
	if (!fs.existsSync(baseTemplatePath)) {
		throw new Error(`Base template not found at ${baseTemplatePath}`);
	}
	await fs.copy(baseTemplatePath, targetDir);
}

/**
 * Applies an add-on to the target directory.
 */
export async function applyAddon(targetDir, addon) {
	const addonDir = path.join(TEMPLATES_DIR, "addons", addon);

	if (!fs.existsSync(addonDir)) {
		console.warn(
			chalk.yellow(`\nWarning: Add-on "${addon}" not found locally.`),
		);
		return;
	}

	// 1. Copy files (Overwrite, but EXCLUDE package.json)
	await fs.copy(addonDir, targetDir, {
		overwrite: true,
		filter: (src) => path.basename(src) !== "package.json",
	});

	// 2. Merge package.json MANUALLY
	const targetPkgPath = path.join(targetDir, "package.json");
	const addonPkgPath = path.join(addonDir, "package.json");

	if (fs.existsSync(addonPkgPath) && fs.existsSync(targetPkgPath)) {
		const targetPkg = await fs.readJson(targetPkgPath);
		const addonPkg = await fs.readJson(addonPkgPath);

		// Merge dependencies using lodash.merge
		const mergedPkg = lodashMerge({}, targetPkg, addonPkg);

		await fs.writeJson(targetPkgPath, mergedPkg, {
			spaces: "\t",
		});
	}
}

/**
 * Installs dependencies in the target directory using `npm install`.
 */
export async function installDependencies(targetDir) {
	return new Promise((resolve, reject) => {
		const isWindows = process.platform === "win32";
		const command = isWindows ? "npm.cmd" : "npm";

		const child = spawn(command, ["install"], {
			cwd: targetDir,
			stdio: "ignore",
			shell: false,
		});
		child.on("close", (code) => {
			if (code === 0) resolve();
			else reject(new Error("npm install failed"));
		});
	});
}
