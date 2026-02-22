import fs from "fs-extra";
import path from "path";
import ejs from "ejs";

/**
 * Recursively finds and processes all .ejs files in a directory.
 * Renders them with the provided data, saves them without the .ejs extension,
 * and deletes the original .ejs file.
 */
export async function processEjsTemplates(dir, data) {
	const files = await fs.readdir(dir);

	for (const file of files) {
		const fullPath = path.join(dir, file);
		const stat = await fs.stat(fullPath);

		if (stat.isDirectory()) {
			await processEjsTemplates(fullPath, data);
		} else if (fullPath.endsWith(".ejs")) {
			const content = await fs.readFile(fullPath, "utf-8");
			const rendered = ejs.render(content, data);

			const newPath = fullPath.replace(/\.ejs$/, "");
			await fs.writeFile(newPath, rendered);
			await fs.remove(fullPath);
		}
	}
}
