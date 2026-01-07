#!/usr/bin/env node

// Suppress Node.js 25+ warning about localStorage (triggered by degit/debug)
const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
	if (
		name === "warning" &&
		typeof data === "object" &&
		data.name === "Warning" &&
		data.message.includes("--localstorage-file")
	) {
		return false;
	}
	return originalEmit.apply(process, [name, data, ...args]);
};

import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import {
	intro,
	outro,
	text,
	select,
	confirm,
	spinner,
	isCancel,
	cancel,
} from "@clack/prompts";
import {
	CATEGORIES,
	TEMPLATE_NAMES,
	AVAILABLE_TEMPLATES,
} from "./templates.js";

const degit = (await import("degit")).default;

const GITHUB_REPO = "code-with-ohk/react-templates";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Available categories/subfolders
const templates = AVAILABLE_TEMPLATES;

async function run() {
	intro(
		chalk.bgCyan(chalk.black(" create-react-template ")) +
			chalk.dim(" (Ctrl+C to cancel)")
	);

	const args = process.argv.slice(2);
	let projectName = null;
	let chosenTemplate = null;
	let preselectedCategory = null;

	const findFlag = (flag) => args.findIndex((arg) => arg === flag);

	const handleFlag = (flagIndex, categoryPath, categoryValue) => {
		if (flagIndex !== -1) {
			if (args[flagIndex + 1] && !args[flagIndex + 1].startsWith("--")) {
				const templateName = args[flagIndex + 1];
				chosenTemplate = path.posix.join(categoryPath, templateName);
				projectName = args.filter(
					(_, i) => i !== flagIndex && i !== flagIndex + 1
				)[0];
				return true;
			} else {
				projectName = args.filter((_, i) => i !== flagIndex)[0];
				preselectedCategory = categoryValue;
				return true;
			}
		}
		return false;
	};

	let flagHandled = false;
	for (const cat of CATEGORIES) {
		const flagIndex = findFlag(cat.flag);
		if (handleFlag(flagIndex, cat.path, cat.value)) {
			flagHandled = true;
			break;
		}
	}

	if (!flagHandled) {
		if (args.length > 0 && !args[0].startsWith("--")) {
			projectName = args[0];
		}
	}

	// --- Project Name Check ---
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

	// --- Interactive Mode ---
	if (!chosenTemplate) {
		let category = preselectedCategory;

		if (!category) {
			const selectedCategory = await select({
				message: "Select a language",
				options: CATEGORIES.map((cat) => ({
					label: cat.name,
					value: cat.value,
				})),
			});

			if (isCancel(selectedCategory)) {
				cancel("Operation cancelled.");
				process.exit(0);
			}
			category = selectedCategory;
		}

		const templateChoices = templates[category];

		const selectedTemplate = await select({
			message: "Select a template",
			options: templateChoices.map((t) => ({
				label: TEMPLATE_NAMES[t] || t,
				value: t,
			})),
		});

		if (isCancel(selectedTemplate)) {
			cancel("Operation cancelled.");
			process.exit(0);
		}

		chosenTemplate = path.posix.join(
			CATEGORIES.find((c) => c.value === category).path,
			selectedTemplate
		);
	}

	const templateSource = `${GITHUB_REPO}/${chosenTemplate}`;
	const s = spinner();

	s.start(`Scaffolding project in ${chalk.cyan(targetDir)}`);

	try {
		// If --local flag is passed, copy from local filesystem (for development)
		// Note: This only works if you are running the script from within the source repo
		// because the templates (js/, ts/) are excluded from the npm package.
		if (args.includes("--local")) {
			const localTemplatePath = path.join(__dirname, chosenTemplate);
			if (!fs.existsSync(localTemplatePath)) {
				throw new Error(
					`Local template not found at ${localTemplatePath}`
				);
			}
			await fs.copy(localTemplatePath, targetDir);
		} else {
			const emitter = degit(templateSource, {
				cache: false,
				force: true,
			});
			await emitter.clone(targetDir);
		}
		s.stop(`Scaffolding complete.`);
	} catch (error) {
		s.stop(`Scaffolding failed.`);
		console.error(chalk.red(`Error: ${error.message}`));
		process.exit(1);
	}

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
				stdio: "ignore", // Suppress standard output for cleaner spinner
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
		`  ${chalk.gray("Run the following commands to get started:")}`
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
