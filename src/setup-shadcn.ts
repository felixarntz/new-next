import { logger, readTextFile, writeTextFile } from "@felixarntz/cli-utils";
import { getShadcnGuidelinesContent } from "./assets/shadcn-guidelines.js";
import { prependBeforeUltraciteHeader } from "./utils/agents-md.js";
import { exec } from "./utils/exec.js";

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
  await writeTextFile("biome.json", `${JSON.stringify(biome, null, 2)}\n`);

  logger.info("Excluding components/ui from TypeScript...");
  const tsconfigRaw = await readTextFile("tsconfig.json");
  const tsconfig = JSON.parse(tsconfigRaw);
  tsconfig.exclude ??= [];
  tsconfig.exclude.push("components/ui");
  await writeTextFile(
    "tsconfig.json",
    `${JSON.stringify(tsconfig, null, 2)}\n`
  );

  logger.info("Updating AGENTS.md for shadcn...");
  let agentsMd = await readTextFile("AGENTS.md");
  agentsMd = prependBeforeUltraciteHeader({
    content: agentsMd,
    prepend: getShadcnGuidelinesContent(),
  });
  await writeTextFile("AGENTS.md", agentsMd);

  logger.success("shadcn setup complete.");
}
