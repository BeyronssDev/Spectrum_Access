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
  packageManager: "pnpm@11.1.2",
  engines: {
    node: "22"
  },
  dependencies: {
    "@google-cloud/functions-framework": "5.0.5",
    "firebase-admin": "13.10.0",
    "firebase-functions": "7.2.5",
    "nodemailer": "9.0.3"
  }
};

const pnpmWorkspace = `packages: []

onlyBuiltDependencies:
  - "@firebase/util"
  - "protobufjs"
allowBuilds:
  "@firebase/util": true
  protobufjs: true
`;

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
await writeFile(path.join(deployDir, "pnpm-workspace.yaml"), pnpmWorkspace);

async function runPnpm(args) {
  await new Promise((resolve, reject) => {
    const child = spawn("pnpm", args, {
      cwd: deployDir,
      stdio: "inherit"
    });

    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`pnpm ${args.join(" ")} for Firebase Functions deploy failed with code ${code}`));
    });
  });
}

await runPnpm(["install", "--prod", "--ignore-workspace", "--lockfile-only", "--ignore-scripts"]);
await runPnpm(["install", "--prod", "--ignore-workspace", "--frozen-lockfile", "--ignore-scripts"]);
