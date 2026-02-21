/* eslint-disable no-process-exit */
import {
	intro,
	outro,
	text,
	multiselect,
	confirm,
	spinner,
	isCancel,
	cancel,
} from "@clack/prompts";
import chalk from "chalk";
import path from "path";
import fs from "fs-extra";
import {
	copyBaseTemplate,
	applyAddon,
	installDependencies,
} from "./scaffold.js";
import { ADDONS } from "./constants.js";

export async function run() {
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

	// 2. Select Add-ons
	const addons = await multiselect({
		message: "Select additional features",
		options: ADDONS,
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
		await copyBaseTemplate(targetDir, "base");

		// B. Apply Add-ons
		for (const addon of addons) {
			s.message(`Adding ${addon}...`);
			await applyAddon(targetDir, addon);
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
		try {
			await installDependencies(targetDir);
			s.stop("Dependencies installed.");
		} catch (error) {
			s.stop("Dependency installation failed.");
			console.error(chalk.red(error.message));
			// Don't exit here, still show next steps
		}
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
