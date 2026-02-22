import { logger, readTextFile, writeTextFile } from "@felixarntz/cli-utils";
import { exec } from "./utils/exec.js";
import { prependBeforeUltraciteHeader } from "./utils/agents-md.js";
import { getShadcnGuidelinesContent } from "./assets/shadcn-guidelines.js";

export async function setupShadcn(): Promise<void> {
  logger.info("Setting up shadcn...");

  await exec(
    "bunx --bun shadcn@latest init --template next --base-color neutral --yes"
  );

  logger.info("Updating biome.json for shadcn...");
  const biomeRaw = await readTextFile("biome.json");
  const biome = JSON.parse(biomeRaw);
  biome.files ??= {};
  biome.files.includes ??= [];
  biome.files.includes.push("!lib/utils.ts", "!components/ui");
  await writeTextFile("biome.json", JSON.stringify(biome, null, 2) + "\n");

  logger.info("Updating AGENTS.md for shadcn...");
  let agentsMd = await readTextFile("AGENTS.md");
  agentsMd = prependBeforeUltraciteHeader({
    content: agentsMd,
    prepend: getShadcnGuidelinesContent(),
  });
  await writeTextFile("AGENTS.md", agentsMd);

  logger.success("shadcn setup complete.");
}
