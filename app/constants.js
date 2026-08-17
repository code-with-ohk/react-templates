import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// templates folder is in the parent directory of app/ which is root
export const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

export const ADDONS = [
	{
		label: "Tailwind CSS",
		value: "tailwind",
		hint: "Utility-first CSS framework",
	},
	{
		label: "Shadcn UI",
		value: "shadcn",
		hint: "Component library (auto-adds Tailwind)",
	},
	{
		label: "TanStack Query",
		value: "tanstack-query",
		hint: "Server-state data fetching + caching",
	},
	{
		label: "Routing",
		value: "router",
		hint: "React Router or TanStack Router family",
	},
	{
		label: "Forms",
		value: "forms",
		hint: "React Hook Form or TanStack Form",
	},
	{ label: "Authentication", value: "auth", hint: "Clerk or Supabase" },
	{
		label: "Code Quality (Prettier + Lint-Staged + Husky)",
		value: "code-quality",
		hint: "Auto-format + lint on every git commit",
	},
];

export const ROUTERS = [
	{
		label: "React Router (Framework / Remix-style)",
		value: "react-router-framework",
		hint: "Full-stack: SSR, SEO, loaders, server actions",
	},
	{
		label: "React Router (Lightweight SPA)",
		value: "react-router",
		hint: "Client-only, file-based pages, simplest setup",
	},
	{
		label: "TanStack Start (Latest)",
		value: "tanstack-start",
		hint: "Full-stack: SSR + type-safe routes, server functions",
	},
	{
		label: "TanStack Router (File-based SPA)",
		value: "tanstack-router",
		hint: "Client-only, fully type-safe route codegen",
	},
];

// NOTE: `computeQueries(addons)` provides the boolean flags used by templates.
/**
 * Compute the boolean `queries` object used by templates.
 * Accepts an array of selected addon keys (strings).
 */
export function computeQueries(addons = []) {
	return {
		tailwind: addons.includes("tailwind"),
		shadcn: addons.includes("shadcn"),
		// routers
		reactRouter: addons.includes("react-router"),
		reactRouterFramework: addons.includes("react-router-framework"),
		tanstackRouter: addons.includes("tanstack-router"),
		tanstackStart: addons.includes("tanstack-start"),
		// other
		tanstackQuery: addons.includes("tanstack-query"),
		// forms
		formsRHFZod: addons.includes("forms-rhf-zod"),
		formsTanstack: addons.includes("forms-tanstack"),
		// auth
		authClerk: addons.includes("auth-clerk"),
		authSupabase: addons.includes("auth-supabase"),
	};
}
