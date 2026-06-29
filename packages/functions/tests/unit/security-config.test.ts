import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function repoFile(path: string): string {
  return readFileSync(new URL(`../../../../${path}`, import.meta.url), "utf8");
}

describe("security configuration", () => {
  it("sets browser security headers for Firebase Hosting", () => {
    const firebaseConfig = JSON.parse(repoFile("firebase.json")) as {
      hosting?: { headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }> };
    };
    const headerBlock = firebaseConfig.hosting?.headers?.find((entry) => entry.source === "**");
    const headers = new Map(headerBlock?.headers.map((header) => [header.key, header.value]));

    expect(headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(headers.get("Content-Security-Policy")).toContain("object-src 'none'");
    expect(headers.get("Content-Security-Policy")).not.toContain("'unsafe-eval'");
    expect(headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("keeps Firebase Functions deploys lockfile-backed and script-safe", () => {
    const prepareDeploy = repoFile("packages/functions/scripts/prepare-deploy.mjs");

    expect(prepareDeploy).toContain("--lockfile-only");
    expect(prepareDeploy).toContain("--frozen-lockfile");
    expect(prepareDeploy).toContain("--ignore-scripts");
    expect(prepareDeploy).not.toContain("--no-lockfile");
  });

  it("does not sign Android release builds with the debug key", () => {
    const androidBuild = repoFile("apps/mobile/android/app/build.gradle.kts");

    expect(androidBuild).toContain("create(\"release\")");
    expect(androidBuild).toContain("signingConfig = signingConfigs.getByName(\"release\")");
    expect(androidBuild).not.toContain("signingConfig = signingConfigs.getByName(\"debug\")");
  });
});
