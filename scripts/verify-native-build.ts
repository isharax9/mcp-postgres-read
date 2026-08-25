import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { nativeExecutableName, nativeTargetName } from "./platform.js";

const target = nativeTargetName(process.platform, process.arch);
const executable = resolve(
    import.meta.dir,
    "..",
    "dist",
    nativeExecutableName(process.platform, process.arch),
);

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

console.log(`Native executable check passed: ${target}`);
