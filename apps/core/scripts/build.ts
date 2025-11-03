import { $ } from "bun";

console.log("\n");
console.log("📦 Building promptsmith-ts");

await $`rm -rf dist`;
await $`tsc --project tsconfig.build.json`;

console.log("✅ Build complete!");
