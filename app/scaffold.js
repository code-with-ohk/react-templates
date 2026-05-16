import fs from "fs-extra";
import path from "path";
import { spawn } from "child_process";
import chalk from "chalk";
import { TEMPLATES_DIR, computeQueries } from "./constants.js";
import { processEjsTemplates } from "./template.js";

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

	if (fs.existsSync(addonPkgPath)) {
		const addonPkg = await fs.readJson(addonPkgPath);
		let targetPkg = {};
		if (fs.existsSync(targetPkgPath)) {
			targetPkg = await fs.readJson(targetPkgPath);
		}

		// Only merge dependency maps to avoid clobbering project metadata.
		const mergeDeps = (target = {}, addon = {}) => {
			const out = { ...target };
			for (const [name, ver] of Object.entries(addon)) {
				if (!out[name]) out[name] = ver; // do not overwrite existing versions
			}
			return out;
		};

		const mergedPkg = { ...targetPkg };
		mergedPkg.dependencies = mergeDeps(
			targetPkg.dependencies,
			addonPkg.dependencies,
		);
		mergedPkg.devDependencies = mergeDeps(
			targetPkg.devDependencies,
			addonPkg.devDependencies,
		);
		// merge peerDependencies if present in addon
		mergedPkg.peerDependencies = mergeDeps(
			targetPkg.peerDependencies,
			addonPkg.peerDependencies,
		);

		// If target had no package.json, use addon package.json as base but keep this safe-merge behavior
		if (!fs.existsSync(targetPkgPath)) {
			// ensure name/version from addon are not blindly copied; keep only deps
			await fs.writeJson(targetPkgPath, mergedPkg, { spaces: "\t" });
		} else {
			await fs.writeJson(targetPkgPath, mergedPkg, { spaces: "\t" });
		}
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

/**
 * Render EJS templates for a scaffolded project while passing
 * computed `queries` booleans to templates.
 */
export async function renderTemplatesWithQueries(
	targetDir,
	addons,
	projectName,
) {
	const queries = computeQueries(addons);
	return processEjsTemplates(targetDir, {
		addons,
		name: projectName,
		queries,
	});
}
