import { existsSync } from "node:fs";
import { resolve } from "node:path";

const platform = process.platform === "darwin" ? "macos" : process.platform;
const extension = process.platform === "win32" ? ".exe" : "";
const executable = resolve(import.meta.dir, "..", "dist", `postgres-read-${platform}-${process.arch}${extension}`);

if (!existsSync(executable)) {
    throw new Error(`Native build not found: ${executable}`);
}

const result = Bun.spawnSync([executable, "--help"], {
    stdout: "inherit",
    stderr: "inherit",
});

if (result.exitCode !== 0) {
    process.exit(result.exitCode);
}

console.log(`Native executable check passed: ${platform}-${process.arch}`);
