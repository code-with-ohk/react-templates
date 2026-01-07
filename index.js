#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import degit from "degit";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import {
	CATEGORIES,
	TEMPLATE_NAMES,
	AVAILABLE_TEMPLATES,
} from "./templates.js";

const GITHUB_REPO = "code-with-ohk/react-templates";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Available categories/subfolders
const templates = AVAILABLE_TEMPLATES;

async function run() {
	console.log(chalk.bold.cyan("\n✨ Create React Template\n"));

	const args = process.argv.slice(2);
	let projectName = null;
	let chosenTemplate = null;

	const findFlag = (flag) => args.findIndex((arg) => arg === flag);

	const handleFlag = (flagIndex, categoryPath) => {
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
			}
		}
		return false;
	};

	let flagHandled = false;
	for (const cat of CATEGORIES) {
		const flagIndex = findFlag(cat.flag);
		if (handleFlag(flagIndex, cat.path)) {
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
		const { name } = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "Project name:",
				default: "my-project",
				validate: (input) => {
					if (/^([A-Za-z0-9\-\_\.]+)$/.test(input)) return true;
					return "Project name may only include letters, numbers, underscores, hashes and dots.";
				},
			},
		]);
		projectName = name;
	}

	const targetDir = path.resolve(process.cwd(), projectName);
	if (fs.existsSync(targetDir)) {
		console.error(chalk.red(`Directory ${projectName} already exists.`));
		process.exit(1);
	}

	// --- Interactive Mode ---
	if (!chosenTemplate) {
		const { category } = await inquirer.prompt([
			{
				type: "list",
				name: "category",
				message: "Select a variant:",
				choices: CATEGORIES.map((cat) => ({
					name: cat.name,
					value: cat.value,
				})),
				loop: false,
			},
		]);

		const templateChoices = templates[category];

		const { selectedTemplate } = await inquirer.prompt([
			{
				type: "list",
				name: "selectedTemplate",
				message: "Select a template:",
				choices: templateChoices.map((t) => ({
					name: TEMPLATE_NAMES[t] || t,
					value: t,
				})),
				loop: false,
			},
		]);
		chosenTemplate = path.posix.join(
			CATEGORIES.find((c) => c.value === category).path,
			selectedTemplate
		);
	}

	const templateSource = `${GITHUB_REPO}/${chosenTemplate}`;

	console.log(`\nScaffolding project in ${chalk.cyan(targetDir)}...`);

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
	} catch (error) {
		console.error(chalk.red(`Error scaffolding: ${error.message}`));
		process.exit(1);
	}

	console.log(chalk.green("\nDone."));

	const { install } = await inquirer.prompt([
		{
			type: "confirm",
			name: "install",
			message: "Install dependencies now?",
			default: true,
		},
	]);

	if (install) {
		console.log(chalk.gray("\nInstalling dependencies..."));
		await new Promise((resolve, reject) => {
			const child = spawn("npm", ["install"], {
				cwd: targetDir,
				stdio: "inherit",
				shell: true,
			});
			child.on("close", (code) => {
				if (code === 0) resolve();
				else reject(new Error("npm install failed"));
			});
		});
	}

	console.log(chalk.green("\nYou're all set!"));
	console.log(`\n  cd ${projectName}`);
	if (!install) console.log("  npm install");
	console.log("  npm run dev");
	console.log();
	process.exit(0);
}

run().catch((error) => {
	console.error(chalk.red("An error occurred:"), error);
	process.exit(1);
});
