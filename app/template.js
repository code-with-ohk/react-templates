import fs from "fs-extra";
import path from "path";
import ejs from "ejs";

/**
 * Recursively finds and processes all .ejs files in a directory.
 * Renders them with the provided data, saves them without the .ejs extension,
 * and deletes the original .ejs file. After rendering, prunes empty folders
 * that can be left behind by conditional templates.
 */
export async function processEjsTemplates(dir, data) {
	async function processDirectory(currentDir, isRoot = false) {
		const files = await fs.readdir(currentDir);

		for (const file of files) {
			const fullPath = path.join(currentDir, file);
			const stat = await fs.stat(fullPath);

			if (stat.isDirectory()) {
				await processDirectory(fullPath);
			} else if (fullPath.endsWith(".ejs")) {
				const content = await fs.readFile(fullPath, "utf-8");
				const rendered = ejs.render(content, data);

				const newPath = fullPath.replace(/\.ejs$/, "");
				if (rendered.trim() === "") {
					await fs.remove(fullPath);
				} else {
					await fs.writeFile(newPath, rendered);
					await fs.remove(fullPath);
				}
			}
		}

		const remaining = await fs.readdir(currentDir);
		if (!isRoot && remaining.length === 0) {
			await fs.remove(currentDir);
		}
	}

	await processDirectory(dir, true);
}
