import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { nativeTargetName } from "./platform.js";

type BuildTarget = {
    bunTarget: string;
    outputName: string;
};

const targets = {
    "windows-x64": { bunTarget: "bun-windows-x64", outputName: "postgres-read-windows-x64.exe" },
    "linux-x64": { bunTarget: "bun-linux-x64", outputName: "postgres-read-linux-x64" },
    "linux-arm64": { bunTarget: "bun-linux-arm64", outputName: "postgres-read-linux-arm64" },
    "macos-x64": { bunTarget: "bun-darwin-x64", outputName: "postgres-read-macos-x64" },
    "macos-arm64": { bunTarget: "bun-darwin-arm64", outputName: "postgres-read-macos-arm64" },
} satisfies Record<string, BuildTarget>;

type TargetName = keyof typeof targets;

function currentTarget(): TargetName {
    const target = nativeTargetName(process.platform, process.arch);
    if (!(target in targets)) {
        throw new Error(`Unsupported build platform: ${process.platform}/${process.arch}`);
    }
    return target as TargetName;
}

const requested = process.argv.slice(2).filter((argument) => argument !== "--");
const selectedTargets: TargetName[] = requested.includes("all")
    ? Object.keys(targets) as TargetName[]
    : requested.length > 0
        ? requested as TargetName[]
        : [currentTarget()];

const distDirectory = resolve(import.meta.dir, "..", "dist");
mkdirSync(distDirectory, { recursive: true });

for (const targetName of selectedTargets) {
    const target = targets[targetName];
    if (!target) {
        throw new Error(`Unknown build target "${targetName}". Choose: ${Object.keys(targets).join(", ")}`);
    }

    const outputPath = resolve(distDirectory, target.outputName);
    console.log(`Building ${targetName} -> dist/${target.outputName}`);
    const result = Bun.spawnSync([
        process.execPath,
        "build",
        "--compile",
        "--minify",
        "--sourcemap=external",
        `--target=${target.bunTarget}`,
        `--outfile=${outputPath}`,
        resolve(import.meta.dir, "..", "index.ts"),
    ], {
        stdout: "inherit",
        stderr: "inherit",
    });

    if (result.exitCode !== 0) {
        process.exit(result.exitCode);
    }
}
