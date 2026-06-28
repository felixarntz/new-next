import { logger, readTextFile, writeTextFile } from "@felixarntz/cli-utils";
import type { SetupOptions } from "./types.js";
import { exec } from "./utils/exec.js";
import { getPackageManagerConfig } from "./utils/package-manager.js";

export async function setupAiElements(opts: SetupOptions): Promise<void> {
  const packageManager = getPackageManagerConfig(opts);

  logger.info("Setting up AI Elements...");

  await exec(`${packageManager.shadcnCommand} add @ai-elements/all`);
  if (!opts.skipSkills) {
    await exec(
      `${packageManager.skillsCommand} add vercel/ai-elements --skill ai-elements -y -a claude-code`
    );
  }

  logger.info("Updating biome.json for AI Elements...");
  const biomeRaw = await readTextFile("biome.json");
  const biome = JSON.parse(biomeRaw);
  biome.files ??= {};
  biome.files.includes ??= [];
  biome.files.includes.push("!components/ai-elements");
  await writeTextFile("biome.json", `${JSON.stringify(biome, null, 2)}\n`);

  logger.info("Excluding components/ai-elements from TypeScript...");
  const tsconfigRaw = await readTextFile("tsconfig.json");
  const tsconfig = JSON.parse(tsconfigRaw);
  tsconfig.exclude ??= [];
  tsconfig.exclude.push("components/ai-elements");
  await writeTextFile(
    "tsconfig.json",
    `${JSON.stringify(tsconfig, null, 2)}\n`
  );

  logger.success("AI Elements setup complete.");
}
