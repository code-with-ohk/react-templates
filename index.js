#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import lodashMerge from "lodash.merge";
import {
	intro,
	outro,
	text,
	select,
	multiselect,
	confirm,
	spinner,
	isCancel,
	cancel,
} from "@clack/prompts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, "templates");

async function run() {
	intro(
		chalk.bgCyan(chalk.black(" create-react-template ")) +
			chalk.dim(" (Ctrl+C to cancel)"),
	);

	// 1. Get Project Name
	const args = process.argv.slice(2);
	let projectName = args[0] && !args[0].startsWith("--") ? args[0] : null;

	if (!projectName) {
		const name = await text({
			message: "Project name",
			placeholder: "my-project",
			defaultValue: "my-project",
			validate: (value) => {
				if (/^([A-Za-z0-9\-\_\.]+)$/.test(value)) return;
				return "Project name may only include letters, numbers, underscores, hashes and dots.";
			},
		});

		if (isCancel(name)) {
			cancel("Operation cancelled.");
			process.exit(0);
		}
		projectName = name;
	}

	const targetDir = path.resolve(process.cwd(), projectName);
	if (fs.existsSync(targetDir)) {
		console.error(chalk.red(`Directory ${projectName} already exists.`));
		process.exit(1);
	}

	// 2. Select Language (Base Template)
	const language = await select({
		message: "Select a language",
		options: [{ label: chalk.blue("TypeScript"), value: "base-ts" }],
	});

	if (isCancel(language)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}

	// 3. Select Add-ons
	const addons = await multiselect({
		message: "Select additional features",
		options: [
			{ label: "Tailwind CSS", value: "tailwind" },
			{ label: "Shadcn UI", value: "shadcn" },
		],
		required: false,
	});

	if (isCancel(addons)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}

	const s = spinner();
	s.start(`Scaffolding project in ${chalk.cyan(targetDir)}`);

	try {
		// --- GENERATION LOGIC ---

		// A. Copy Base Template
		const baseTemplatePath = path.join(TEMPLATES_DIR, language);
		if (!fs.existsSync(baseTemplatePath)) {
			throw new Error(`Base template not found at ${baseTemplatePath}`);
		}
		await fs.copy(baseTemplatePath, targetDir);

		// B. Apply Add-ons
		for (const addon of addons) {
			s.message(`Adding ${addon}...`);
			const addonDir = path.join(TEMPLATES_DIR, "addons", addon);

			if (fs.existsSync(addonDir)) {
				// 1. Copy files (Overwrite, but EXCLUDE package.json)
				await fs.copy(addonDir, targetDir, {
					overwrite: true,
					filter: (src) => path.basename(src) !== "package.json",
				});

				// 2. Merge package.json MANUALLY
				const targetPkgPath = path.join(targetDir, "package.json");
				const addonPkgPath = path.join(addonDir, "package.json");

				if (
					fs.existsSync(addonPkgPath) &&
					fs.existsSync(targetPkgPath)
				) {
					const targetPkg = await fs.readJson(targetPkgPath);
					const addonPkg = await fs.readJson(addonPkgPath);

					// Merge dependencies
					const mergedPkg = lodashMerge({}, targetPkg, addonPkg);

					await fs.writeJson(targetPkgPath, mergedPkg, {
						spaces: "\t",
					});
				}
			} else {
				console.warn(
					chalk.yellow(
						`\nWarning: Add-on "${addon}" not found locally.`,
					),
				);
			}
		}

		s.stop(`Scaffolding complete.`);
	} catch (error) {
		s.stop(`Scaffolding failed.`);
		console.error(chalk.red(`Error: ${error.message}`));
		process.exit(1);
	}

	// 4. Install Dependencies
	const shouldInstall = await confirm({
		message: "Install dependencies now?",
		initialValue: true,
	});

	if (isCancel(shouldInstall)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}

	if (shouldInstall) {
		s.start("Installing dependencies...");
		await new Promise((resolve, reject) => {
			const child = spawn("npm", ["install"], {
				cwd: targetDir,
				stdio: "ignore",
				shell: true,
			});
			child.on("close", (code) => {
				if (code === 0) resolve();
				else reject(new Error("npm install failed"));
			});
		});
		s.stop("Dependencies installed.");
	}

	outro(`You're all set!`);

	console.log(
		`  ${chalk.gray("Run the following commands to get started:")}`,
	);
	console.log(`\n    ${chalk.cyan("cd")} ${projectName}`);
	if (!shouldInstall) console.log(`    ${chalk.cyan("npm install")}`);
	console.log(`    ${chalk.cyan("npm run dev")}`);
	console.log();
	process.exit(0);
}

run().catch((error) => {
	console.error(chalk.red("An error occurred:"), error);
	process.exit(1);
});
