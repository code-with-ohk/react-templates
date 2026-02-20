import chalk from "chalk";

export const CATEGORIES = [
	{
		name: chalk.yellow("JavaScript"),
		value: "js",
		path: "js",
		flag: "--js",
	},
	{
		name: chalk.blue("TypeScript"),
		value: "ts",
		path: "ts",
		flag: "--ts",
	},
];

export const TEMPLATE_NAMES = {
	vanilla: "Vanilla",
	tw: "Tailwind CSS",
	"tw-shadcn": "Tailwind CSS + Shadcn UI",
	tsrf: "TanStack Router + Form",
};

export const AVAILABLE_TEMPLATES = {
	js: ["vanilla"],
	ts: ["vanilla", "tw", "tw-shadcn", "tsrf"],
};
