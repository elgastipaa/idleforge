import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptsDir, "..");
const cacheDirs = [".next", ".next-dev", ".turbo"].map((dir) =>
  path.join(projectRoot, dir)
);

async function cleanNextCache() {
  for (const cacheDir of cacheDirs) {
    try {
      await fs.rm(cacheDir, { recursive: true, force: true });
      console.log(`Removed cache directory: ${path.basename(cacheDir)}`);
    } catch (error) {
      console.error(`Failed to remove cache directory: ${path.basename(cacheDir)}`);
      console.error(error);
      process.exitCode = 1;
    }
  }
}

await cleanNextCache();
