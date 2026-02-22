import { logger, readTextFile, writeTextFile } from "@felixarntz/cli-utils";
import { exec } from "./utils/exec.js";

export async function setupAiElements(): Promise<void> {
  logger.info("Setting up AI Elements...");

  await exec("bunx --bun shadcn@latest add @ai-elements/all");

  logger.info("Updating biome.json for AI Elements...");
  const biomeRaw = await readTextFile("biome.json");
  const biome = JSON.parse(biomeRaw);
  biome.files ??= {};
  biome.files.includes ??= [];
  biome.files.includes.push("!components/ai-elements");
  await writeTextFile("biome.json", JSON.stringify(biome, null, 2) + "\n");

  logger.success("AI Elements setup complete.");
}
