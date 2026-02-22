import { rename, rm, stat, symlink } from "node:fs/promises";
import {
  fileExists,
  logger,
  readTextFile,
  writeTextFile,
} from "@felixarntz/cli-utils";
import { getWorkflowCommandsContent } from "./assets/workflow-commands.js";
import {
  prependBeforeUltraciteHeader,
  removeQuickReferenceSection,
  replaceUltraciteFixCommand,
} from "./utils/agents-md.js";
import { exec } from "./utils/exec.js";

export async function setupFoundation(): Promise<void> {
  logger.info("Setting up foundation...");

  await exec(
    "npx create-next-app . --ts --app --tailwind --use-bun --biome --yes"
  );
  await exec(
    "npx ultracite init --pm bun --linter biome --frameworks next --editors cursor vscode --agents claude --hooks claude --integrations husky"
  );

  logger.info("Configuring AGENTS.md...");
  await rename(".claude/CLAUDE.md", "AGENTS.md");
  await symlink("AGENTS.md", "CLAUDE.md");

  logger.info("Fixing pre-commit setup...");
  const huskyDirPath = ".husky/_";
  try {
    const stats = await stat(huskyDirPath);
    if (stats.isDirectory()) {
      await rm(huskyDirPath, { recursive: true });
    }
  } catch {
    /* doesn't exist, ignore */
  }

  if (await fileExists(".husky/pre-commit")) {
    let preCommit = await readTextFile(".husky/pre-commit");
    if (preCommit.startsWith("npm test\n")) {
      const lines = preCommit.split("\n");
      preCommit = lines.slice(2).join("\n");
      await writeTextFile(".husky/pre-commit", preCommit);
    }
  }

  logger.info("Fixing package.json scripts...");
  await exec("npm pkg delete scripts.lint");
  await exec("npm pkg delete scripts.format");
  await exec('npm pkg set scripts.doctor="ultracite doctor"');

  logger.info("Updating AGENTS.md...");
  let agentsMd = await readTextFile("AGENTS.md");
  agentsMd = removeQuickReferenceSection(agentsMd);
  agentsMd = replaceUltraciteFixCommand(agentsMd);
  agentsMd = prependBeforeUltraciteHeader({
    content: agentsMd,
    prepend: getWorkflowCommandsContent(),
  });
  await writeTextFile("AGENTS.md", agentsMd);

  logger.success("Foundation setup complete.");
}
