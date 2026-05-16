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
	{ label: "Authentication", value: "auth" },
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

// Canonical addon keys that map to template folder names. Use these
// when computing boolean guards for EJS templates.
export const CANONICAL_ADDON_KEYS = [
	"react-router",
	"react-router-framework",
	"tanstack-router",
	"tanstack-start",
	"shadcn",
	"tailwind",
	"tanstack-query",
];

/**
 * Compute the boolean `queries` object used by templates.
 * Accepts an array of selected addon keys (strings).
 */
export function computeQueries(addons = []) {
	return {
		reactRouter: addons.includes("react-router"),
		reactRouterFramework: addons.includes("react-router-framework"),
		tanstackRouter: addons.includes("tanstack-router"),
		tanstackStart: addons.includes("tanstack-start"),
		shadcn: addons.includes("shadcn"),
		tailwind: addons.includes("tailwind"),
		tanstackQuery: addons.includes("tanstack-query"),
	};
}
