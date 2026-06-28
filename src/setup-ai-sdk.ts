import { logger, readTextFile, writeTextFile } from "@felixarntz/cli-utils";
import { getAiSdkGuidelinesContent } from "./assets/ai-sdk-guidelines.js";
import { prependBeforeUltraciteHeader } from "./utils/agents-md.js";
import { exec } from "./utils/exec.js";
import type { PackageManagerOptions } from "./utils/package-manager.js";
import { getPackageManagerConfig } from "./utils/package-manager.js";

export async function setupAiSdk(opts: PackageManagerOptions): Promise<void> {
  const packageManager = getPackageManagerConfig(opts);

  logger.info("Setting up AI SDK and its agent skill...");

  await exec(`${packageManager.addCommand} ai @ai-sdk/react zod`);
  await exec(
    `${packageManager.skillsCommand} add vercel/ai --skill ai-sdk -y -a claude-code`
  );

  logger.info("Updating AGENTS.md for AI SDK...");
  let agentsMd = await readTextFile("AGENTS.md");
  agentsMd = prependBeforeUltraciteHeader({
    content: agentsMd,
    prepend: getAiSdkGuidelinesContent(),
  });
  await writeTextFile("AGENTS.md", agentsMd);

  logger.success("AI SDK setup complete.");
}
