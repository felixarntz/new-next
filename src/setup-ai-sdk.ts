import { logger, readTextFile, writeTextFile } from "@felixarntz/cli-utils";
import { exec } from "./utils/exec.js";
import { prependBeforeUltraciteHeader } from "./utils/agents-md.js";
import { getAiSdkGuidelinesContent } from "./assets/ai-sdk-guidelines.js";

export async function setupAiSdk(): Promise<void> {
  logger.info("Setting up AI SDK...");

  await exec("bun add ai @ai-sdk/react zod");

  logger.info("Updating AGENTS.md for AI SDK...");
  let agentsMd = await readTextFile("AGENTS.md");
  agentsMd = prependBeforeUltraciteHeader({
    content: agentsMd,
    prepend: getAiSdkGuidelinesContent(),
  });
  await writeTextFile("AGENTS.md", agentsMd);

  logger.success("AI SDK setup complete.");
}
