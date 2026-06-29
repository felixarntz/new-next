import { execFileSync } from "node:child_process";
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
  condenseUltraciteCodeStandardsSection,
  prependBeforeUltraciteHeader,
  removeQuickReferenceSection,
  replaceUltraciteFixCommand,
} from "./utils/agents-md.js";
import { exec } from "./utils/exec.js";
import { getPackageManagerConfig } from "./utils/package-manager.js";

interface PackageJson {
  scripts?: Record<string, string>;
}

interface BiomeConfig {
  plugins?: string[];
}

interface TsConfig {
  compilerOptions?: {
    types?: string[];
  };
}

const FELIXARNTZ_BIOME_PLUGIN_PATH =
  "./node_modules/@felixarntz/biome/rules/all.grit";
const FELIXARNTZ_BIOME_TYPES = "@felixarntz/biome/object-hasown";
const PNPM_BUILD_POLICY_PACKAGES = ["sharp", "unrs-resolver"] as const;
const PNPM_USER_AGENT_VERSION_RE = /\bpnpm\/(\d+)/;

function pushUnique(opts: { items: string[]; value: string }): void {
  if (!opts.items.includes(opts.value)) {
    opts.items.push(opts.value);
  }
}

function getPnpmMajorVersion(): number | null {
  const userAgent = process.env.npm_config_user_agent ?? "";
  const versionFromUserAgent = userAgent.match(PNPM_USER_AGENT_VERSION_RE)?.[1];
  if (versionFromUserAgent) {
    return Number.parseInt(versionFromUserAgent, 10);
  }

  try {
    const version = execFileSync("pnpm", ["--version", "--silent"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const majorVersion = Number.parseInt(version.split(".")[0] ?? "", 10);
    return Number.isNaN(majorVersion) ? null : majorVersion;
  } catch {
    return null;
  }
}

function getPnpmBuildPolicyContent(): string | null {
  const pnpmMajorVersion = getPnpmMajorVersion();
  if (pnpmMajorVersion !== null && pnpmMajorVersion < 10) {
    return null;
  }

  if (pnpmMajorVersion !== null && pnpmMajorVersion < 11) {
    const ignoredPackages = PNPM_BUILD_POLICY_PACKAGES.map(
      (packageName) => `  - ${packageName}`
    );
    return ["ignoredBuiltDependencies:", ...ignoredPackages, ""].join("\n");
  }

  const allowedPackages = PNPM_BUILD_POLICY_PACKAGES.map(
    (packageName) => `  ${packageName}: false`
  );
  return ["allowBuilds:", ...allowedPackages, ""].join("\n");
}

async function configurePnpmBuildPolicy(): Promise<void> {
  const pnpmBuildPolicyContent = getPnpmBuildPolicyContent();
  if (!pnpmBuildPolicyContent) {
    return;
  }

  if (await fileExists("pnpm-workspace.yaml")) {
    const existingPnpmWorkspace = await readTextFile("pnpm-workspace.yaml");
    if (existingPnpmWorkspace === pnpmBuildPolicyContent) {
      return;
    }
  }

  await writeTextFile("pnpm-workspace.yaml", pnpmBuildPolicyContent);
}

async function updatePackageJsonScripts(): Promise<void> {
  const packageJsonRaw = await readTextFile("package.json");
  const packageJson = JSON.parse(packageJsonRaw) as PackageJson;
  const scripts = Object.create(null) as Record<string, string>;
  for (const [scriptName, script] of Object.entries(
    packageJson.scripts ?? {}
  )) {
    if (scriptName !== "lint" && scriptName !== "format") {
      scripts[scriptName] = script;
    }
  }

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

async function updateBiomeConfigPlugins(): Promise<void> {
  const biomeRaw = await readTextFile("biome.json");
  const biome = JSON.parse(biomeRaw) as BiomeConfig;
  biome.plugins ??= [];
  pushUnique({
    items: biome.plugins,
    value: FELIXARNTZ_BIOME_PLUGIN_PATH,
  });
  await writeTextFile("biome.json", `${JSON.stringify(biome, null, 2)}\n`);
}

async function updateTsConfigTypes(): Promise<void> {
  const tsconfigRaw = await readTextFile("tsconfig.json");
  const tsconfig = JSON.parse(tsconfigRaw) as TsConfig;
  tsconfig.compilerOptions ??= {};
  tsconfig.compilerOptions.types ??= [];
  pushUnique({
    items: tsconfig.compilerOptions.types,
    value: FELIXARNTZ_BIOME_TYPES,
  });
  await writeTextFile(
    "tsconfig.json",
    `${JSON.stringify(tsconfig, null, 2)}\n`
  );
}

export async function setupFoundation(opts: SetupOptions): Promise<void> {
  const packageManager = getPackageManagerConfig(opts);
  const ultraciteSkillFlag = opts.skipSkills ? "--quiet" : "--install-skill";

  logger.info("Setting up foundation...");

  const skipInitialInstall =
    packageManager.name === "pnpm" ? " --skip-install" : "";
  await exec(
    `npx create-next-app . --ts --app --tailwind ${packageManager.createNextAppFlag} --biome --yes${skipInitialInstall}`
  );
  if (packageManager.name === "pnpm") {
    logger.info("Configuring PNPM build policy...");
    await configurePnpmBuildPolicy();

    logger.info("Installing PNPM dependencies...");
    await exec("pnpm install");
  }
  await exec(
    `npx ultracite init --pm ${packageManager.name} --linter biome --frameworks next --editors cursor vscode --agents claude --hooks claude --integrations husky ${ultraciteSkillFlag}`
  );

  if (await fileExists(".claude/settings.json")) {
    logger.info("Configuring Codex hooks...");
    const hooksJson = await readTextFile(".claude/settings.json");
    await writeTextFile(".codex/hooks.json", hooksJson);
  }

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
  agentsMd = condenseUltraciteCodeStandardsSection(agentsMd);
  agentsMd = replaceUltraciteFixCommand({
    content: agentsMd,
    fixCommand: packageManager.fixCommand,
  });
  agentsMd = prependBeforeUltraciteHeader({
    content: agentsMd,
    prepend: getWorkflowCommandsContent(opts),
  });
  await writeTextFile("AGENTS.md", agentsMd);

  logger.info("Installing @felixarntz/biome...");
  await exec(`${packageManager.devAddCommand} @felixarntz/biome`);

  logger.info("Configuring @felixarntz/biome...");
  await updateBiomeConfigPlugins();
  await updateTsConfigTypes();

  logger.success("Foundation setup complete.");
}
