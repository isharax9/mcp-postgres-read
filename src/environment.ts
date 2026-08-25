import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseEnv } from "node:util";

export type Environment = Record<string, string | undefined>;

const entrypointPath = process.argv[1];
const PROJECT_ENV_PATH = entrypointPath
    ? resolve(dirname(entrypointPath), ".env")
    : resolve(import.meta.dir, "..", ".env");

export function readProjectEnvironment(path = PROJECT_ENV_PATH): Environment {
    if (!existsSync(path)) {
        return {};
    }

    return parseEnv(readFileSync(path, "utf8"));
}

export function getPreferredEnvironmentValue(
    key: string,
    projectEnvironment: Environment,
    runtimeEnvironment: Environment = process.env,
) {
    return projectEnvironment[key]?.trim() || runtimeEnvironment[key]?.trim();
}

export function getFirstEnvironmentValue(keys: string[], environment: Environment) {
    for (const key of keys) {
        const value = environment[key]?.trim();
        if (value) {
            return value;
        }
    }

    return undefined;
}
