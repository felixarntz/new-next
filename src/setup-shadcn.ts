import { logger, readTextFile, writeTextFile } from "@felixarntz/cli-utils";
import { getShadcnGuidelinesContent } from "./assets/shadcn-guidelines.js";
import type { SetupOptions } from "./types.js";
import { prependBeforeUltraciteHeader } from "./utils/agents-md.js";
import { exec } from "./utils/exec.js";
import { getPackageManagerConfig } from "./utils/package-manager.js";

export async function setupShadcn(opts: SetupOptions): Promise<void> {
  const packageManager = getPackageManagerConfig(opts);

  logger.info("Setting up shadcn...");

  await exec(
    `${packageManager.shadcnCommand} init --template next --base radix --preset nova --no-monorepo --yes`
  );
  if (!opts.skipSkills) {
    await exec(
      `${packageManager.skillsCommand} add shadcn/ui --skill shadcn -y -a claude-code`
    );
  }

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
    prepend: getShadcnGuidelinesContent(opts),
  });
  await writeTextFile("AGENTS.md", agentsMd);

  logger.success("shadcn setup complete.");
}
