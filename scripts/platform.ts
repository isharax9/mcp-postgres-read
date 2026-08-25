export function releasePlatformName(platform: NodeJS.Platform) {
    if (platform === "darwin") return "macos";
    if (platform === "win32") return "windows";
    return platform;
}

export function nativeTargetName(platform: NodeJS.Platform, arch: string) {
    return `${releasePlatformName(platform)}-${arch}`;
}

export function nativeExecutableName(platform: NodeJS.Platform, arch: string) {
    const extension = platform === "win32" ? ".exe" : "";
    return `postgres-read-${nativeTargetName(platform, arch)}${extension}`;
}
