#!/usr/bin/env node

import chalk from "chalk";
import { run } from "./cli.js";

run().catch((error) => {
	console.error(chalk.red("An error occurred:"), error);
	process.exit(1);
});
