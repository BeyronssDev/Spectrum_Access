import { rm, mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, "../../..");
const entryPoint = path.join(repoRoot, "packages/functions/src/index.ts");
const deployDir = path.join(repoRoot, "firebase-functions-deploy");
const outfile = path.join(deployDir, "index.js");

const packageJson = {
  name: "@accessibilitat/functions-deploy",
  private: true,
  type: "module",
  main: "index.js",
  engines: {
    node: "22"
  },
  dependencies: {
    "firebase-admin": "13.10.0",
    "firebase-functions": "7.2.5"
  }
};

await rm(deployDir, { recursive: true, force: true });
await mkdir(deployDir, { recursive: true });

await build({
  entryPoints: [entryPoint],
  outfile,
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  legalComments: "none",
  external: [
    "firebase-admin",
    "firebase-admin/*",
    "firebase-functions",
    "firebase-functions/*"
  ]
});

await writeFile(
  path.join(deployDir, "package.json"),
  `${JSON.stringify(packageJson, null, 2)}\n`
);

await new Promise((resolve, reject) => {
  const child = spawn(
    "pnpm",
    ["install", "--prod", "--ignore-workspace", "--no-lockfile", "--ignore-scripts"],
    {
      cwd: deployDir,
      stdio: "inherit"
    }
  );

  child.once("error", reject);
  child.once("exit", (code) => {
    if (code === 0) {
      resolve();
      return;
    }

    reject(new Error(`pnpm install for Firebase Functions deploy failed with code ${code}`));
  });
});
