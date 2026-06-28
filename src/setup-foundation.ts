import { rm, stat, symlink, unlink } from "node:fs/promises";
import {
  fileExists,
  logger,
  readTextFile,
  writeTextFile,
} from "@felixarntz/cli-utils";
import { getWorkflowCommandsContent } from "./assets/workflow-commands.js";
import type { SetupOptions } from "./types.js";
import {
  prependBeforeUltraciteHeader,
  removeQuickReferenceSection,
  replaceUltraciteFixCommand,
} from "./utils/agents-md.js";
import { exec } from "./utils/exec.js";
import { getPackageManagerConfig } from "./utils/package-manager.js";

interface PackageJson {
  scripts?: Record<string, string>;
}

async function updatePackageJsonScripts(): Promise<void> {
  const packageJsonRaw = await readTextFile("package.json");
  const packageJson = JSON.parse(packageJsonRaw) as PackageJson;
  const scripts = Object.fromEntries(
    Object.entries(packageJson.scripts ?? {}).filter(
      ([scriptName]) => scriptName !== "lint" && scriptName !== "format"
    )
  );

  packageJson.scripts = {
    ...scripts,
    doctor: "ultracite doctor",
    typecheck: "tsc --noEmit",
  };

  await writeTextFile(
    "package.json",
    `${JSON.stringify(packageJson, null, 2)}\n`
  );
}

export async function setupFoundation(opts: SetupOptions): Promise<void> {
  const packageManager = getPackageManagerConfig(opts);
  const ultraciteSkillFlag = opts.skipSkills ? "--quiet" : "--install-skill";

  logger.info("Setting up foundation...");

  await exec(
    `npx create-next-app . --ts --app --tailwind ${packageManager.createNextAppFlag} --biome --yes`
  );
  await exec(
    `npx ultracite init --pm ${packageManager.name} --linter biome --frameworks next --editors cursor vscode --agents claude --hooks claude --integrations husky ${ultraciteSkillFlag}`
  );

  logger.info("Excluding .claude from Biome...");
  const biomeRaw = await readTextFile("biome.json");
  const biome = JSON.parse(biomeRaw);
  biome.files ??= {};
  biome.files.includes ??= [];
  biome.files.includes.push("!.claude");
  await writeTextFile("biome.json", `${JSON.stringify(biome, null, 2)}\n`);

  logger.info("Configuring AGENTS.md...");
  if (await fileExists("CLAUDE.md")) {
    // Next.js may scaffold this as "@AGENTS.md", but we don't want that.
    await unlink("CLAUDE.md");
  }
  const ultraciteMd = await readTextFile(".claude/CLAUDE.md");
  if (await fileExists("AGENTS.md")) {
    let existingAgentsMd = await readTextFile("AGENTS.md");
    existingAgentsMd = `${existingAgentsMd.trimEnd()}\n\n${ultraciteMd}`;
    await writeTextFile("AGENTS.md", existingAgentsMd);
  } else {
    await writeTextFile("AGENTS.md", ultraciteMd);
  }
  await symlink("AGENTS.md", "CLAUDE.md");
  await unlink(".claude/CLAUDE.md");

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
  await updatePackageJsonScripts();

  logger.info("Updating AGENTS.md...");
  let agentsMd = await readTextFile("AGENTS.md");
  agentsMd = removeQuickReferenceSection(agentsMd);
  agentsMd = replaceUltraciteFixCommand({
    content: agentsMd,
    fixCommand: packageManager.fixCommand,
  });
  agentsMd = prependBeforeUltraciteHeader({
    content: agentsMd,
    prepend: getWorkflowCommandsContent(opts),
  });
  await writeTextFile("AGENTS.md", agentsMd);

  logger.success("Foundation setup complete.");
}
