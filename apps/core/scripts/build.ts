import { $ } from "bun";

console.log("\n");
console.log("📦 Building @promptsmith/core");

await $`rm -rf dist`;
await $`tsc --project tsconfig.build.json`;

console.log("✅ Build complete!");
