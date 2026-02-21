import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// templates folder is in the parent directory of app/ which is root
export const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

export const ADDONS = [
	{ label: "Tailwind CSS", value: "tailwind" },
	{ label: "Shadcn UI", value: "shadcn" },
];
