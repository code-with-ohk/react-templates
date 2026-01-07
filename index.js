#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import degit from "degit";

const GITHUB_REPO = "code-with-ohk/react-templates";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMPLATE_NAMES = {
	vanilla: "Vanilla",
	tw: "Tailwind CSS",
	"tw-shadcn": "Tailwind CSS + Shadcn UI",
};

// The folders we care about
const getTemplatesFromDir = (dir) => {
	const templateDir = path.join(__dirname, dir);
	if (!fs.existsSync(templateDir)) {
		return [];
	}
	return fs
		.readdirSync(templateDir)
		.filter((file) =>
			fs.statSync(path.join(templateDir, file)).isDirectory()
		);
};

// Available categories/subfolders
const jsTemplates = getTemplatesFromDir("js");
const tsTemplates = getTemplatesFromDir("ts");

async function run() {
	console.log(chalk.blue("Creating a new React app..."));

	const args = process.argv.slice(2);
	let projectName = null;
	let chosenTemplate = null;

	const findFlag = (flag) => args.findIndex((arg) => arg === flag);
	const jsFlagIndex = findFlag("--js");
	const tsFlagIndex = findFlag("--ts");

	const handleFlag = (flagIndex, category) => {
		if (flagIndex !== -1) {
			if (args[flagIndex + 1] && !args[flagIndex + 1].startsWith("--")) {
				const templateName = args[flagIndex + 1];
				chosenTemplate = path.posix.join(category, templateName);
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

	if (!handleFlag(jsFlagIndex, "js") && !handleFlag(tsFlagIndex, "ts")) {
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
				choices: [
					{ name: chalk.yellow("JavaScript"), value: "js" },
					{ name: chalk.blue("TypeScript"), value: "ts" },
				],
				loop: false,
			},
		]);

		let templateChoices;
		if (category === "js") {
			templateChoices = jsTemplates;
		} else {
			templateChoices = tsTemplates;
		}

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
		chosenTemplate = path.posix.join(category, selectedTemplate);
	}

	const templateSource = `${GITHUB_REPO}/${chosenTemplate}`;

	console.log(`\nCreating a new React app in ${chalk.green(targetDir)}.`);
	console.log(
		`Using template: ${chalk.cyan(chosenTemplate)} from ${chalk.cyan(
			GITHUB_REPO
		)}\n`
	);

	try {
		const emitter = degit(templateSource, {
			cache: false,
			force: true,
		});

		await emitter.clone(targetDir);
	} catch (error) {
		console.error(chalk.red(`Error cloning template: ${error.message}`));
		process.exit(1);
	}

	console.log(chalk.green("Success! Created project at " + projectName));
	console.log("Inside that directory, you can run several commands:");
	console.log();
	console.log(chalk.cyan("  npm install"));
	console.log("    Installs dependencies.");
	console.log();
	console.log(chalk.cyan("  npm run dev"));
	console.log("    Starts the development server.");
	console.log();
	console.log("To get started, run the following commands:");
	console.log();
	console.log(chalk.cyan("  cd"), projectName);
	console.log(`  ${chalk.cyan("npm install")}`);
	console.log(`  ${chalk.cyan("code .")}`);
	console.log();
	process.exit(0);
}

run().catch((error) => {
	console.error(chalk.red("An error occurred:"), error);
	process.exit(1);
});
