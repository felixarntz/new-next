export type ProjectPackageManager = "pnpm" | "bun";

export interface PackageManagerConfig {
  addCommand: string;
  createNextAppFlag: string;
  devAddCommand: string;
  fixCommand: string;
  name: ProjectPackageManager;
  shadcnCommand: string;
  skillsCommand: string;
  workflowCommands: {
    build: string;
    check: string;
    dev: string;
    doctor: string;
    fix: string;
    installPreference: string;
    note?: string;
    packageManager: string;
    start: string;
    typecheck: string;
  };
}

export interface PackageManagerOptions {
  packageManager: ProjectPackageManager;
}

const packageManagerConfigs = {
  pnpm: {
    addCommand: "pnpm add",
    createNextAppFlag: "--use-pnpm",
    devAddCommand: "pnpm add -D",
    fixCommand: "pnpm fix",
    name: "pnpm",
    shadcnCommand: "pnpm dlx shadcn@latest",
    skillsCommand: "pnpm dlx skills",
    workflowCommands: {
      build: "pnpm build",
      check: "pnpm check",
      dev: "pnpm dev",
      doctor: "pnpm doctor",
      fix: "pnpm fix",
      installPreference:
        "In general, default to using PNPM for package scripts and dependency management.",
      packageManager: "PNPM",
      start: "pnpm start",
      typecheck: "pnpm typecheck",
    },
  },
  bun: {
    addCommand: "bun add",
    createNextAppFlag: "--use-bun",
    devAddCommand: "bun add -d",
    fixCommand: "bun fix",
    name: "bun",
    shadcnCommand: "bunx --bun shadcn@latest",
    skillsCommand: "bunx skills",
    workflowCommands: {
      build: "bun run build",
      check: "bun check",
      dev: "bun dev",
      doctor: "bun run doctor",
      fix: "bun fix",
      installPreference: "In general, default to using Bun instead of Node.js.",
      note: "Note: `build` and `doctor` need `bun run` since they conflict with built-in bun commands.",
      packageManager: "Bun",
      start: "bun start",
      typecheck: "bun typecheck",
    },
  },
} as const satisfies Record<ProjectPackageManager, PackageManagerConfig>;

export function getPackageManagerConfig(
  opts: PackageManagerOptions
): PackageManagerConfig {
  return packageManagerConfigs[opts.packageManager];
}
