import { describe, expect, test } from "bun:test";
import { nativeExecutableName, nativeTargetName } from "../scripts/platform.js";

describe("native release artifact names", () => {
    test("maps Windows to the Windows release name", () => {
        expect(nativeTargetName("win32", "x64")).toBe("windows-x64");
        expect(nativeExecutableName("win32", "x64")).toBe("postgres-read-windows-x64.exe");
    });

    test("maps macOS to the macOS release name", () => {
        expect(nativeTargetName("darwin", "arm64")).toBe("macos-arm64");
        expect(nativeExecutableName("darwin", "arm64")).toBe("postgres-read-macos-arm64");
    });

    test("keeps Linux release names unchanged", () => {
        expect(nativeTargetName("linux", "x64")).toBe("linux-x64");
        expect(nativeExecutableName("linux", "x64")).toBe("postgres-read-linux-x64");
    });
});
