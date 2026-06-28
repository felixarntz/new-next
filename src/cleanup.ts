import { logger } from "@felixarntz/cli-utils";
import { exec } from "./utils/exec.js";
import type { PackageManagerOptions } from "./utils/package-manager.js";
import { getPackageManagerConfig } from "./utils/package-manager.js";

export async function cleanup(opts: PackageManagerOptions): Promise<void> {
  const packageManager = getPackageManagerConfig(opts);

  logger.info("Running cleanup...");
  await exec(packageManager.fixCommand);
  logger.success("Cleanup complete.");
}
