import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// templates folder is in the parent directory of app/ which is root
export const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

export const ADDONS = [
	{ label: "Tailwind CSS", value: "tailwind" },
	{ label: "Shadcn UI", value: "shadcn" },
	{ label: "TanStack Query", value: "tanstack-query" },
	{ label: "Forms", value: "forms" },
	{ label: "Routing", value: "router" },
];

export const ROUTERS = [
	{
		label: "React Router (Framework / Remix-style)",
		value: "react-router-framework",
	},
	{ label: "React Router (Lightweight SPA)", value: "react-router" },
	{ label: "TanStack Start (Latest)", value: "tanstack-start" },
	{ label: "TanStack Router (File-based SPA)", value: "tanstack-router" },
];
